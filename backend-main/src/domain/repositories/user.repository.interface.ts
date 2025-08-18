import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findBySlug(slug: string): Promise<User | null>;
  findAll(limit?: number, offset?: number): Promise<User[]>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: number, user: Partial<User>): Promise<User>;
  delete(id: number): Promise<void>;
  exists(email: string): Promise<boolean>;
  updateBalance(id: number, amount: number): Promise<User>;
  findActiveUsers(): Promise<User[]>;
  findPremiumUsers(): Promise<User[]>;
  searchUsers(query: string): Promise<User[]>;
}
