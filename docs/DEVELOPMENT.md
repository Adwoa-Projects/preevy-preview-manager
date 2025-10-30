# Development Guide

## Local Development Setup

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database (local or remote)
- Git

### Environment Configuration

1. **Clone the repository**
```bash
git clone https://github.com/Adwoa-Projects/preevy-preview-manager.git
cd preevy-preview-manager
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create `.env.local` file in the project root:
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/preevy_dev

# Optional: For development debugging
NEXT_PUBLIC_APP_ENV=development
```

For Neon database (recommended for development):
```env
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

4. **Set up the database**

For development (direct schema push):
```bash
npm run db:push
```

For production-like setup (with migrations):
```bash
npm run db:generate
npm run db:migrate
```

5. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Database Development

### Schema Changes

1. **Modify the schema**
   Edit `db/schema.ts` with your changes

2. **Generate migration** (for production)
```bash
npm run db:generate
```

3. **Apply changes locally**
```bash
# For development (quick iteration)
npm run db:push

# OR for production-like workflow
npm run db:migrate
```

4. **View database contents**
```bash
npm run db:studio
```

### Available Database Commands

```bash
npm run db:generate    # Generate migration files
npm run db:migrate     # Apply migrations
npm run db:push        # Push schema directly (dev only)
npm run db:studio      # Open Drizzle Studio
```

### Schema Best Practices

1. **Always add indexes** for frequently queried columns
2. **Use appropriate data types** (varchar with limits, not text for IDs)
3. **Add constraints** for data integrity
4. **Include timestamps** for auditing
5. **Use enums** for predefined values

## API Development

### Adding New Endpoints

1. **Create route file**
```bash
# For /api/new-endpoint
touch app/api/new-endpoint/route.ts
```

2. **Implement handlers**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET() {
  // Implementation
}

export async function POST(req: NextRequest) {
  // Implementation
}
```

3. **Follow existing patterns**
- Use consistent error handling
- Return `{ ok: true }` for success
- Return `{ ok: false, error: "message" }` for errors
- Use proper HTTP status codes

### API Testing

Currently no automated testing is set up. Manual testing:

```bash
# Test GET endpoint
curl http://localhost:3000/api/previews

# Test POST endpoint
curl -X POST http://localhost:3000/api/previews \
  -H "Content-Type: application/json" \
  -d '{"build_id":"test-123","repo":"test/repo","pr_number":1,"commit_sha":"abc123","branch":"main","actor":"test","frontend_url":"https://example.com"}'

# Test PATCH endpoint
curl -X PATCH http://localhost:3000/api/previews \
  -H "Content-Type: application/json" \
  -d '{"build_id":"test-123","status":"down"}'
```

## Code Organization

### Project Structure
```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── previews/      # Preview endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── db/                    # Database layer
│   ├── index.ts          # Database connection
│   └── schema.ts         # Schema definitions
├── drizzle/              # Migration files (auto-generated)
├── docs/                 # Documentation
├── drizzle.config.ts     # Drizzle configuration
├── vercel.json           # Deployment config
└── package.json          # Dependencies and scripts
```

### File Naming Conventions
- **API routes**: `route.ts` (Next.js App Router convention)
- **Database files**: `kebab-case.ts`
- **Components**: `PascalCase.tsx` (when added)
- **Utilities**: `camelCase.ts` (when added)

### Import Conventions
```typescript
// External libraries first
import { NextRequest, NextResponse } from 'next/server';
import { eq, desc } from 'drizzle-orm';

// Internal imports with alias
import { db, previews } from '@/db';
import { someUtil } from '@/lib/utils';
```

## Debugging

### Database Debugging

1. **Use Drizzle Studio**
```bash
npm run db:studio
```

2. **Check migration status**
```bash
npx drizzle-kit check
```

3. **View generated SQL**
Check the `drizzle/` folder for migration files

### API Debugging

1. **Check server logs**
   Development server shows console.log output

2. **Use browser dev tools**
   Network tab shows request/response details

3. **Add logging** (not currently implemented)
```typescript
console.log('Request body:', body);
console.log('Database result:', result);
```

## Common Development Tasks

### Adding a New Field to Preview

1. **Update schema**
```typescript
// In db/schema.ts
export const previews = pgTable('previews', {
  // ... existing fields
  new_field: text('new_field'),
});
```

2. **Generate migration**
```bash
npm run db:generate
```

3. **Apply locally**
```bash
npm run db:push
```

4. **Update API endpoints**
```typescript
// In app/api/previews/route.ts
.values({
  // ... existing fields
  new_field: body.new_field,
})
```

### Adding Input Validation

Currently not implemented. Recommended approach:

1. **Install Zod**
```bash
npm install zod
```

2. **Create validation schemas**
```typescript
// lib/validation.ts
import { z } from 'zod';

export const createPreviewSchema = z.object({
  build_id: z.string().min(1).max(64),
  repo: z.string().min(1),
  pr_number: z.number().int().positive(),
  // ... other fields
});
```

3. **Use in API routes**
```typescript
const validatedData = createPreviewSchema.parse(body);
```

### Adding Authentication

Not currently implemented. Recommended approach:

1. **API Key approach**
```typescript
const apiKey = req.headers.get('x-api-key');
if (apiKey !== process.env.API_KEY) {
  return NextResponse.json(
    { ok: false, error: 'Unauthorized' },
    { status: 401 }
  );
}
```

2. **JWT approach**
```bash
npm install jsonwebtoken @types/jsonwebtoken
```

## Performance Considerations

### Database Performance
- **Indexes are already added** for common query patterns
- **Consider connection pooling** for high traffic
- **Monitor query performance** with database tools

### API Performance
- **No caching implemented** - consider Redis for caching
- **No rate limiting** - consider implementing for production
- **No request size limits** - consider adding middleware

## Deployment

### Development to Production Workflow

1. **Make changes locally**
2. **Test thoroughly**
3. **Generate migrations** if schema changed
4. **Commit changes**
5. **Push to repository**
6. **Vercel auto-deploys** and runs migrations

### Environment Variables in Production

Set in Vercel dashboard or via CLI:
```bash
vercel env add DATABASE_URL
```

### Monitoring Production

Currently no monitoring is set up. Recommended:
- **Error tracking**: Sentry
- **Performance monitoring**: Vercel Analytics
- **Database monitoring**: Neon dashboard
- **API monitoring**: Custom health checks

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check `DATABASE_URL` format
   - Verify database server is running
   - Check network connectivity

2. **Migration errors**
   - Review generated SQL in `drizzle/` folder
   - Check for data conflicts
   - Backup database before major changes

3. **API errors**
   - Check request format matches expected schema
   - Verify all required fields are present
   - Check database constraints

4. **Build errors**
   - Clear `.next` folder: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npx tsc --noEmit`

### Getting Help

1. **Check error logs** in development server or Vercel dashboard
2. **Review documentation** in this repository
3. **Check database constraints** in schema file
4. **Test with simple requests** first, then complex ones