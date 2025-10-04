# TeamDynamix API MCP Server

## Documentation
- **TeamDynamix Web API**: https://solutions.teamdynamix.com/TDWebAPI/
- **MCP SDK**: https://github.com/modelcontextprotocol/sdk

## Configuration

Create a `.env` file in the project root:

```env
TDX_BASE_URL=https://your-instance.teamdynamix.com
TDX_USERNAME=your-username
TDX_PASSWORD=your-password
```

**Note**: Manual `.env` parsing is used (no dotenv dependency) due to CommonJS/ESM compatibility issues with Claude Desktop.

## Architecture

### Files
- `index.ts` - MCP server entry point, tool routing, .env parsing
- `client.ts` - TDXClient with axios interceptors
- `auth.ts` - JWT token management (24hr validity, cached 23hr)
- `tools.ts` - MCP tool schemas
- `handlers.ts` - Tool implementations, camelCase→PascalCase conversion

### Authentication Flow
1. POST `/api/auth` with `{ username, password }` → JWT token
2. Token cached for 23 hours (1hr buffer before 24hr expiry)
3. Auto-refresh on 401 responses (⚠️ watch for infinite loop if refresh fails)

### Request Flow
MCP call → Handler → Transform params → HTTP request → Auth interceptor adds JWT → Response

## API Endpoints

```
POST   /api/auth                  # Authentication
POST   /api/tickets/search        # Search tickets
GET    /api/tickets/{id}          # Get ticket
PUT    /api/tickets/{id}          # Edit (full update)
PATCH  /api/tickets/{id}          # Update (partial)
POST   /api/tickets/{id}/feed     # Add comment
GET    /api/reports               # List reports
GET    /api/reports/search        # Search reports
GET    /api/reports/{id}          # Run report
```

## Field Name Conversions

API uses PascalCase, MCP tools use camelCase:

| MCP Tool (camelCase) | TDX API (PascalCase) |
|---------------------|---------------------|
| `searchText` | `SearchText` |
| `maxResults` | `MaxResults` |
| `statusIds` | `StatusIDs` |
| `priorityIds` | `PriorityIDs` |
| `comments` | `Comments` |
| `isPrivate` | `IsPrivate` |

## Important Constraints

### Edit Ticket (PUT) Requirements
Must include at least one of:
- `RequestorEmail`
- `RequestorUid`
- `AccountID`

### Non-Editable Fields (if ticket converted to task)
- `StartDate`, `EndDate`, `EstimatedMinutes`
- `ResponsibleGroupID`, `ResponsibleUid`
- `StatusID` (if task not completed)

## Known Issues

1. **Auth endpoint** - Verify correct endpoint (currently `/api/auth`, docs may show `/api/auth/login`)
2. **401 retry loop** - client.ts:28-34 can infinite loop if token refresh fails
3. **Missing appId** - TeamDynamix may require `appId` parameter in auth requests
4. **Weak typing** - Heavy use of `any` types throughout

## Configuration

- HTTP timeout: 20 seconds
- Token expiry: 23 hours (hardcoded)
- Error format: `{ content: [{ type: 'text', text: 'Error: ...' }], isError: true }`

## Potential Improvements

**High Priority:**
- Add retry limit to 401 handler (prevent infinite loop)
- Define TypeScript interfaces for API models
- Verify auth endpoint and appId requirement

**Medium Priority:**
- Add structured logging
- Make timeout/expiry configurable
- Add rate limit handling (429)
- Add input validation (Zod)

**Low Priority:**
- Enable TypeScript strict mode
- Add unit tests
