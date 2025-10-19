# Aldar Real Estate Platform

## Overview

This is a comprehensive real estate web application for Saudi Arabian properties, featuring bilingual support (Arabic/English) with Arabic as the primary language. The platform includes a public-facing property listing site and an administrative dashboard for managing properties, contact messages, and testimonials. Built with a modern full-stack architecture, it provides property search, filtering, and detailed property views with WhatsApp integration for direct customer communication.

## Recent Changes (October 19, 2025)

### Admin Dashboard Fixes
- **Fixed Delete and View Buttons**: Corrected property ID handling in admin panel to support both MongoDB (_id) and PostgreSQL (id)
  - Updated delete mutation to use string IDs instead of converting to Number (which caused NaN errors)
  - Fixed edit, delete, and view button links to use correct property identifier
  - Added data-testid attributes for better testing support

### Production Environment Support (Render Deployment)
- **Enhanced Session Management**: Updated session configuration for production deployment on Render
  - Added `trust proxy` setting for reverse proxy support
  - Updated cookie settings with `sameSite: 'none'` for cross-origin requests in production
  - Added `httpOnly: true` for enhanced security
  - Added logging for property creation operations to aid debugging

### Image Gallery Enhancement
- **Interactive Property Image Gallery**: Implemented full-featured image gallery in property details page
  - Click on main image or thumbnails to open full-screen gallery
  - Navigate between images using arrow buttons or keyboard (arrow keys, Escape)
  - Image counter showing current position (e.g., "1 / 5")
  - Thumbnail strip at bottom for quick navigation
  - Hover effects on images for better user feedback
  - Accessibility improvements with DialogTitle for screen readers
  - Responsive design with proper mobile support

## Previous Changes (October 17, 2025)

### UI/UX Improvements
- **Fixed Input Text Visibility Issue**: Added explicit `text-foreground` class to Input component to ensure text is visible in all input fields, especially in filter fields (price range, area range)
- **Enhanced Form Validation Feedback**: Added better error handling for property form submission with user-friendly toast notifications when validation fails
- **Improved Admin Form Experience**: Added console logging for debugging form submission issues and validation errors

### Property Form Fixes
- **Fixed Property Save Issue**: Resolved validation error that prevented property creation when images were added
  - Made `images` field optional in property form schema since it's handled separately in component state
  - Removed `images` from form defaultValues to avoid validation conflicts
- **Increased Upload Limit**: Raised Express body parser limit from 100KB to 50MB to support base64-encoded images
  - Prevents "PayloadTooLargeError" when uploading property images
  - Allows multiple high-quality images per property

### Property Display Updates
- Modified property cards to display only property size (square meters) without bedroom/bathroom counts
- Standardized schema: `size` field for property area in m², `area` field for geographic location
- Fixed filter text visibility by adding explicit color styling to Select component triggers

### Admin Interface Enhancements
- Implemented cascading location selects (City → Area → Neighborhood) in property form
- Expanded cityStructure with comprehensive neighborhoods for major Saudi cities:
  - Riyadh: 40+ neighborhoods across 8 areas
  - Jeddah: 30+ neighborhoods across 6 areas
  - Dammam, Khobar, Mecca, Medina: 20+ neighborhoods each
- Added new property types: Building (عمارة) and Rest House (استراحة)

### Technical Fixes
- Corrected PropertyDetails component to handle MongoDB ObjectId strings properly
- Fixed nested `<a>` tag warning in PropertyCard component
- Updated property ID handling throughout the app to support both MongoDB and PostgreSQL

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching
- React Hook Form with Zod for form validation and type safety

**UI Component System:**
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for utility-first styling with custom theme configuration
- shadcn/ui component library pattern for reusable UI components
- Custom theming system with JSON-based configuration (theme.json)
- RTL (Right-to-Left) support for Arabic language

**Key Design Patterns:**
- Component composition with Radix UI primitives
- Form state management using React Hook Form
- Type-safe API calls with shared schema validation
- Session-based authentication with protected routes
- Responsive design with mobile-first approach

### Backend Architecture

**Server Framework:**
- Express.js as the Node.js web server
- TypeScript for type safety across the stack
- ESM (ES Modules) for modern JavaScript module system

**Session Management:**
- express-session with MemoryStore for session persistence
- Cookie-based authentication with secure flag for production
- Role-based access control (admin/user roles)

**API Design:**
- RESTful API endpoints with consistent response formats
- Middleware for authentication and authorization checks
- Centralized error handling with custom error responses
- Request/response logging for debugging

**Development Workflow:**
- Hot Module Replacement (HMR) in development via Vite
- Separate development and production build processes
- Static file serving in production from dist/public

### Data Storage Solutions

**Database:**
- MongoDB as the primary database
- Neon PostgreSQL serverless support (via @neondatabase/serverless package)
- Drizzle ORM for type-safe database operations
- Connection pooling with configurable pool size

**Schema Design:**
- Properties collection with comprehensive property details
- Users collection with role-based permissions
- Contact messages collection for customer inquiries
- Testimonials collection with approval workflow

**Data Models:**
- Properties: title, description, type, price, location hierarchy (city/area/neighborhood), features, images, status
- Users: username, password, name, role, email, phone
- Contact Messages: name, email, phone, subject, message, read status
- Testimonials: name, location, message, rating, approval status

**Key Features:**
- Property search with multiple filter criteria (city, area, neighborhood, type, price range, size)
- Featured properties system
- Property code generation for unique identification
- Image storage as base64 strings or URLs

### Authentication and Authorization

**Authentication Flow:**
- Session-based authentication without external libraries
- Username/password credentials stored with hashed passwords
- Persistent sessions across page refreshes
- Automatic session cleanup for expired sessions

**Authorization Levels:**
- Public routes: Home, properties listing, property details
- Protected admin routes: Dashboard, property management, messages, testimonials
- Middleware guards for route protection
- Role verification at API endpoint level

**Security Measures:**
- Secure cookies in production environment
- Session secret configuration via environment variables
- 401/403 status codes for unauthorized access
- CORS and credential handling for API requests

### External Dependencies

**Third-Party Services:**
- WhatsApp Business API integration for customer contact (via wa.me links)
- Google Fonts CDN for Arabic typography (Cairo and Tajawal fonts)
- Font Awesome CDN for icon library

**Database Providers:**
- MongoDB (primary, configurable via connection string)
- Neon PostgreSQL (serverless, DATABASE_URL environment variable)
- Support for both local and cloud database deployments

**Deployment Platforms:**
- Render.com as primary deployment target
- GitHub integration for CI/CD
- Blueprint configuration via render.yaml
- Environment variable management for sensitive configuration

**Build and Development Tools:**
- esbuild for server-side bundling
- PostCSS with Autoprefixer for CSS processing
- TypeScript compiler for type checking
- Drizzle Kit for database migrations and schema management

**Key Integration Points:**
- DATABASE_URL for database connection
- SESSION_SECRET for session security
- NODE_ENV for environment-specific behavior
- Vite plugin ecosystem for development enhancements (runtime error overlay, theme JSON support)