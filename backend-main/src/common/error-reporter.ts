// Xato kuzatuvi (Sentry va shunga o'xshash) uchun yagona ulanish nuqtasi.
//
// Repoda kuzatuv SDK'si yo'q (yangi bog'liqlik — egasining qarori). Ulash uchun main.ts da,
// NestFactory.create dan oldin:
//
//   import * as Sentry from '@sentry/node';
//   Sentry.init({ dsn: process.env.SENTRY_DSN });
//   setErrorReporter((error, context) => Sentry.captureException(error, { extra: context }));
//
// GlobalExceptionFilter har kutilmagan (5xx) xatoni shu yerga beradi. Kontekstda faqat
// yo'l (so'rov satrisiz), metod, status va foydalanuvchi id'si bor — telefon, token, tana yo'q.
export interface ErrorContext {
  method: string;
  path: string;
  status: number;
  userId: number | null;
}

export type ErrorReporter = (error: unknown, context: ErrorContext) => void;

let reporter: ErrorReporter | null = null;

export function setErrorReporter(next: ErrorReporter | null): void {
  reporter = next;
}

export function reportError(error: unknown, context: ErrorContext): void {
  try {
    reporter?.(error, context);
  } catch {
    // Kuzatuv tizimining nosozligi foydalanuvchiga javob berishga xalaqit bermasin.
  }
}
