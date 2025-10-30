# API Documentation

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-app.vercel.app`

## Response Format

All endpoints return JSON responses with a consistent structure:

**Success Response:**
```json
{
  "ok": true,
  // additional data for GET requests
}
```

**Error Response:**
```json
{
  "ok": false,
  "error": "Error message description"
}
```

## Endpoints

### Create or Update Preview

**`POST /api/previews`**

Creates a new preview deployment record or updates an existing one based on `build_id`.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "build_id": "string",        // Required: Unique build identifier
  "repo": "string",            // Required: Repository name
  "pr_number": number,         // Required: Pull request number
  "commit_sha": "string",      // Required: Git commit SHA (max 64 chars)
  "branch": "string",          // Required: Git branch name
  "actor": "string",           // Required: User who triggered the build
  "frontend_url": "string",    // Required: URL of deployed preview
  "status": "string"           // Optional: "ready" | "down" | "error" (default: "ready")
}
```

#### Response
**Status: 200 OK**
```json
{
  "ok": true
}
```

#### Behavior
- **Upsert operation**: If a record with the same `build_id` exists, it updates `frontend_url`, `status`, and `updated_at`
- **Insert operation**: If no record exists with the `build_id`, creates a new record
- **Default status**: If `status` is not provided, defaults to `"ready"`

#### Example Request
```bash
curl -X POST https://your-app.vercel.app/api/previews \
  -H "Content-Type: application/json" \
  -d '{
    "build_id": "build-abc123",
    "repo": "myorg/myrepo",
    "pr_number": 42,
    "commit_sha": "abc123def456789",
    "branch": "feature/awesome-feature",
    "actor": "john.doe",
    "frontend_url": "https://preview-abc123.vercel.app",
    "status": "ready"
  }'
```

---

### Update Preview Status

**`PATCH /api/previews`**

Updates the status of an existing preview deployment.

#### Request Headers
```
Content-Type: application/json
```

#### Request Body
```json
{
  "build_id": "string",    // Required: Build ID to update
  "status": "string"       // Required: New status ("ready" | "down" | "error")
}
```

#### Response
**Status: 200 OK**
```json
{
  "ok": true
}
```

**Status: 400 Bad Request**
```json
{
  "ok": false,
  "error": "Missing build_id or status"
}
```

#### Example Request
```bash
curl -X PATCH https://your-app.vercel.app/api/previews \
  -H "Content-Type: application/json" \
  -d '{
    "build_id": "build-abc123",
    "status": "down"
  }'
```

---

### List All Previews

**`GET /api/previews`**

Retrieves all preview deployments, ordered by creation time (newest first).

#### Request Headers
None required.

#### Query Parameters
None currently supported.

#### Response
**Status: 200 OK**
```json
[
  {
    "id": 1,
    "build_id": "build-abc123",
    "repo": "myorg/myrepo",
    "pr_number": 42,
    "commit_sha": "abc123def456789",
    "branch": "feature/awesome-feature",
    "actor": "john.doe",
    "frontend_url": "https://preview-abc123.vercel.app",
    "status": "ready",
    "created_at": "2025-10-30T14:30:00.000Z",
    "updated_at": "2025-10-30T14:30:00.000Z"
  },
  {
    "id": 2,
    "build_id": "build-def456",
    "repo": "myorg/another-repo",
    "pr_number": 15,
    "commit_sha": "def456abc789123",
    "branch": "fix/bug-fix",
    "actor": "jane.smith",
    "frontend_url": "https://preview-def456.vercel.app",
    "status": "error",
    "created_at": "2025-10-30T13:15:00.000Z",
    "updated_at": "2025-10-30T13:20:00.000Z"
  }
]
```

#### Example Request
```bash
curl https://your-app.vercel.app/api/previews
```

---

## Status Values

| Status | Description |
|--------|-------------|
| `ready` | Preview is live and accessible |
| `down` | Preview is temporarily unavailable |
| `error` | Preview deployment failed or encountered an error |

## Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "ok": false,
  "error": "Missing build_id or status"
}
```

#### 500 Internal Server Error
```json
{
  "ok": false,
  "error": "Database connection failed"
}
```

### Error Scenarios

1. **Missing Required Fields**: POST/PATCH requests missing required fields return 400
2. **Database Errors**: Connection issues or constraint violations return 500
3. **Invalid JSON**: Malformed request body returns 400
4. **Invalid Status Values**: Non-enum status values may cause database errors

## Rate Limiting

**⚠️ Currently not implemented** - All endpoints are unprotected and could be subject to abuse.

## Authentication

**⚠️ Currently not implemented** - All endpoints are publicly accessible.

## Pagination

**⚠️ Currently not implemented** - GET endpoint returns all records without pagination.

## Filtering & Search

**⚠️ Currently not implemented** - No query parameters are supported for filtering.

## Future API Enhancements

### Planned Improvements

1. **Authentication**: API key or JWT-based authentication
2. **Pagination**: `?page=1&limit=50` query parameters
3. **Filtering**: `?repo=myorg/myrepo&status=ready` filters
4. **Search**: `?search=feature-branch` text search
5. **Sorting**: `?sort=created_at&order=desc` custom sorting
6. **RESTful Routes**: `PATCH /api/previews/{build_id}` for status updates
7. **Bulk Operations**: `DELETE /api/previews` with query filters
8. **Health Check**: `GET /api/health` endpoint

### Proposed RESTful Routes

```
GET    /api/previews           # List all previews
POST   /api/previews           # Create new preview
GET    /api/previews/{build_id} # Get specific preview
PATCH  /api/previews/{build_id} # Update specific preview
DELETE /api/previews/{build_id} # Delete specific preview
```

## Integration Examples

### CI/CD Pipeline Integration

**GitHub Actions Example:**
```yaml
- name: Register Preview
  run: |
    curl -X POST ${{ secrets.PREVIEW_API_URL }}/api/previews \
      -H "Content-Type: application/json" \
      -d '{
        "build_id": "${{ github.run_id }}",
        "repo": "${{ github.repository }}",
        "pr_number": ${{ github.event.number }},
        "commit_sha": "${{ github.sha }}",
        "branch": "${{ github.head_ref }}",
        "actor": "${{ github.actor }}",
        "frontend_url": "https://preview-${{ github.run_id }}.vercel.app",
        "status": "ready"
      }'
```

**Status Update Example:**
```yaml
- name: Update Preview Status
  if: failure()
  run: |
    curl -X PATCH ${{ secrets.PREVIEW_API_URL }}/api/previews \
      -H "Content-Type: application/json" \
      -d '{
        "build_id": "${{ github.run_id }}",
        "status": "error"
      }'
```