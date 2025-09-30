// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { RedisCacheService } from './redis-cache.service';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

interface LoadBalancerConfig {
  algorithm: 'round-robin' | 'least-connections' | 'ip-hash' | 'weighted-round-robin';
  healthCheckInterval: number;
  timeout: number;
}

@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);
  private readonly rateLimits = new Map<string, RateLimitConfig>();
  private readonly servers = new Map<string, number>();

  constructor(private readonly cacheService: RedisCacheService) {
    this.initializeRateLimits();
    this.initializeLoadBalancer();
  }

  private initializeRateLimits() {
    // API rate limiting
    this.rateLimits.set('api', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
      skipSuccessfulRequests: false,
      skipFailedRequests: true,
    });

    // Search rate limiting
    this.rateLimits.set('search', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30,
      skipSuccessfulRequests: false,
      skipFailedRequests: true,
    });

    // Upload rate limiting
    this.rateLimits.set('upload', {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 10,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
    });

    // Authentication rate limiting
    this.rateLimits.set('auth', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      skipSuccessfulRequests: true,
      skipFailedRequests: false,
    });
  }

  private initializeLoadBalancer() {
    // Initialize server pool
    this.servers.set('api-server-1', 1);
    this.servers.set('api-server-2', 1);
    this.servers.set('api-server-3', 1);
  }

  // Rate limiting implementation
  async checkRateLimit(
    identifier: string,
    endpoint: string
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const config = this.rateLimits.get(endpoint);
    if (!config) {
      return { allowed: true, remaining: Infinity, resetTime: Date.now() };
    }

    const key = `rate_limit:${endpoint}:${identifier}`;
    const windowStart = Math.floor(Date.now() / config.windowMs) * config.windowMs;
    const currentKey = `${key}:${windowStart}`;

    try {
      // Use Redis for distributed rate limiting
      const current = await this.incrementCounter(currentKey, config.windowMs);
      const remaining = Math.max(0, config.maxRequests - current);
      const resetTime = windowStart + config.windowMs;

      return {
        allowed: current <= config.maxRequests,
        remaining,
        resetTime,
      };
    } catch (error) {
      this.logger.error('Rate limit check failed:', error);
      return { allowed: true, remaining: Infinity, resetTime: Date.now() };
    }
  }

  // Distributed rate limiting with sliding window
  async checkSlidingWindowRateLimit(
    identifier: string,
    endpoint: string,
    windowMs: number,
    maxRequests: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const key = `sliding_rate:${endpoint}:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // This would use Redis sorted sets for sliding window
      // Simplified implementation for now
      const currentCount = await this.getSlidingWindowCount(key, windowStart, now);
      
      if (currentCount < maxRequests) {
        await this.addToSlidingWindow(key, now, windowMs);
      }

      const remaining = Math.max(0, maxRequests - currentCount);
      const resetTime = now + windowMs;

      return {
        allowed: currentCount < maxRequests,
        remaining,
        resetTime,
      };
    } catch (error) {
      this.logger.error('Sliding window rate limit check failed:', error);
      return { allowed: true, remaining: Infinity, resetTime: now };
    }
  }

  // Load balancing with health checks
  async getNextServer(algorithm: string = 'round-robin'): Promise<string> {
    const servers = Array.from(this.servers.keys());
    
    switch (algorithm) {
      case 'round-robin':
        return this.roundRobin(servers);
      case 'least-connections':
        return this.leastConnections(servers);
      case 'ip-hash':
        return this.ipHash(servers);
      case 'weighted-round-robin':
        return this.weightedRoundRobin(servers);
      default:
        return servers[0];
    }
  }

  private async roundRobin(servers: string[]): Promise<string> {
    const key = 'load_balancer:round_robin';
    const current = await this.cacheService.getL1(key) || 0;
    const index = current % servers.length;
    await this.cacheService.setL1(key, (current + 1) % servers.length, 3600);
    return servers[index];
  }

  private async leastConnections(servers: string[]): Promise<string> {
    let minConnections = Infinity;
    let selectedServer = servers[0];

    for (const server of servers) {
      const connections = await this.cacheService.getL1(`connections:${server}`) || 0;
      if (connections < minConnections) {
        minConnections = connections;
        selectedServer = server;
      }
    }

    return selectedServer;
  }

  private ipHash(servers: string[], clientIP?: string): string {
    if (!clientIP) return servers[0];
    
    const hash = this.hashString(clientIP);
    const index = hash % servers.length;
    return servers[index];
  }

  private async weightedRoundRobin(servers: string[]): Promise<string> {
    const weights = Array.from(this.servers.values());
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    const key = 'load_balancer:weighted';
    let current = await this.cacheService.getL1(key) || 0;
    
    current = (current + 1) % totalWeight;
    await this.cacheService.setL1(key, current, 3600);
    
    let cumulativeWeight = 0;
    for (let i = 0; i < servers.length; i++) {
      cumulativeWeight += weights[i];
      if (current < cumulativeWeight) {
        return servers[i];
      }
    }
    
    return servers[0];
  }

  // Health check for servers
  async healthCheck(server: string): Promise<boolean> {
    const key = `health:${server}`;
    const lastCheck = await this.cacheService.getL1(key);
    
    if (lastCheck && Date.now() - lastCheck < 30000) {
      return true;
    }

    try {
      // Simulate health check
      const isHealthy = Math.random() > 0.1; // 90% uptime simulation
      
      if (isHealthy) {
        await this.cacheService.setL1(key, Date.now(), 300);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      this.logger.error(`Health check failed for ${server}:`, error);
      return false;
    }
  }

  // Circuit breaker pattern
  async circuitBreaker(
    operation: () => Promise<any>,
    key: string,
    threshold = 5,
    timeout = 30000
  ): Promise<any> {
    const circuitKey = `circuit:${key}`;
    const failureCount = await this.cacheService.getL1(circuitKey) || 0;
    
    if (failureCount >= threshold) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await operation();
      
      if (failureCount > 0) {
        await this.cacheService.setL1(circuitKey, 0, timeout / 1000);
      }
      
      return result;
    } catch (error) {
      const newCount = failureCount + 1;
      await this.cacheService.setL1(circuitKey, newCount, timeout / 1000);
      throw error;
    }
  }

  // Connection pooling
  async manageConnections(server: string, delta: number): Promise<void> {
    const key = `connections:${server}`;
    const current = await this.cacheService.getL1(key) || 0;
    await this.cacheService.setL1(key, Math.max(0, current + delta), 300);
  }

  // Get load balancer metrics
  async getMetrics(): Promise<Record<string, any>> {
    const servers = Array.from(this.servers.keys());
    const metrics: Record<string, any> = {};

    for (const server of servers) {
      const connections = await this.cacheService.getL1(`connections:${server}`) || 0;
      const health = await this.healthCheck(server);
      
      metrics[server] = {
        connections,
        health,
        weight: this.servers.get(server),
      };
    }

    return metrics;
  }

  // Adaptive rate limiting based on server load
  async adaptiveRateLimit(
    identifier: string,
    baseLimit: number,
    serverLoad: number
  ): Promise<{ allowed: boolean; limit: number }> {
    const adjustedLimit = Math.floor(baseLimit * (1 - serverLoad / 100));
    const actualLimit = Math.max(adjustedLimit, 1);
    
    const result = await this.checkRateLimit(identifier, 'adaptive');
    return {
      allowed: result.allowed,
      limit: actualLimit,
    };
  }

  // Helper methods
  private async incrementCounter(key: string, ttl: number): Promise<number> {
    // This would use Redis INCR command
    const current = await this.cacheService.getL1(key) || 0;
    const newValue = current + 1;
    await this.cacheService.setL1(key, newValue, ttl / 1000);
    return newValue;
  }

  private async getSlidingWindowCount(key: string, start: number, end: number): Promise<number> {
    // This would use Redis ZCOUNT command
    // Simplified implementation
    return 0;
  }

  private async addToSlidingWindow(key: string, timestamp: number, ttl: number): Promise<void> {
    // This would use Redis ZADD command
    // Simplified implementation
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
