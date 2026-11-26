import { BadRequestException, Logger } from '@nestjs/common';
import { setErrorReporter } from '../error-reporter';
import { GlobalExceptionFilter } from './global-exception.filter';

function run(exception: unknown, url = '/api/v1/admin/orders?q=%2B998901234567&page=2') {
  const res: any = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const req = { url, method: 'GET', ip: '10.0.0.9', get: () => 'jest', user: { id: 7 } };
  const host: any = { switchToHttp: () => ({ getResponse: () => res, getRequest: () => req }) };
  new GlobalExceptionFilter().catch(exception, host);
  return res;
}

describe('GlobalExceptionFilter', () => {
  let logged: string;
  let reported: Array<{ error: unknown; context: any }>;

  beforeEach(() => {
    logged = '';
    reported = [];
    for (const level of ['error', 'warn'] as const) {
      jest.spyOn(Logger.prototype, level).mockImplementation((...args: unknown[]) => void (logged += JSON.stringify(args)));
    }
    setErrorReporter((error, context) => void reported.push({ error, context }));
  });
  afterEach(() => {
    jest.restoreAllMocks();
    setErrorReporter(null);
  });

  it("logga so'rov satri (qidiruvdagi telefon) tushmaydi, faqat yo'l", () => {
    run(new BadRequestException('x'));
    expect(logged).toContain('/api/v1/admin/orders');
    expect(logged).not.toContain('998901234567');
    expect(logged).not.toContain('page=2');
  });

  it('kutilmagan xato (5xx) kuzatuv tizimiga yuboriladi, mijoz xatosi (4xx) — yo\'q', () => {
    const boom = new Error('baza uzildi');
    const res = run(boom);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(reported).toHaveLength(1);
    expect(reported[0].error).toBe(boom);
    expect(reported[0].context).toEqual({ method: 'GET', path: '/api/v1/admin/orders', status: 500, userId: 7 });
    // Ichki xato matni mijozga chiqmaydi.
    expect(JSON.stringify(res.json.mock.calls)).not.toContain('baza uzildi');

    run(new BadRequestException('x'));
    expect(reported).toHaveLength(1);
  });

  it('kuzatuv tizimining o\'zi yiqilsa ham javob qaytadi', () => {
    setErrorReporter(() => {
      throw new Error('sentry down');
    });
    expect(run(new Error('x')).status).toHaveBeenCalledWith(500);
  });
});
