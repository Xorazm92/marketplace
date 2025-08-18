# Clean Architecture Pattern

## Layer Structure:

```
src/
├── domain/           # Business logic, entities, value objects
├── application/      # Use cases, application services
├── infrastructure/   # External concerns (DB, API, etc.)
└── presentation/     # Controllers, GraphQL resolvers
```

## Domain Layer:
- Entities (User, Product, Order)
- Value Objects (Email, Money, Address)
- Domain Services
- Repository Interfaces

## Application Layer:
- Use Cases
- Application Services
- DTOs
- Command/Query Handlers

## Infrastructure Layer:
- Repository Implementations
- External API Clients
- Database Connections
- File Storage

## Presentation Layer:
- Controllers
- GraphQL Resolvers
- Middleware
- Filters
