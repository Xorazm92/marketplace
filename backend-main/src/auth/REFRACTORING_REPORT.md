# Refactoring Report – Auth Module

## Overview
The `AuthService` currently mixes several responsibilities:
1. **Admin registration & activation** – user creation, email sending, activation link handling.
2. **Authentication flow** – password validation, JWT generation, refresh‑token handling, cookie management.
3. **Token lifecycle** – hashing, storing, refreshing, and clearing refresh tokens.
4. **Error handling** – many `throw` statements scattered throughout the file.

Having all of these concerns in a single class makes the code hard to read, test, and extend (e.g., adding a new authentication strategy).

## Identified Issues
| Issue | Description | Suggested Fix |
|-------|-------------|---------------|
| **Large class size** – >200 lines with multiple public methods. | Break responsibilities into smaller services. | Extract token‑related logic to `AuthTokenService`. |
| **Repeated cookie logic** – `res.cookie` appears in several methods. | Centralise cookie handling. | Move to `AuthTokenService.setRefreshCookie`. |
| **Hard‑coded values** – bcrypt salt `7`, cookie max age from env without fallback. | Use constants/config service. | Define `BCRYPT_SALT = 7` and `COOKIE_MAX_AGE` with defaults. |
| **Direct use of `JwtService` & `PrismaService`** – makes unit testing difficult. | Inject abstractions/interfaces. | Create `ITokenProvider` and `IUserRepository` interfaces. |
| **Error messages in multiple languages** – mix of English and Uzbek. | Keep messages consistent (English) for API consumers. | Update messages to English only. |
| **No input validation** – DTOs are used but not validated inside service. | Leverage class‑validator or explicit checks. | Add `class-validator` decorators (already present) and guard against missing fields. |
| **Missing separation of concerns for email** – `MailService` is only used for admin activation. | Keep as is, but consider moving activation email to a dedicated `AdminActivationService`. |

## Refactoring Plan
1. **Create `AuthTokenService`** – handles token generation, hashing, cookie management, and refresh‑token persistence.
2. **Introduce constants** in a new `auth.constants.ts` file.
3. **Update `AuthService`** to delegate token‑related work to `AuthTokenService` and focus on business logic (sign‑up, sign‑in, activation).
4. **Add unit tests** for both services using Nest's testing utilities and Jest.
5. **Update error messages** to be consistent English.
6. **Run lint & format** (`npm run lint` / `prettier`).

The same approach can later be applied to other modules (e.g., `PhoneAuthService`).

---
*Prepared by Cascade – clean‑code and design‑pattern readiness.*
