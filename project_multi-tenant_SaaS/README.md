# Multi-Tenant SaaS Notes Application

A production-ready multi-tenant SaaS notes application built with Next.js, Supabase, and TypeScript. This application demonstrates secure multi-tenancy, role-based access control, and subscription-based feature gating.

## Architecture

### Multi-Tenancy Approach: Shared Schema with Tenant ID

This application uses a **shared schema with tenant isolation** approach, where:
- All tenants share the same database and tables
- Each table has a `tenant_id` column to ensure data isolation
- Row Level Security (RLS) policies enforce tenant boundaries
- Application-level checks provide additional security layers

**Why this approach?**
- **Cost-effective**: Single database instance for all tenants
- **Scalable**: Easy to add new tenants without infrastructure changes  
- **Maintainable**: Single codebase and schema to maintain
- **Secure**: Proper RLS policies prevent cross-tenant data access

### Database Schema

```sql
-- Tenants table (companies)
tenants:
  - id (uuid, primary key)
  - slug (text, unique) - Used in URLs (e.g., "acme", "globex")
  - name (text) - Display name
  - plan (text) - "FREE" or "PRO"

-- Users table (tenant members)
users:
  - id (uuid, primary key)
  - tenant_id (uuid, foreign key to tenants)
  - email (text, unique)
  - password_hash (text)
  - role (text) - "ADMIN" or "MEMBER"

-- Notes table (tenant data)
notes:
  - id (uuid, primary key)
  - tenant_id (uuid, foreign key to tenants)
  - user_id (uuid, foreign key to users)
  - title (text)
  - content (text)
```

## Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** (Admin vs Member permissions)
- **Mandatory test accounts** with predefined credentials
- **Tenant isolation** - users can only access their tenant's data

### 👥 Multi-Tenancy
- **Strict data isolation** - tenant data never crosses boundaries
- **Tenant-aware APIs** - all endpoints filter by tenant_id
- **Scalable architecture** - easy to add new tenants

### 💰 Subscription Plans
- **Free Plan**: Limited to 3 notes per tenant
- **Pro Plan**: Unlimited notes
- **Admin upgrade capability** - only admins can upgrade their tenant
- **Real-time limit enforcement** - immediate effect after upgrade

### 📝 Notes Management (CRUD)
- **Create, Read, Update, Delete** notes with full tenant isolation
- **Rich text support** with title and content fields
- **Audit trail** with created/updated timestamps
- **User attribution** - notes linked to creating user

### 🌐 CORS-Enabled API
- **Cross-origin requests supported** for external dashboards
- **Health endpoint** for monitoring and uptime checks
- **RESTful API design** following standard conventions

## API Endpoints

### Authentication
- `POST /api/auth/login` - Authenticate user and receive JWT token

### Health Check  
- `GET /api/health` - Returns `{ "status": "ok" }` for monitoring

### Notes Management
- `GET /api/notes` - List all notes for current tenant
- `POST /api/notes` - Create a new note (respects plan limits)
- `GET /api/notes/:id` - Retrieve specific note
- `PUT /api/notes/:id` - Update existing note  
- `DELETE /api/notes/:id` - Delete note

### Tenant Management
- `POST /api/tenants/:slug/upgrade` - Upgrade tenant to Pro plan (Admin only)

## Test Accounts

All test accounts use the password: `password`

| Email | Role | Tenant | Plan |
|-------|------|---------|------|
| admin@acme.test | Admin | Acme | FREE |
| user@acme.test | Member | Acme | FREE |
| admin@globex.test | Admin | Globex | FREE |  
| user@globex.test | Member | Globex | FREE |

## Security Features

### Tenant Isolation
- **Database-level**: RLS policies prevent cross-tenant queries
- **Application-level**: All API endpoints filter by tenant_id
- **Token-based**: JWT tokens include tenant information
- **URL isolation**: Tenant slug validation in upgrade endpoint

### Role-Based Access
- **Admin privileges**: Can upgrade subscriptions and manage tenant
- **Member restrictions**: Can only manage notes, cannot upgrade
- **Endpoint protection**: Role validation on sensitive operations

### Data Protection  
- **Password hashing**: bcrypt with salt for secure password storage
- **JWT security**: Signed tokens with expiration
- **Input validation**: Request payload validation and sanitization
- **Error handling**: No sensitive information leaked in error messages

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with bcrypt password hashing
- **Deployment**: Vercel
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+
- Supabase account and project
- Vercel account (for deployment)

### Environment Variables
Create a `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret_key
```

### Installation
```bash
npm install
npm run dev
```

### Database Setup
1. Create a Supabase project
2. Run the migration SQL from `supabase/migrations/create_multi_tenant_schema.sql`
3. Verify RLS policies are enabled and test data is inserted

### Deployment
The application is configured for automatic deployment on Vercel:
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard  
3. Deploy automatically on git push

## Testing

The application includes comprehensive validation for:
- ✅ Health endpoint availability
- ✅ Authentication with all test accounts
- ✅ Tenant data isolation enforcement
- ✅ Role-based access restrictions
- ✅ Subscription plan limit enforcement
- ✅ CRUD operations with proper security
- ✅ Upgrade functionality for admins

## Production Considerations

### Performance Optimization
- Database indexes on tenant_id and user_id columns
- Connection pooling for database access
- JWT token caching and validation optimization

### Monitoring & Observability  
- Health endpoint for uptime monitoring
- Error logging and alerting setup
- Performance metrics collection

### Security Hardening
- Rate limiting on API endpoints
- SQL injection prevention via parameterized queries
- XSS protection with input sanitization
- HTTPS enforcement in production

### Scalability
- Horizontal scaling via serverless functions
- Database read replicas for improved performance
- CDN integration for static assets
- Caching strategies for frequently accessed data

## License

MIT License - see LICENSE file for details.