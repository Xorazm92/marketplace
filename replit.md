# GlobalMarket - E-commerce Platform

## Overview

GlobalMarket is a full-stack e-commerce marketplace application built with a modern tech stack. The platform connects buyers and sellers globally, featuring multi-language support, role-based access control, and a comprehensive product management system.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for server state, React Context for local state
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage

### Data Layer
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with Drizzle Kit for migrations
- **Schema**: Shared schema definitions between client and server

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with passport.js
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **User Roles**: Three-tier system (buyer, seller, admin)
- **Authorization**: Route-level protection based on user roles

### Database Schema
- **Users**: Core user information with role-based access
- **Products**: Complete product catalog with categories, reviews, and inventory
- **Orders**: Full order management with line items and status tracking
- **Shopping Cart**: Persistent cart functionality
- **Categories**: Hierarchical product categorization
- **Reviews & Ratings**: User feedback system
- **Notifications**: In-app messaging system

### Multi-language Support
- **Languages**: English, Russian, Uzbek
- **Currency**: USD, EUR, UZS with formatting utilities
- **Context**: React Context for language/currency state management

### UI Component System
- **Library**: shadcn/ui built on Radix UI primitives
- **Theming**: CSS variables with light/dark mode support
- **Responsive**: Mobile-first design with Tailwind breakpoints

## Data Flow

### Authentication Flow
1. User initiates login via Replit Auth
2. OpenID Connect handles authentication
3. User session stored in PostgreSQL
4. Client receives authentication state via React Query

### Product Management Flow
1. Sellers create/manage products through dashboard
2. Admin approval required for new sellers
3. Products organized by hierarchical categories
4. Real-time inventory tracking

### Shopping Experience
1. Users browse products by category or search
2. Add items to persistent shopping cart
3. Checkout process creates orders
4. Order tracking and status updates

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for serverless environments
- **@tanstack/react-query**: Server state management
- **drizzle-orm**: Type-safe database operations
- **express**: Web server framework
- **passport**: Authentication middleware

### UI Dependencies
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **wouter**: Lightweight routing

### Development Dependencies
- **vite**: Development server and build tool
- **tsx**: TypeScript execution for development
- **esbuild**: Production server bundling

## Deployment Strategy

### Development Environment
- **Runtime**: Node.js 20
- **Database**: PostgreSQL 16 via Replit modules
- **Hot Reload**: Vite dev server with HMR
- **Port**: 5000 (internal) mapped to 80 (external)

### Production Build
1. **Client Build**: Vite builds React app to `dist/public`
2. **Server Build**: esbuild bundles Express server to `dist/index.js`
3. **Static Serving**: Express serves built client from `dist/public`
4. **Database**: Uses DATABASE_URL environment variable

### Environment Configuration
- **SESSION_SECRET**: Required for session encryption
- **DATABASE_URL**: PostgreSQL connection string
- **REPL_ID**: Replit environment identifier
- **ISSUER_URL**: OpenID Connect issuer endpoint

## Changelog

Changelog:
- June 24, 2025. Initial setup with full e-commerce platform
- Database schema created with PostgreSQL tables
- Authentication system implemented with Replit OAuth
- Multi-language support added (English, Russian, Uzbek)
- Complete product management and cart functionality
- Admin panel and seller dashboard completed

## User Preferences

Preferred communication style: Simple, everyday language (Uzbek when asked).