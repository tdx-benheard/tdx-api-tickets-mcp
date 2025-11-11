# TeamDynamix Tickets API MCP Server - Claude Reference

> **For detailed tool usage and examples, see [TOOLS.md](./TOOLS.md)**

## Quick Reference

**Active Environments:**
- **Production**: `https://solutions.teamdynamix.com/TDWebApi` (App ID: 129)
- **Development**: `http://localhost/TDDev/TDWebApi` (App ID: 627)
- **Canary**: `https://eng.teamdynamixcanary.com/TDWebApi` (App ID: TBD)

**Credential Directory:** `~/.config/tdx-mcp/` (Windows: `C:\Users\username\.config\tdx-mcp\`)

## Configuration

**Setup**: When the user asks to setup or configure the MCP server, run `npm run setup` (interactive wizard)

**Documentation:**
- **[TOOLS.md](./TOOLS.md)** - Complete tool reference with all parameters and examples
- **[README.md](./README.md)** - Human-readable setup and configuration guide

**Credential files** (`~/.config/tdx-mcp/prod-credentials.json`, `dev-credentials.json`, `canary-credentials.json`):
```json
{
  "TDX_BASE_URL": "https://solutions.teamdynamix.com/TDWebApi",
  "TDX_USERNAME": "username",
  "TDX_PASSWORD": "password",
  "TDX_TICKET_APP_IDS": "129"
}
```
**Password encoding**: Passwords support multiple formats:
- Plain text: `"TDX_PASSWORD": "mypassword"`
- Base64-encoded: `"TDX_PASSWORD": "base64:Qm...=="`
- DPAPI-encrypted (Windows): `"TDX_PASSWORD": "dpapi:AQAAANCMnd8BFdERjHoAwE..."`

**Environment variables**:
- `TDX_PROD_CREDENTIALS_FILE`: Path to prod credentials
- `TDX_DEV_CREDENTIALS_FILE`: Path to dev credentials
- `TDX_CANARY_CREDENTIALS_FILE`: Path to canary credentials
- `TDX_DEFAULT_ENVIRONMENT`: "prod", "dev", or "canary" (default: "prod")

**Using environments**: All tools accept optional `environment` parameter ("prod"/"dev"/"canary")
```javascript
tdx_get_ticket({ ticketId: 12345 })  // uses default (prod)
tdx_get_ticket({ ticketId: 555058, environment: "dev" })
tdx_get_ticket({ ticketId: 789, environment: "canary" })
```

## Testing
- Development: `npm run test:api`
- Production: `npm run test:prod`
- Canary: `npm run test:canary`

## Key API Behaviors

**Ticket Updates**:
- `tdx_update_ticket`: Partial update (auto-merges with current ticket)
- `tdx_edit_ticket`: Full update (requires all mandatory fields)

**Tags**: GET ticket does NOT return tags (API rollback #27053287). POST/DELETE work correctly.

**Reports**:
- `withData=true` returns ALL rows (no MaxResults limit). 90s SQL timeout only limit.
- API does NOT expose report filter criteria/WHERE clauses. Only returns: columns, sort order, max results, metadata.

**App ID Discovery**: Server tries each configured app ID until ticket found, then caches result.

**Field Names**: Tools use camelCase, API uses PascalCase (auto-converted).

## Architecture
- `index.ts`: MCP server, credential loading
- `client.ts`: TDXClient with axios, retry logic, error handling
- `auth.ts`: JWT tokens (24hr validity, 23hr cache per environment, thread-safe refresh)
- `tools.ts`: MCP tool schemas
- `handlers.ts`: Tool implementations
- `types.ts`: TypeScript interfaces for all API entities
- `utils.ts`: Shared utilities (password decoding, env validation, retry helpers)

## Error Handling & Resilience
- **401 Unauthorized**: Automatically invalidates token and retries once
- **Retryable errors** (408, 429, 500, 502, 503, 504): Automatic retry with exponential backoff (max 3 retries)
- **Timeout**: 20 seconds default (configurable per client)
- **Token refresh**: Thread-safe mutex prevents concurrent refresh requests
- **Cache invalidation**: Ticket app ID cache cleared on any error, not just 404s

## Security
- **Password encryption**: DPAPI passwords validated as base64 before decryption (prevents injection)
- **Input validation**: base64 format validated with regex before PowerShell execution
- **No command injection**: Password decryption uses stdin with validated input

## Known Issues
- MCP server requires restart after code changes
- **FIXED**: ~~401 retry can infinite loop if token refresh fails~~ (now limited to 1 retry)
- **FIXED**: ~~Command injection vulnerability in DPAPI decryption~~ (now validates input)
