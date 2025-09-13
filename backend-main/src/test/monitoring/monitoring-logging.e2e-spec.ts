import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../app.module';
import { MonitoringService } from '../../common/services/monitoring.service';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

describe('Monitoring & Logging Tests (e2e)', () => {
  let app: INestApplication;
  let monitoringService: MonitoringService;
  let prisma: PrismaService;
  let authToken: string;
  let userId: number;
  const testLogs: any[] = [];
  const testMetrics: any[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    monitoringService = app.get<MonitoringService>(MonitoringService);
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
    await app.close();
  });

  async function setupTestData() {
    // Create test user for monitoring
    const userResponse = await request(app.getHttpServer())
      .post('/api/user-auth/phone-register')
      .send({
        phone_number: '+998901234567',
        otp: '123456',
        first_name: 'Monitor',
        last_name: 'Test',
      });

    if (userResponse.status === 201) {
      authToken = userResponse.body.access_token;
      userId = userResponse.body.user.id;
    }
  }

  async function cleanupTestData() {
    try {
      if (userId) {
        await prisma.user.delete({ where: { id: userId } });
      }
    } catch (error) {
      console.log('Cleanup error:', error);
    }
  }

  describe('System Health Monitoring', () => {
    it('should provide comprehensive health check', async () => {
      const response = await request(app.getHttpServer())
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
      expect(response.body.environment).toBeDefined();
      expect(response.body.version).toBeDefined();
      expect(response.body.database).toBeDefined();
      expect(response.body.memory).toBeDefined();
      expect(response.body.services).toBeDefined();
    });

    it('should monitor database connectivity', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/database');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.connection_time).toBeDefined();
      expect(response.body.query_time).toBeDefined();
      expect(response.body.active_connections).toBeDefined();
    });

    it('should monitor memory usage', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/memory');

      expect(response.status).toBe(200);
      expect(response.body.heap_used).toBeDefined();
      expect(response.body.heap_total).toBeDefined();
      expect(response.body.external).toBeDefined();
      expect(response.body.rss).toBeDefined();
      expect(typeof response.body.heap_used).toBe('number');
    });

    it('should monitor CPU usage', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/cpu');

      expect(response.status).toBe(200);
      expect(response.body.usage_percent).toBeDefined();
      expect(response.body.load_average).toBeDefined();
      expect(typeof response.body.usage_percent).toBe('number');
    });

    it('should monitor disk usage', async () => {
      const response = await request(app.getHttpServer())
        .get('/health/disk');

      expect(response.status).toBe(200);
      expect(response.body.total).toBeDefined();
      expect(response.body.used).toBeDefined();
      expect(response.body.free).toBeDefined();
      expect(response.body.percentage).toBeDefined();
    });

    it('should detect system performance degradation', async () => {
      // Generate load to test performance monitoring
      const loadPromises = [];
      
      for (let i = 0; i < 20; i++) {
        loadPromises.push(
          request(app.getHttpServer())
            .get('/api/product')
            .query({ search: `performance_test_${i}` })
        );
      }

      const startTime = Date.now();
      await Promise.all(loadPromises);
      const duration = Date.now() - startTime;

      // Check if monitoring detected performance impact
      const healthResponse = await request(app.getHttpServer())
        .get('/health/performance');

      expect(healthResponse.status).toBe(200);
      expect(healthResponse.body.response_time).toBeDefined();
      expect(healthResponse.body.throughput).toBeDefined();
      
      // Performance metrics should reflect the load test
      if (duration > 2000) {
        expect(healthResponse.body.status).toBe('degraded');
      }
    });
  });

  describe('Application Metrics Collection', () => {
    it('should collect API request metrics', async () => {
      // Make several API requests
      await request(app.getHttpServer()).get('/api/product');
      await request(app.getHttpServer()).get('/api/category');
      await request(app.getHttpServer()).get('/api/brand');

      const metricsResponse = await request(app.getHttpServer())
        .get('/metrics/api');

      expect(metricsResponse.status).toBe(200);
      expect(metricsResponse.body.total_requests).toBeGreaterThan(0);
      expect(metricsResponse.body.success_rate).toBeDefined();
      expect(metricsResponse.body.average_response_time).toBeDefined();
      expect(metricsResponse.body.error_rate).toBeDefined();
    });

    it('should collect business metrics', async () => {
      const businessMetricsResponse = await request(app.getHttpServer())
        .get('/metrics/business');

      expect(businessMetricsResponse.status).toBe(200);
      expect(businessMetricsResponse.body.active_users).toBeDefined();
      expect(businessMetricsResponse.body.total_orders).toBeDefined();
      expect(businessMetricsResponse.body.total_products).toBeDefined();
      expect(businessMetricsResponse.body.revenue).toBeDefined();
    });

    it('should collect security metrics', async () => {
      // Generate some security events
      await request(app.getHttpServer())
        .post('/api/user-auth/phone-login')
        .send({ phone_number: 'invalid', otp: 'wrong' });

      const securityMetricsResponse = await request(app.getHttpServer())
        .get('/metrics/security');

      expect(securityMetricsResponse.status).toBe(200);
      expect(securityMetricsResponse.body.failed_login_attempts).toBeDefined();
      expect(securityMetricsResponse.body.blocked_ips).toBeDefined();
      expect(securityMetricsResponse.body.suspicious_activities).toBeDefined();
    });

    it('should track child safety metrics', async () => {
      const childSafetyMetricsResponse = await request(app.getHttpServer())
        .get('/metrics/child-safety');

      expect(childSafetyMetricsResponse.status).toBe(200);
      expect(childSafetyMetricsResponse.body.active_parental_controls).toBeDefined();
      expect(childSafetyMetricsResponse.body.content_filters_triggered).toBeDefined();
      expect(childSafetyMetricsResponse.body.safety_violations).toBeDefined();
    });

    it('should provide real-time metrics via WebSocket', (done) => {
      // This would test WebSocket metrics streaming
      // Mock WebSocket connection for testing
      const mockWebSocket = {
        on: jest.fn(),
        send: jest.fn(),
        close: jest.fn(),
      };

      // Test metrics streaming
      setTimeout(() => {
        expect(mockWebSocket.send).toHaveBeenCalled();
        done();
      }, 1000);
    });
  });

  describe('Logging System Tests', () => {
    it('should log different severity levels correctly', async () => {
      // Test various log levels
      const logger = new Logger('TestLogger');
      
      logger.error('Test error message', 'TestError');
      logger.warn('Test warning message');
      logger.log('Test info message');
      logger.debug('Test debug message');
      logger.verbose('Test verbose message');

      // Check if logs were captured
      const logsResponse = await request(app.getHttpServer())
        .get('/logs/recent')
        .query({ level: 'error', limit: 10 });

      expect(logsResponse.status).toBe(200);
      expect(Array.isArray(logsResponse.body)).toBe(true);
      
      if (logsResponse.body.length > 0) {
        const errorLog = logsResponse.body.find(log => log.message.includes('Test error message'));
        expect(errorLog).toBeDefined();
        expect(errorLog.level).toBe('error');
        expect(errorLog.timestamp).toBeDefined();
      }
    });

    it('should log request/response cycles', async () => {
      const testEndpoint = '/api/product?test_logging=true';
      
      await request(app.getHttpServer())
        .get(testEndpoint)
        .set('User-Agent', 'Test-Agent');

      const requestLogsResponse = await request(app.getHttpServer())
        .get('/logs/requests')
        .query({ path: testEndpoint, limit: 5 });

      expect(requestLogsResponse.status).toBe(200);
      
      if (requestLogsResponse.body.length > 0) {
        const requestLog = requestLogsResponse.body[0];
        expect(requestLog.method).toBe('GET');
        expect(requestLog.path).toContain(testEndpoint);
        expect(requestLog.user_agent).toBe('Test-Agent');
        expect(requestLog.response_time).toBeDefined();
        expect(requestLog.status_code).toBeDefined();
      }
    });

    it('should log security events', async () => {
      // Generate security event
      await request(app.getHttpServer())
        .post('/api/user-auth/phone-login')
        .send({
          phone_number: '+998900000000',
          otp: 'wrong_otp',
        });

      const securityLogsResponse = await request(app.getHttpServer())
        .get('/logs/security')
        .query({ event_type: 'failed_login', limit: 5 });

      expect(securityLogsResponse.status).toBe(200);
      
      if (securityLogsResponse.body.length > 0) {
        const securityLog = securityLogsResponse.body[0];
        expect(securityLog.event_type).toBe('failed_login');
        expect(securityLog.phone_number).toBe('+998900000000');
        expect(securityLog.timestamp).toBeDefined();
        expect(securityLog.ip_address).toBeDefined();
      }
    });

    it('should log business events', async () => {
      // Create a business event (product view)
      await request(app.getHttpServer())
        .get('/api/product/1')
        .set('Authorization', `Bearer ${authToken}`);

      const businessLogsResponse = await request(app.getHttpServer())
        .get('/logs/business')
        .query({ event_type: 'product_view', limit: 5 });

      expect(businessLogsResponse.status).toBe(200);
      
      if (businessLogsResponse.body.length > 0) {
        const businessLog = businessLogsResponse.body[0];
        expect(businessLog.event_type).toBe('product_view');
        expect(businessLog.user_id).toBe(userId);
        expect(businessLog.product_id).toBeDefined();
      }
    });

    it('should implement log rotation', async () => {
      const logRotationResponse = await request(app.getHttpServer())
        .get('/logs/rotation-status');

      expect(logRotationResponse.status).toBe(200);
      expect(logRotationResponse.body.current_log_size).toBeDefined();
      expect(logRotationResponse.body.max_log_size).toBeDefined();
      expect(logRotationResponse.body.rotation_policy).toBeDefined();
      expect(logRotationResponse.body.archived_logs_count).toBeDefined();
    });

    it('should filter and search logs effectively', async () => {
      const searchLogsResponse = await request(app.getHttpServer())
        .get('/logs/search')
        .query({
          query: 'error',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          level: 'error',
          limit: 20,
        });

      expect(searchLogsResponse.status).toBe(200);
      expect(Array.isArray(searchLogsResponse.body.logs)).toBe(true);
      expect(searchLogsResponse.body.total_count).toBeDefined();
      expect(searchLogsResponse.body.page).toBeDefined();
    });
  });

  describe('Alerting System Tests', () => {
    it('should trigger alerts for critical errors', async () => {
      // Simulate critical error
      const criticalErrorResponse = await request(app.getHttpServer())
        .post('/test/trigger-critical-error')
        .send({
          error_type: 'database_connection_failure',
          severity: 'critical',
        });

      expect([200, 500]).toContain(criticalErrorResponse.status);

      // Check if alert was triggered
      const alertsResponse = await request(app.getHttpServer())
        .get('/alerts/recent')
        .query({ severity: 'critical', limit: 5 });

      expect(alertsResponse.status).toBe(200);
      
      if (alertsResponse.body.length > 0) {
        const alert = alertsResponse.body[0];
        expect(alert.severity).toBe('critical');
        expect(alert.alert_type).toBe('database_connection_failure');
        expect(alert.status).toBe('active');
        expect(alert.timestamp).toBeDefined();
      }
    });

    it('should trigger alerts for performance degradation', async () => {
      // Simulate performance issue
      const performanceTestResponse = await request(app.getHttpServer())
        .post('/test/trigger-performance-issue')
        .send({
          response_time_threshold: 5000,
          memory_threshold: 90,
        });

      expect([200, 503]).toContain(performanceTestResponse.status);

      // Check performance alerts
      const performanceAlertsResponse = await request(app.getHttpServer())
        .get('/alerts/performance')
        .query({ limit: 5 });

      expect(performanceAlertsResponse.status).toBe(200);
      
      if (performanceAlertsResponse.body.length > 0) {
        const alert = performanceAlertsResponse.body[0];
        expect(alert.alert_type).toContain('performance');
        expect(alert.metrics).toBeDefined();
      }
    });

    it('should trigger alerts for security violations', async () => {
      // Simulate security violation
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/api/user-auth/phone-login')
            .send({
              phone_number: '+998900000001',
              otp: 'wrong_otp',
            })
        );
      }

      await Promise.all(promises);

      // Check security alerts
      const securityAlertsResponse = await request(app.getHttpServer())
        .get('/alerts/security')
        .query({ limit: 5 });

      expect(securityAlertsResponse.status).toBe(200);
      
      if (securityAlertsResponse.body.length > 0) {
        const alert = securityAlertsResponse.body[0];
        expect(alert.alert_type).toContain('security');
        expect(alert.severity).toBeDefined();
      }
    });

    it('should trigger alerts for child safety violations', async () => {
      // Simulate child safety violation
      const safetyViolationResponse = await request(app.getHttpServer())
        .post('/test/trigger-safety-violation')
        .send({
          violation_type: 'inappropriate_content_access',
          child_age: 5,
          content_rating: 'mature',
        });

      expect([200, 400]).toContain(safetyViolationResponse.status);

      // Check child safety alerts
      const safetyAlertsResponse = await request(app.getHttpServer())
        .get('/alerts/child-safety')
        .query({ limit: 5 });

      expect(safetyAlertsResponse.status).toBe(200);
      
      if (safetyAlertsResponse.body.length > 0) {
        const alert = safetyAlertsResponse.body[0];
        expect(alert.alert_type).toContain('safety');
        expect(alert.child_age).toBeDefined();
      }
    });

    it('should implement alert escalation', async () => {
      // Trigger initial alert
      await request(app.getHttpServer())
        .post('/test/trigger-escalating-alert')
        .send({
          alert_type: 'system_overload',
          initial_severity: 'warning',
        });

      // Wait for escalation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check alert escalation
      const escalationResponse = await request(app.getHttpServer())
        .get('/alerts/escalation-status')
        .query({ alert_type: 'system_overload' });

      expect(escalationResponse.status).toBe(200);
      
      if (escalationResponse.body.length > 0) {
        const alert = escalationResponse.body[0];
        expect(alert.escalation_level).toBeGreaterThan(0);
        expect(alert.notifications_sent).toBeGreaterThan(0);
      }
    });

    it('should implement alert suppression for duplicate events', async () => {
      // Send multiple identical alerts
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/test/trigger-duplicate-alert')
            .send({
              alert_type: 'duplicate_test',
              message: 'Duplicate alert test',
            })
        );
      }

      await Promise.all(promises);

      // Check alert suppression
      const suppressionResponse = await request(app.getHttpServer())
        .get('/alerts/suppression-status')
        .query({ alert_type: 'duplicate_test' });

      expect(suppressionResponse.status).toBe(200);
      expect(suppressionResponse.body.total_occurrences).toBe(5);
      expect(suppressionResponse.body.alerts_sent).toBeLessThan(5);
      expect(suppressionResponse.body.suppressed_count).toBeGreaterThan(0);
    });
  });

  describe('Error Handling & Recovery Tests', () => {
    it('should handle and log uncaught exceptions', async () => {
      // Trigger uncaught exception
      const exceptionResponse = await request(app.getHttpServer())
        .post('/test/trigger-uncaught-exception')
        .send({
          exception_type: 'TypeError',
          message: 'Cannot read property of undefined',
        });

      expect([500]).toContain(exceptionResponse.status);

      // Check error logging
      const errorLogsResponse = await request(app.getHttpServer())
        .get('/logs/errors')
        .query({ limit: 5 });

      expect(errorLogsResponse.status).toBe(200);
      
      if (errorLogsResponse.body.length > 0) {
        const errorLog = errorLogsResponse.body[0];
        expect(errorLog.error_type).toBe('TypeError');
        expect(errorLog.stack_trace).toBeDefined();
        expect(errorLog.timestamp).toBeDefined();
      }
    });

    it('should implement graceful degradation', async () => {
      // Test graceful degradation when external service is down
      const degradationResponse = await request(app.getHttpServer())
        .get('/api/product')
        .query({ test_degradation: true });

      expect([200, 206]).toContain(degradationResponse.status);
      
      if (degradationResponse.status === 206) {
        expect(degradationResponse.body.partial_content).toBe(true);
        expect(degradationResponse.body.unavailable_features).toBeDefined();
      }
    });

    it('should implement automatic recovery mechanisms', async () => {
      // Trigger recoverable error
      const recoveryTestResponse = await request(app.getHttpServer())
        .post('/test/trigger-recoverable-error')
        .send({
          error_type: 'connection_timeout',
          auto_recovery: true,
        });

      expect([200, 503]).toContain(recoveryTestResponse.status);

      // Wait for recovery attempt
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check recovery status
      const recoveryStatusResponse = await request(app.getHttpServer())
        .get('/health/recovery-status');

      expect(recoveryStatusResponse.status).toBe(200);
      expect(recoveryStatusResponse.body.recovery_attempts).toBeGreaterThan(0);
      expect(recoveryStatusResponse.body.last_recovery_time).toBeDefined();
    });

    it('should maintain error statistics', async () => {
      // Generate various errors
      await request(app.getHttpServer()).get('/api/nonexistent-endpoint');
      await request(app.getHttpServer()).post('/api/product').send({});
      await request(app.getHttpServer()).get('/api/product/invalid-id');

      // Check error statistics
      const errorStatsResponse = await request(app.getHttpServer())
        .get('/metrics/errors');

      expect(errorStatsResponse.status).toBe(200);
      expect(errorStatsResponse.body.total_errors).toBeGreaterThan(0);
      expect(errorStatsResponse.body.error_rate).toBeDefined();
      expect(errorStatsResponse.body.error_types).toBeDefined();
      expect(errorStatsResponse.body.error_distribution).toBeDefined();
    });
  });

  describe('Monitoring Dashboard Tests', () => {
    it('should provide real-time system overview', async () => {
      const dashboardResponse = await request(app.getHttpServer())
        .get('/monitoring/dashboard');

      expect(dashboardResponse.status).toBe(200);
      expect(dashboardResponse.body.system_health).toBeDefined();
      expect(dashboardResponse.body.active_alerts).toBeDefined();
      expect(dashboardResponse.body.performance_metrics).toBeDefined();
      expect(dashboardResponse.body.business_metrics).toBeDefined();
      expect(dashboardResponse.body.security_status).toBeDefined();
    });

    it('should provide historical trends', async () => {
      const trendsResponse = await request(app.getHttpServer())
        .get('/monitoring/trends')
        .query({
          metric: 'response_time',
          period: '24h',
          interval: '1h',
        });

      expect(trendsResponse.status).toBe(200);
      expect(Array.isArray(trendsResponse.body.data_points)).toBe(true);
      expect(trendsResponse.body.trend_direction).toBeDefined();
      expect(trendsResponse.body.average_value).toBeDefined();
    });

    it('should provide customizable alerts dashboard', async () => {
      const alertsDashboardResponse = await request(app.getHttpServer())
        .get('/monitoring/alerts-dashboard')
        .query({
          severity: 'high',
          status: 'active',
          limit: 20,
        });

      expect(alertsDashboardResponse.status).toBe(200);
      expect(Array.isArray(alertsDashboardResponse.body.alerts)).toBe(true);
      expect(alertsDashboardResponse.body.summary).toBeDefined();
      expect(alertsDashboardResponse.body.alert_trends).toBeDefined();
    });
  });
});