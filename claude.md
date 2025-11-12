# TeamDynamix Tickets API MCP Server - Claude Reference

> **For detailed tool usage and examples, see [TOOLS.md](./TOOLS.md)**

## Quick Reference

**Active Environments:**
- **Production**: `https://solutions.teamdynamix.com/TDWebApi` (App ID: 129)
- **Test**: `https://part01-demo.teamdynamixtest.com/TDWebApi` (App ID: TBD)
- **Canary**: `https://eng.teamdynamixcanary.com/TDWebApi` (App ID: TBD)
- **Development**: `http://localhost/TDDev/TDWebApi` (App ID: 627)

**Credential Directory:** `~/.config/tdx-mcp/` (Windows: `C:\Users\username\.config\tdx-mcp\`)

## Configuration

**Setup**: When the user asks to setup or configure the MCP server (e.g., "setup", "Set up the TeamDynamix MCP server", "configure this MCP server"), follow the **MCP Server Setup Workflow** below.

**Documentation:**
- **[SETUP-GUIDE.md](./SETUP-GUIDE.md)** - User-facing setup guide (what to expect)
- **[TOOLS.md](./TOOLS.md)** - Complete tool reference with all parameters and examples
- **[README.md](./README.md)** - Human-readable setup and configuration guide

---

## MCP Server Setup Workflow

When the user requests setup (e.g., "Set up the TeamDynamix MCP server"), follow these steps exactly:

### Step 0: Install Dependencies and Build

**IMPORTANT**: Always run these first, even if user already cloned the repo.

1. **Check if in correct directory**:
   ```bash
   test -f package.json && echo "✓ In correct directory" || echo "✗ Not in MCP server directory"
   ```
   - If not in directory, ask user for path or help them navigate

2. **Install dependencies**:
   ```bash
   npm install
   ```
   - If fails, report error and stop
   - Common issue: Node.js not installed or wrong version

3. **Build TypeScript**:
   ```bash
   npm run build
   ```
   - If fails, report error and stop
   - This creates `dist/index.js` required for MCP server

4. **Verify build succeeded**:
   ```bash
   test -f dist/index.js && echo "✓ Build successful" || echo "✗ Build failed"
   ```

### Step 1: Run Interactive Setup Tool

**IMPORTANT**: The setup tool MUST be run in a separate terminal to properly mask password entry. DO NOT attempt to run it via Claude's Bash tool - it will fail because password input requires an interactive terminal.

1. **Get current working directory** to construct the command with full path:
   ```bash
   pwd
   ```

2. **Tell user to run the setup tool in a separate terminal window**:
   ```
   Copy and paste the following into a SEPARATE terminal window to generate credentials for the Ticket API MCP server (or type "skip"):

   ---------------------------------------
   cd {PATH_FROM_PWD}
   npm run setup-env-config
   ---------------------------------------

   Once complete, copy and paste the entire output (including TDXCREDS:START and TDXCREDS:END) back to me.
   ```

   **Note**: Replace `{PATH_FROM_PWD}` with the actual path returned from `pwd` in Step 1.

   **If user tries to run via Claude**: Politely remind them that the setup tool cannot be run through Claude's Bash tool and they must use a separate terminal window for password security.

### Step 2: Parse Setup Tool Output

When user pastes the `TDXCREDS:START...END` output (or user types 'skip' to skip to Step 4):

1. **Validate format**:
   - Must contain `TDXCREDS:START` and `TDXCREDS:END`
   - Must have all required fields: `environment`, `baseUrl`, `username`, `password`, `appIds`

2. **Parse the output**:
   ```typescript
   const match = output.match(/TDXCREDS:START\s*([\s\S]*?)\s*TDXCREDS:END/);
   if (!match) {
     console.error('✗ Invalid format: Missing TDXCREDS markers');
     return;
   }

   const lines = match[1].trim().split('\n');
   const config: Record<string, string> = {};
   for (const line of lines) {
     const [key, ...valueParts] = line.split('=');
     config[key.trim()] = valueParts.join('=').trim();
   }

   // Validate required fields
   const required = ['environment', 'baseUrl', 'username', 'password', 'appIds'];
   for (const field of required) {
     if (!config[field]) {
       console.error(`✗ Missing required field: ${field}`);
       return;
     }
   }
   ```

3. **Validate password format**:
   - Must start with `dpapi:`
   - If not, reject and ask user to run setup tool again

### Step 3: Create Credentials File

Using the parsed configuration from Step 2:

1. **Determine credential file path**:
   ```bash
   # Windows: C:\Users\username\.config\tdx-mcp\{environment}-credentials.json
   # Example: C:\Users\john\.config\tdx-mcp\prod-credentials.json
   ```

2. **Check if credentials already exist**:
   ```bash
   test -f "$HOME/.config/tdx-mcp/${environment}-credentials.json" && echo "✓ File exists" || echo "✗ File does not exist"
   ```

   If file exists, ask user:
   ```
   Credentials for '{environment}' already exist. Do you want to overwrite them with the new credentials?
   ```

   If user declines, skip to Step 4. If user accepts or file doesn't exist, continue.

3. **Create directory if needed**:
   ```bash
   powershell -Command "New-Item -ItemType Directory -Force -Path \"$HOME\.config\tdx-mcp\""
   ```

   **Note**: Use `$HOME` not `$env:USERPROFILE` to avoid path format errors.

4. **Create credentials JSON** using parsed values:
   ```json
   {
     "TDX_BASE_URL": "{baseUrl from parsed config}",
     "TDX_USERNAME": "{username from parsed config}",
     "TDX_PASSWORD": "{password from parsed config}",
     "TDX_TICKET_APP_IDS": "{appIds from parsed config}"
   }
   ```

5. **Write file** using Write tool to `~/.config/tdx-mcp/{environment}-credentials.json`

6. **Verify file created**:
   ```bash
   test -f "$HOME/.config/tdx-mcp/${environment}-credentials.json" && echo "✓ Credentials saved"
   ```

### Step 4: Install MCP Server to Target Project

**IMPORTANT**: This MCP server is installed **per-project**, not globally. Each project that wants to use it gets its own `.mcp.json` file.

⚠️ **Path Requirements:**
- This repo's `.mcp.json` uses **relative path**: `"./dist/index.js"` (works only in this repo)
- When copied to other projects, **MUST change to absolute path**: `"C:/source/MCP/tdx-api-tickets-mcp/dist/index.js"`
- Otherwise the other project won't know where to find the MCP server
- Claude automatically converts relative to absolute during setup

1. **Ask for target project path**:
   ```
   Which project should use this MCP server?
   Enter the project directory path (example: 'C:\source\my-project'):
   ```

2. **Validate path exists**:
   ```bash
   test -d "PROJECT_PATH" && echo "✓ Directory exists" || echo "✗ Directory not found"
   ```
   - If not found, ask user: "Would you like me to create this directory? (yes/no)"
   - If yes, create directory: `mkdir -p "PROJECT_PATH"`
   - If no, ask for path again

3. **Check not configuring self**:
   ```bash
   # Compare absolute paths
   PROJECT_ABS=$(cd "PROJECT_PATH" && pwd)
   MCP_ABS=$(pwd)
   if [ "$PROJECT_ABS" = "$MCP_ABS" ]; then
     echo "✗ Cannot install MCP server into itself"
     echo "   The MCP server project doesn't need to reference itself"
     echo "   Please specify a different project that will USE this MCP server"
     # Ask for path again
   fi
   ```

4. **Get absolute path to MCP server**:
   ```bash
   MCP_SERVER_PATH=$(cd C:\source\MCP\tdx-api-tickets-mcp && pwd)
   ```

5. **Copy `.mcp.json` template to target project**:
   - Read the `.mcp.json` from this repo
   - Update the `args` path to absolute path: `${MCP_SERVER_PATH}/dist/index.js`
   - Write to `${PROJECT_PATH}/.mcp.json`

   Example `.mcp.json` content:
   ```json
   {
     "mcpServers": {
       "tdx-api-tickets-mcp": {
         "type": "stdio",
         "command": "node",
         "args": ["C:/source/MCP/tdx-api-tickets-mcp/dist/index.js"],
         "env": {
           "TDX_PROD_CREDENTIALS_FILE": "~/.config/tdx-mcp/prod-credentials.json",
           "TDX_TEST_CREDENTIALS_FILE": "~/.config/tdx-mcp/test-credentials.json",
           "TDX_CANARY_CREDENTIALS_FILE": "~/.config/tdx-mcp/canary-credentials.json",
           "TDX_DEV_CREDENTIALS_FILE": "~/.config/tdx-mcp/dev-credentials.json",
           "TDX_DEFAULT_ENVIRONMENT": "prod"
         }
       }
     }
   }
   ```

### Step 5: Completion

Report to user:
```
✓ Setup complete!

Files created:
  • Credentials: ~/.config/tdx-mcp/{environment}-credentials.json (if configured)
  • MCP config: {PROJECT_PATH}/.mcp.json

The MCP server is now available in the target project.

Next steps:
  1. Open the target project in Claude Code (or restart if already open)
  2. Test by asking: "List available TeamDynamix reports"

Note: Credentials in ~/.config/tdx-mcp/ are shared across all projects.
      Each project has its own .mcp.json pointing to these credentials.
```

---

## Updating Existing Configuration

If user asks to update/modify existing setup OR show current configuration:

1. **Detect existing credentials**:
   ```bash
   ls "$HOME/.config/tdx-mcp/"
   ```

2. **Check for project MCP configuration**:
   ```bash
   test -f .mcp.json && echo "✓ Project .mcp.json exists" || echo "✗ No .mcp.json in current project"
   ```

3. **Show current credentials**:
   ```bash
   cat "$HOME/.config/tdx-mcp/${environment}-credentials.json"
   ```

4. **Display status to user**:
   ```
   Your Current Configuration:

   Credentials (shared across all projects):
     • Production: username@domain.com → App 129 → solutions.teamdynamix.com
     • Test: username → App 138 → part01-demo.teamdynamixtest.com
     • Canary: username → App 627 → eng.teamdynamixcanary.com
     • Development: username → App 627 → localhost/TDDev

   MCP Server Configuration:
     ✓ Project has .mcp.json
       - MCP server configured for this project
       - Can copy .mcp.json to other projects (update 'args' path to absolute)

   Next Steps:
     • Update credentials (username/password/apps)
     • Add new environment
     • Copy .mcp.json to another project
   ```

5. **Ask what to update** (if user wants to modify):
   ```
   What would you like to do?
   [1] Change credentials (username/password)
   [2] Modify application selection
   [3] Add new environment (test/canary/dev)
   [4] Copy .mcp.json to another project

   Select option (1-4):
   ```

6. **Apply updates** based on selection:
   - Options 1-3: Update credential files
   - Option 4: Help copy `.mcp.json` to another project (update 'args' path to absolute)

---

## Error Handling

**Authentication timeout**:
```
✗ Authentication timeout after 10s.
  Check that the TeamDynamix server is accessible at {url}
```

**Invalid credentials**:
```
✗ Authentication failed: Invalid username or password
  Please verify your credentials are correct
```

**Build failure**:
```
✗ Build failed. Check that:
  • Node.js 18+ is installed
  • You're in the correct directory
  • package.json exists
```

**Network errors**:
```
✗ Cannot reach server at {url}
  Check that:
  • URL is correct
  • You have network connectivity
  • Server is online
```

**Credential files** (`~/.config/tdx-mcp/prod-credentials.json`, `test-credentials.json`, `canary-credentials.json`, `dev-credentials.json`):
```json
{
  "TDX_BASE_URL": "https://solutions.teamdynamix.com/TDWebApi",
  "TDX_USERNAME": "username",
  "TDX_PASSWORD": "dpapi:AQAAANCMnd8BFdERjHoAwE...",
  "TDX_TICKET_APP_IDS": "129"
}
```
**Password encryption**:
- **DPAPI encryption required** (Windows only): `"TDX_PASSWORD": "dpapi:AQAAANCMnd8BFdERjHoAwE..."`
- Claude handles password encryption during setup using PowerShell DPAPI commands
- Passwords are tied to your Windows user account and cannot be decrypted by others

**Environment variables**:
- `TDX_PROD_CREDENTIALS_FILE`: Path to prod credentials
- `TDX_TEST_CREDENTIALS_FILE`: Path to test credentials
- `TDX_CANARY_CREDENTIALS_FILE`: Path to canary credentials
- `TDX_DEV_CREDENTIALS_FILE`: Path to dev credentials
- `TDX_DEFAULT_ENVIRONMENT`: "prod", "test", "canary", or "dev" (default: "prod")

**Using environments**: All tools accept optional `environment` parameter ("prod"/"test"/"canary"/"dev")
```javascript
tdx_get_ticket({ ticketId: 12345 })  // uses default (prod)
tdx_get_ticket({ ticketId: 456, environment: "test" })
tdx_get_ticket({ ticketId: 789, environment: "canary" })
tdx_get_ticket({ ticketId: 555058, environment: "dev" })
```

## Testing
- Production: `npm run test:prod`
- Test: `npm run test:test`
- Canary: `npm run test:canary`
- Development: `npm run test:api`

## Key API Behaviors

**Ticket Updates**:
- `tdx_update_ticket`: Partial update (auto-merges with current ticket)
- `tdx_edit_ticket`: Full update (requires all mandatory fields)

**Tags**: GET ticket does NOT return tags (API rollback #27053287). POST/DELETE work correctly.

**Reports**:
- `withData=true` returns ALL rows (no MaxResults limit). 90s SQL timeout only limit.
- API does NOT expose report filter criteria/WHERE clauses. Only returns: columns, sort order, max results, metadata.
- **Report Selection Priority**: When multiple reports match, prefer "All Open Tickets" over team-specific reports (e.g., "Team Name - Open Tickets").
- **Handle ambiguity gracefully**: When multiple reports match: (1) Use the general/global report and return results, (2) At the end of results, mention other matching reports found (include names and IDs), (3) Inform user they can query those if interested, but don't anticipate or wait for action.
- **Global vs Team Reports**: Prefer global reports unless user specifies a team/project context.

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
- **DPAPI encryption required**: All passwords must be DPAPI-encrypted (Windows Data Protection API)
- **Password validation**: DPAPI encrypted data validated as base64 before decryption (prevents injection)
- **Input validation**: Base64 format validated with regex before PowerShell execution
- **No command injection**: Password decryption uses validated input only
- **User-scoped**: DPAPI ties encryption to Windows user account - others cannot decrypt

## Known Issues
- MCP server requires restart after code changes
- **FIXED**: ~~401 retry can infinite loop if token refresh fails~~ (now limited to 1 retry)
- **FIXED**: ~~Command injection vulnerability in DPAPI decryption~~ (now validates input)
