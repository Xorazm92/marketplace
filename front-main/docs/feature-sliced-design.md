# Feature-Sliced Design Pattern

## Structure:

```
src/
├── app/              # App initialization, providers, routing
├── pages/            # Page components
├── widgets/          # Complex UI blocks
├── features/         # Business logic features
├── entities/         # Business entities
├── shared/           # Shared utilities, UI, configs
└── public/           # Static assets
```

## Layer Dependencies:
- app → pages → widgets → features → entities → shared
- No circular dependencies
- Each layer can only import from layers below

## Features:
- Product management
- User authentication
- Shopping cart
- Payment processing
- Order management
- Admin dashboard

## Entities:
- User
- Product
- Order
- Category
- Review

## Shared:
- UI components
- API clients
- Utils
- Constants
- Types
