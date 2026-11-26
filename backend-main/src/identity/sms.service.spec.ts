import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SmsService } from './sms.service';
import { maskPhone } from '../common/security/mask';

jest.mock('axios');
const http = axios as jest.Mocked<typeof axios>;

const config = (values: Record<string, string>) => ({ get: (key: string) => values[key] }) as unknown as ConfigService;
const eskiz = { ESKIZ_EMAIL: 'a@b.uz', ESKIZ_PASSWORD: 'p', NODE_ENV: 'production' };

describe('SmsService', () => {
  let logged: string;
  beforeEach(() => {
    jest.resetAllMocks();
    logged = '';
    for (const level of ['error', 'warn', 'log'] as const) {
      jest.spyOn(Logger.prototype, level).mockImplementation((...args: unknown[]) => void (logged += JSON.stringify(args)));
    }
  });
  afterEach(() => jest.restoreAllMocks());

  it('maskPhone: operator kodi va oxirgi ikki raqam qoladi', () => {
    expect(maskPhone('+998901234567')).toBe('+99890*****67');
    expect(maskPhone('')).toBe('***');
  });

  it("provayder xatosida logga to'liq raqam ham, kod ham tushmaydi", async () => {
    http.post.mockResolvedValueOnce({ data: { data: { token: 't' } } }).mockRejectedValueOnce(Object.assign(new Error('boom'), { isAxiosError: true, response: { status: 500 } }));
    http.isAxiosError.mockReturnValue(true);
    await expect(new SmsService(config(eskiz)).send('+998901234567', 'INBOLA: tasdiqlash kodi 123456.')).rejects.toThrow();
    expect(logged).toContain('+99890*****67');
    expect(logged).not.toContain('901234567');
    expect(logged).not.toContain('123456');
  });

  it('prodda sozlanmagan bo\'lsa kod logga yozilmaydi, xato qaytadi', async () => {
    await expect(new SmsService(config({ NODE_ENV: 'production' })).send('+998901234567', 'kod 123456')).rejects.toThrow();
    expect(logged).not.toContain('123456');
    expect(http.post).not.toHaveBeenCalled();
  });

  it('token eskirgan (401) bo\'lsa bir marta yangilab qayta yuboradi', async () => {
    const unauthorized = Object.assign(new Error('401'), { isAxiosError: true, response: { status: 401 } });
    http.isAxiosError.mockReturnValue(true);
    http.post
      .mockResolvedValueOnce({ data: { data: { token: 'old' } } })
      .mockRejectedValueOnce(unauthorized)
      .mockResolvedValueOnce({ data: { data: { token: 'new' } } })
      .mockResolvedValueOnce({ data: {} });
    await expect(new SmsService(config(eskiz)).send('+998901234567', 'x')).resolves.toBeUndefined();
    expect(http.post).toHaveBeenCalledTimes(4);
  });
});
