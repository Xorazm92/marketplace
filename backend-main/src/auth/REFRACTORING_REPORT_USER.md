# Refactoring Report – User Module

## Overview
The `user` module currently contains a controller, service, DTOs and a Prisma model. It handles CRUD operations for user accounts, role management, and profile updates.

## Identified Issues
| Issue | Description | Suggested Fix |
|-------|-------------|---------------|
| **Mixed responsibilities** – Service performs validation, DB access, and token handling. | Separate concerns into a `UserRepository` (Prisma wrapper) and a `UserTokenService` (JWT, refresh token). | Implement Repository pattern and move token logic to a dedicated service. |
| **Hard‑coded error messages** – English/Uzbek mix, direct strings. | Centralise messages in a constants file. | Create `user.constants.ts` with `USER_ALREADY_EXISTS`, etc. |
| **Direct use of `process.env`** – No fallback defaults. | Use a configuration service (`ConfigService` from `@nestjs/config`). | Inject `ConfigService` and read env variables safely. |
| **No input validation** – DTOs exist but not validated inside service. | Use `class-validator` decorators and enable `ValidationPipe` globally. |
| **Repeated password hashing** – `bcrypt` used directly in service. | Extract to a `PasswordService` that handles hashing and comparison. |
| **Lack of pagination / filtering** – `findAll` returns all users. | Add pagination parameters and use Prisma `skip`/`take`. |
| **Missing unit tests** – No test coverage for service methods. | Add Jest tests using Nest's testing module and mock Prisma. |

## Refactoring Plan
1. **Create `UserRepository`** – thin wrapper around `PrismaService` for user queries.
2. **Create `UserTokenService`** – generate JWT, refresh tokens, set/clear cookies (similar to `AuthTokenService`).
3. **Extract constants** to `user.constants.ts`.
4. **Introduce `PasswordService`** for bcrypt operations.
5. **Update `UserService`** to delegate to the new services and repository.
6. **Add validation** in DTOs and enable global pipe.
7. **Write unit tests** for repository, token, and service.
8. **Document changes** in this report.

---
*Prepared by Cascade – clean‑code and design‑pattern readiness for User module.*
