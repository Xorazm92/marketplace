// password.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import * as bcrypt from 'bcrypt';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('encrypt should hash password', async () => {
    const password = 'mySecret123';
    const hash = await service.encrypt(password);
    expect(hash).toBeDefined();
    expect(hash).not.toEqual(password);
    const isMatch = await bcrypt.compare(password, hash);
    expect(isMatch).toBe(true);
  });

  it('compare should validate password', async () => {
    const password = 'testPass';
    const hash = await bcrypt.hash(password, 7);
    const result = await service.compare(password, hash);
    expect(result).toBe(true);
    const wrong = await service.compare('wrong', hash);
    expect(wrong).toBe(false);
  });
});
