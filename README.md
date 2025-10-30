# Preevy Preview Manager

A Next.js application for managing preview deployments with database tracking and status management.

## Overview

This application provides a REST API for tracking preview deployments, typically used in CI/CD pipelines where preview environments are created for pull requests. It stores deployment metadata, URLs, and status information in a PostgreSQL database.

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Environment variables configured

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env.local` file:

```env
DATABASE_URL=postgresql://username:password@host:port/database
```

### Database Setup

```bash
# For development
npm run db:push

# For production
npm run db:generate
npm run db:migrate
```

### Development

```bash
npm run dev
```

## Data Model

### Preview Entity

| Field          | Type          | Required | Description                       |
| -------------- | ------------- | -------- | --------------------------------- |
| `id`           | `serial`      | ✅       | Primary key (auto-increment)      |
| `build_id`     | `varchar(64)` | ✅       | Unique build identifier           |
| `repo`         | `text`        | ✅       | Repository name/identifier        |
| `pr_number`    | `integer`     | ✅       | Pull request number               |
| `commit_sha`   | `varchar(64)` | ✅       | Git commit SHA                    |
| `branch`       | `text`        | ✅       | Git branch name                   |
| `actor`        | `text`        | ✅       | User who triggered the build      |
| `frontend_url` | `text`        | ✅       | URL of the deployed preview       |
| `status`       | `enum`        | ✅       | Preview status (default: 'ready') |
| `created_at`   | `timestamp`   | ✅       | Record creation time              |
| `updated_at`   | `timestamp`   | ✅       | Last update time                  |

### Status Enum Values

- `ready` - Preview is live and accessible
- `down` - Preview is temporarily unavailable
- `error` - Preview deployment failed

### Database Constraints

- **Unique constraint** on `build_id`
- **Indexes** on `repo`, `repo+pr_number`, and `status` for query optimization

## API Endpoints

### POST /api/previews

Creates a new preview or updates an existing one (upsert by `build_id`).

**Request Body:**

```json
{
  "build_id": "build-123",
  "repo": "my-org/my-repo",
  "pr_number": 42,
  "commit_sha": "abc123def456",
  "branch": "feature/new-feature",
  "actor": "john.doe",
  "frontend_url": "https://preview-build-123.vercel.app",
  "status": "ready"
}
```

**Response:**

```json
{
  "ok": true
}
```

**Behavior:**

- If `build_id` exists: updates `frontend_url`, `status`, and `updated_at`
- If `build_id` doesn't exist: creates new record
- `status` defaults to `"ready"` if not provided

### PATCH /api/previews

Updates the status of an existing preview.

**Request Body:**

```json
{
  "build_id": "build-123",
  "status": "down"
}
```

**Response:**

```json
{
  "ok": true
}
```

**Validation:**

- Requires both `build_id` and `status`
- Returns `400` error if either field is missing

### GET /api/previews

Retrieves all previews, ordered by creation time (newest first).

**Response:**

```json
[
  {
    "id": 1,
    "build_id": "build-123",
    "repo": "my-org/my-repo",
    "pr_number": 42,
    "commit_sha": "abc123def456",
    "branch": "feature/new-feature",
    "actor": "john.doe",
    "frontend_url": "https://preview-build-123.vercel.app",
    "status": "ready",
    "created_at": "2025-10-30T10:00:00Z",
    "updated_at": "2025-10-30T10:00:00Z"
  }
]
```

## Architecture

### Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Neon
- **ORM**: Drizzle ORM
- **Runtime**: Node.js
- **Deployment**: Vercel

### Project Structure

```
├── app/
│   ├── api/previews/route.ts    # API endpoints
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── db/
│   ├── index.ts                 # Database connection
│   └── schema.ts                # Database schema
├── drizzle/                     # Migration files
├── drizzle.config.ts           # Drizzle configuration
└── vercel.json                 # Deployment configuration
```

## Deployment

### Vercel Configuration

The application includes automated database migrations for production deployments:

```json
{
  "buildCommand": "npm run vercel-build"
}
```

The `vercel-build` script runs migrations before building for production environments.

### Environment Variables

Set the following in your deployment platform:

- `DATABASE_URL`: PostgreSQL connection string

## What's Missing

This is a basic implementation that lacks several production-ready features:

### 🔐 Authentication & Authorization

- **No API authentication** - endpoints are publicly accessible
- **No user management** - no concept of users or permissions
- **No rate limiting** - vulnerable to abuse

**Recommendations:**

- Add API key authentication
- Implement JWT tokens for user sessions
- Add role-based access control (RBAC)
- Implement rate limiting middleware

### ✅ Input Validation

- **No request validation** - accepts arbitrary JSON
- **No type checking** - runtime type errors possible
- **No sanitization** - potential security risks

**Recommendations:**

- Add schema validation (Zod, Yup, or Joi)
- Implement request sanitization
- Add comprehensive error handling
- Validate enum values and constraints

### 🧪 Testing

- **No unit tests** - business logic untested
- **No integration tests** - API endpoints untested
- **No database tests** - schema and queries untested

**Recommendations:**

- Add Jest/Vitest for unit testing
- Add Supertest for API testing
- Add database test utilities
- Implement CI/CD testing pipeline

### 📊 Monitoring & Observability

- **No logging** - difficult to debug issues
- **No metrics** - no visibility into performance
- **No error tracking** - errors go unnoticed

**Recommendations:**

- Add structured logging (Winston, Pino)
- Implement error tracking (Sentry)
- Add performance monitoring
- Set up health check endpoints

### 🔒 Security

- **No CORS configuration** - cross-origin vulnerabilities
- **No request size limits** - DoS vulnerability
- **No SQL injection protection** - though Drizzle ORM helps
- **No HTTPS enforcement** - data transmitted in plain text

**Recommendations:**

- Configure CORS properly
- Add request size limits
- Implement security headers
- Add input sanitization
- Use HTTPS in production

### 📈 Performance & Scalability

- **No caching** - every request hits database
- **No pagination** - GET endpoint could return large datasets
- **No connection pooling** - database connection inefficiency
- **No query optimization** - potential N+1 queries

**Recommendations:**

- Add Redis for caching
- Implement pagination for list endpoints
- Configure database connection pooling
- Add database query monitoring

### 🏗️ API Design

- **Inconsistent REST patterns** - PATCH uses body instead of URL params
- **No API versioning** - breaking changes affect all clients
- **No OpenAPI/Swagger documentation** - poor developer experience
- **Limited filtering/searching** - GET endpoint has no query options

**Recommendations:**

- Follow RESTful conventions consistently
- Add API versioning strategy
- Generate OpenAPI documentation
- Add query parameters for filtering

## Development Workflow

### Database Changes

1. Modify `db/schema.ts`
2. Generate migration: `npm run db:generate`
3. Apply locally: `npm run db:push` (development)
4. Review generated SQL in `drizzle/` folder
5. Commit migration files
6. Deploy (migrations run automatically)

### Adding Features

1. Update schema if needed
2. Modify/add API endpoints
3. Update documentation
4. Add tests (when testing is implemented)
5. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following the existing patterns
4. Update documentation
5. Submit a pull request
