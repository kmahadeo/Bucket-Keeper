# Bucket Keeper

## Overview

Bucket Keeper is a gamified task and goal management app designed for couples. It allows partners to track shared and personal tasks ("bucket items"), earn coins for completing them, and redeem rewards. The app features mood tracking, AI-powered conflict resolution suggestions, date idea generation, and calendar sync capabilities. Built as a mobile-first React SPA with an Express backend and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API via custom `AppProvider` in `lib/store.tsx`
- **Data Fetching**: TanStack React Query for server state management
- **Styling**: Tailwind CSS v4 with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for UI transitions and micro-interactions
- **UI Components**: Radix UI primitives wrapped with shadcn/ui styling

### Backend Architecture
- **Framework**: Express.js running on Node.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL (Neon serverless)
- **API Design**: RESTful endpoints under `/api/*` prefix
- **Build System**: esbuild for server bundling, Vite for client

### Data Storage
- **Database**: PostgreSQL via Neon serverless connection
- **Schema Location**: `shared/schema.ts` using Drizzle table definitions
- **Tables**: 
  - `users` - User accounts with coins, mood, partner linking
  - `bucketItems` - Tasks/goals with types, priorities, assignments
  - `rewards` - Redeemable rewards with costs and types
  - `conversations` / `messages` - AI chat history

### AI Integration
- **Provider**: Google Gemini via Replit AI Integrations
- **Models Used**: 
  - `gemini-2.5-flash` - Fast text generation
  - `gemini-2.5-pro` - Advanced reasoning
  - `gemini-2.5-flash-image` - Image generation
- **Features**: Conflict resolution suggestions, date idea generation, chat capabilities
- **Batch Processing**: Utility for concurrent AI requests with rate limiting and retries

### Key Design Patterns
- **Shared Types**: Schema definitions in `shared/` directory used by both client and server
- **Storage Interface**: `IStorage` interface in `server/storage.ts` abstracts database operations
- **API Client**: Centralized API functions in `client/src/lib/api.ts`
- **Mobile-First Layout**: `MobileLayout` component wraps all pages with bottom navigation

## External Dependencies

### Database
- **PostgreSQL**: Primary data store via `DATABASE_URL` environment variable
- **Neon Serverless**: Database hosting with WebSocket connection support

### AI Services
- **Replit AI Integrations**: Gemini API access via:
  - `AI_INTEGRATIONS_GEMINI_API_KEY`
  - `AI_INTEGRATIONS_GEMINI_BASE_URL`

### Third-Party Libraries
- **Google Fonts**: Inter (body text) and Outfit (headings)
- **date-fns**: Date manipulation and formatting
- **Zod**: Schema validation with `drizzle-zod` integration
- **vaul**: Drawer component for mobile UI patterns

### Development Tools
- **Drizzle Kit**: Database migrations via `db:push` command
- **Replit Vite Plugins**: Dev banner, cartographer, runtime error overlay