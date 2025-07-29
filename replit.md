# VU Portal - Replit Project Guide

## Overview

VU Portal is a full-stack web application for Virtual University of Pakistan, featuring a React frontend with Vite, Express.js backend, and PostgreSQL database using Drizzle ORM. The application implements a comprehensive authentication system with email verification via OTP codes, specifically designed for @vu.edu.pk email domains.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **API Style**: RESTful API design
- **Middleware**: Built-in Express middleware for JSON parsing and logging

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Connection**: Neon serverless connection pool with WebSocket support
- **Migrations**: Drizzle Kit for schema migrations

## Key Components

### Authentication System
The application implements a multi-step authentication flow:

1. **User Registration**: Collects username, full name, email (@vu.edu.pk), and password
2. **Email Verification**: Generates 6-digit OTP codes with 10-minute expiry
3. **Login System**: Email/password authentication with verification status check
4. **Password Recovery**: Forgot password flow with OTP verification

**Rationale**: Domain-restricted registration ensures only VU students can access the system, while OTP verification provides secure email validation.

### Database Schema
- **Users Table**: Stores user credentials and verification status
- **OTP Codes Table**: Manages temporary verification codes with expiry

**Storage Implementation**: Uses in-memory storage (`MemStorage`) for development with pending user functionality. Users are temporarily stored in `pendingUsers` table until OTP verification, then moved to main `users` table upon successful verification.

### UI Components
Built on shadcn/ui component system providing:
- Consistent design language
- Accessibility features
- Dark/light mode support
- Responsive design patterns

## Data Flow

### Authentication Flow
1. User submits registration form
2. Server validates domain restriction (@vu.edu.pk)
3. Password hashed using bcrypt
4. User data temporarily stored in `pendingUsers` table
5. OTP generated and displayed in console with clear formatting
6. User enters OTP for verification
7. Upon successful OTP verification, user data moves to main `users` table
8. Account fully activated and ready for login

### Recent Bug Fixes (January 2025)
- **Fixed OTP Page Navigation**: Back button now shows "Back to Sign Up" when coming from signup flow
- **Secure Registration Flow**: User data only saved after OTP verification, preventing incomplete registrations
- **Console-based OTP Display**: OTP codes clearly displayed in console with emojis and user details for development testing
- **Admin User System**: Implemented admin account (abdulmannan32519@gmail.com) that bypasses OTP verification
- **Role-based Authentication**: Admin users login directly, students require @vu.edu.pk emails and OTP verification
- **Complete Password Reset Flow**: Added forgot password → OTP verification → password reset → login flow
- **Fixed Login Bug**: Verified users can now login without being redirected to OTP page

### API Communication
- Frontend uses TanStack Query for API state management
- Custom `apiRequest` helper handles HTTP requests with error handling
- Toast notifications provide user feedback
- Form validation occurs client-side with server-side confirmation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection for Neon database
- **drizzle-orm**: Type-safe database queries and schema management
- **bcrypt**: Password hashing for security
- **@radix-ui/***: Accessible component primitives
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight routing
- **zod**: Runtime type validation

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety and better developer experience
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Fast bundling for production

## Deployment Strategy

### Build Process
1. **Frontend**: Vite builds optimized React application to `dist/public`
2. **Backend**: ESBuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)

### Scripts
- `dev`: Development server with hot reloading
- `build`: Production build for both frontend and backend
- `start`: Production server startup
- `db:push`: Apply database schema changes

### Architecture Decisions

**Monorepo Structure**: Keeps related code together while maintaining clear separation between client, server, and shared code.

**Shared Schema**: Common validation schemas between frontend and backend ensure consistency and reduce duplication.

**Serverless Database**: Neon PostgreSQL provides scalable, managed database without infrastructure overhead.

**Component Library**: shadcn/ui provides professionally designed, accessible components while maintaining customization flexibility.

**Type Safety**: Full TypeScript coverage from database to UI ensures runtime reliability and better developer experience.