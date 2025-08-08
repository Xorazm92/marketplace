# Refactoring Report – Product Module

## Overview
The `product` module handles product CRUD, categories, pricing, and media. It currently mixes business logic with direct Prisma calls and contains duplicated validation and error handling.

## Identified Issues
| Issue | Description | Suggested Fix |
|-------|-------------|---------------|
| **Direct Prisma usage in service** – Service talks to `PrismaService` directly, making testing hard. | Introduce a `ProductRepository` that abstracts Prisma calls. | Create `product.repository.ts` with methods `findMany`, `findOne`, `create`, `update`, `delete`.
| **Hard‑coded error messages** – English only but scattered. | Centralise in `product.constants.ts`. | Define `PRODUCT_NOT_FOUND`, `PRODUCT_ALREADY_EXISTS`, etc.
| **No validation layer** – DTOs exist but not enforced in service. | Use `class-validator` decorators and enable global `ValidationPipe`. |
| **Repeated price calculations** – Discount logic duplicated. | Extract to a `PricingService`. |
| **Missing pagination** – `findAll` returns all rows. | Add pagination parameters (`skip`, `take`). |
| **No unit tests** – Service lacks test coverage. | Add Jest tests with mocked repository.
| **Mixed responsibilities** – Service also handles file upload (images). | Separate `ProductMediaService` for handling image storage (e.g., S3 or local). |

## Refactoring Plan
1. **Create `product.repository.ts`** – thin wrapper around `PrismaService` for product queries.
2. **Create `product.constants.ts`** – centralised error messages and default values.
3. **Create `pricing.service.ts`** – encapsulate price/discount calculations.
4. **Create `product-media.service.ts`** – handle image upload and deletion.
5. **Update `product.service.ts`** to use the new repository, pricing, and media services.
6. **Add validation** to DTOs (`CreateProductDto`, `UpdateProductDto`).
7. **Add pagination** to `findAll` method.
8. **Write unit tests** for repository, service, and pricing logic.
9. **Document changes** in this report.

---
*Prepared by Cascade – clean‑code and design‑pattern readiness for Product module.*
