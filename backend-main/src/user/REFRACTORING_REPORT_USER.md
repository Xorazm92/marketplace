# Refactoring Report – User Module

## Overview
The `user` module manages user accounts, profile data, and authentication‑related token handling. Currently the service mixes business logic, direct Prisma calls, password hashing, and token management, making testing and maintenance difficult.

## Identified Issues
| Issue | Description | Suggested Fix |
|-------|-------------|---------------|
| **Mixed responsibilities** – `UserService` handles CRUD, password encryption, and token persistence. | Separate concerns into a repository, a password service, and a token service. | Create `UserRepository`, `PasswordService`, and reuse `UserTokenService`.
| **Hard‑coded token logic** – Refresh token handling is duplicated from Auth. | Centralise token operations in `UserTokenService`. | Move token generation, hashing, persistence, and cookie management there.
| **Direct use of `process.env`** – No fallback defaults. | Use NestJS `ConfigService` for environment variables. | Inject `ConfigService` where needed.
| **No validation layer** – DTOs exist but are not enforced. | Enable global `ValidationPipe` and add class‑validator decorators to DTOs. |
| **Repeated bcrypt usage** – Direct calls to `BcryptEncryption`. | Extract to a dedicated `PasswordService`.
| **Lack of pagination in `findAll`** – Returns all users. | Add pagination parameters (`skip`, `take`). |
| **Missing unit tests** – Service methods are untested. | Add Jest tests with mocked `UserRepository` and services.
| **Error messages not centralised** – Strings scattered. | Create `user.constants.ts` for messages and defaults.

## Refactoring Plan
1. **Create `user.constants.ts`** – define `BCRYPT_SALT`, `COOKIE_MAX_AGE`, error message constants.
2. **Create `user.repository.ts`** – thin wrapper around `PrismaService` for user queries.
3. **Create `password.service.ts`** – encapsulate bcrypt hashing/comparison.
4. **Update `UserService`** to inject `UserRepository`, `PasswordService`, `UserTokenService`, and `ConfigService`.
5. **Add pagination** to `findAll` method.
6. **Update `UserModule`** providers to include new services.
7. **Add unit tests** for repository and service.
8. **Document changes** in this report.

---
*Prepared by Cascade – clean‑code and design‑pattern readiness for User module.*
