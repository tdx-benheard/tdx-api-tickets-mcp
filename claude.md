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

### Step 0: Verify Correct Directory

1. **Check if in correct directory**:
   ```bash
   test -f package.json && echo "✓ In correct directory" || echo "✗ Not in MCP server directory"
   ```
   - If not in directory, ask user for path or help them navigate

**Note**: The setup script now handles dependency installation and build automatically.

### Step 1: Run Interactive Setup Tool

1. **Get current working directory and store as MCP_SERVER_PATH**:
   ```bash
   pwd
   ```
   Store the result, converting Git Bash format to Windows format if needed:
   - Git Bash format: `/c/source/MCP/tdx-api-tickets-mcp`
   - Windows format: `C:\source\MCP\tdx-api-tickets-mcp`

   This MCP_SERVER_PATH will be used in Step 3 for the .mcp.json configuration.

2. **Tell user to run the setup tool** (use EXACT text below, do NOT add explanations of what the setup tool does):

   Now please run the interactive setup tool by pasting the below commands in a SEPARATE terminal window:

   ```
   --------------------
   cd {MCP_SERVER_PATH}
   npm run setup
   --------------------
   ```

   When complete, return here and say: "complete"

   **Note**: Replace `{MCP_SERVER_PATH}` with the Windows-formatted path from step 1 above.

### Step 2: Verify Credentials Created

When user says "complete":

1. **Read the credentials file** to verify setup succeeded:
   ```bash
   cat "$HOME/.config/tdx-mcp/prod-credentials.json"
   ```

2. **Validate the credentials file**:
   - Must exist and contain valid JSON
   - Must have required fields: `TDX_BASE_URL`, `TDX_USERNAME`, `TDX_PASSWORD`, `TDX_TICKET_APP_IDS`
   - Password must start with `dpapi:`

3. **If file doesn't exist or is invalid**:
   - Tell user the setup didn't complete successfully
   - Ask them to check terminal output for errors
   - Suggest rerunning the setup command

### Step 3: Install MCP Server to Target Project

**IMPORTANT**: This MCP server is installed **per-project**, not globally. Each project that wants to use it gets its own `.mcp.json` file.

⚠️ **Path Requirements:**
- This repo's `.mcp.json` uses **relative path**: `"./dist/index.js"` (works only in this repo)
- When copied to other projects, **MUST change to absolute path**: `"C:/source/MCP/tdx-api-tickets-mcp/dist/index.js"`
- Otherwise the other project won't know where to find the MCP server
- Claude automatically converts relative to absolute during setup

1. **Ask user where to install MCP server** using AskUserQuestion tool:
   ```javascript
   AskUserQuestion({
     questions: [{
       question: "Where do you open Claude Code?",
       header: "Install Path",
       multiSelect: false,
       options: [
         {
           label: "C:\\source\\TDDev\\enterprise",
           description: "Standard TDDev enterprise directory - install .mcp.json there"
         },
         {
           label: "Don't install",
           description: "Use MCP server only from this folder (no .mcp.json installation)"
         },
         {
           label: "Custom path",
           description: "Enter a different directory path"
         }
       ]
     }]
   })
   ```

2. **Handle user choice**:
   - **If "C:\\source\\TDDev\\enterprise"**: Use `C:\source\TDDev\enterprise` as PROJECT_PATH
   - **If "Don't install"**: Say: "You can open Claude Code in the MCP Server folder and the server will be available for that session." Then exit successfully.
   - **If "Custom path"**: Ask user to enter custom path

3. **Validate and handle `.mcp.json` installation**:

   Single bash command to check directory and file status:
   ```bash
   PROJECT_PATH="<path_from_step_2>"
   MCP_ABS=$(pwd)

   # Check everything at once
   if [ ! -d "$PROJECT_PATH" ]; then
     echo "DIR_NOT_FOUND"
   elif [ "$(cd "$PROJECT_PATH" && pwd)" = "$MCP_ABS" ]; then
     echo "SELF_REFERENCE"
   elif [ -f "$PROJECT_PATH/.mcp.json" ]; then
     echo "FILE_EXISTS"
   else
     echo "CREATE_NEW"
   fi
   ```

   **Handle each case**:

   - **DIR_NOT_FOUND**: Ask user: "Directory doesn't exist. Would you like me to create it? (yes/no)"
     - If yes: `mkdir -p "PROJECT_PATH"` then proceed to CREATE_NEW
     - If no: Go back to step 1

   - **SELF_REFERENCE**: Say: "Cannot install MCP server into itself, it already works if Claude is opened here. Please specify a different directory." Then go back to step 1

   - **FILE_EXISTS**: Read existing file, show current configuration, then use AskUserQuestion:
     ```javascript
     AskUserQuestion({
       questions: [{
         question: "A .mcp.json file already exists. What would you like to do?",
         header: "File Exists",
         multiSelect: false,
         options: [
           {label: "Update configuration", description: "Update paths and credentials to match current setup"},
           {label: "Keep existing", description: "Leave .mcp.json unchanged and skip installation"},
           {label: "Show me first", description: "Display the existing configuration before deciding"}
         ]
       }]
     })
     ```
     - **Update configuration**: Edit existing file to update args path and credentials
     - **Keep existing**: Skip to completion message (file unchanged)
     - **Show me first**: Display file contents, then ask again

   - **CREATE_NEW**: Create new `.mcp.json` with configuration below

4. **Generate `.mcp.json` content** (for CREATE_NEW or Update configuration):

   Use the MCP_SERVER_PATH from Step 1 (already converted to Windows format if needed).

   Content template (adjust based on Step 2 credentials):
   ```json
   {
     "mcpServers": {
       "tdx-api-tickets-mcp": {
         "type": "stdio",
         "command": "node",
         "args": ["<MCP_SERVER_PATH>/dist/index.js"],
         "env": {
           "TDX_PROD_CREDENTIALS_FILE": "~/.config/tdx-mcp/prod-credentials.json",
           "TDX_DEFAULT_ENVIRONMENT": "prod"
         }
       }
     }
   }
   ```

   **Note**: Only include env vars for configured environments (check `~/.config/tdx-mcp/` for which credential files exist). If user later adds environments via `npm run setup-advanced`, they can rerun this setup to update the .mcp.json.

### Step 4: Completion

Report to user:
```
🎉 Setup complete!

Files created:
  • Credentials: ~/.config/tdx-mcp/{environment}-credentials.json (if configured)
  • MCP config: {PROJECT_PATH}/.mcp.json

The MCP server is now available in the target project.

Next steps:

1. Open a terminal to your project directory:

   cd {PROJECT_PATH}

2. Open Claude Code (or restart if already open)

3. Test the MCP server:
   - "Show me all TDX reports"
   - "Show me all tickets assigned to me"

To setup other environments (dev/canary/test), rerun: npm run setup-advanced
To install the MCP server to another directory, rerun: npm run setup
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

5. **Ask what to update** (if user wants to modify) using AskUserQuestion tool:
   ```javascript
   AskUserQuestion({
     questions: [{
       question: "What would you like to do?",
       header: "Update Action",
       multiSelect: false,
       options: [
         {
           label: "Change credentials",
           description: "Update username/password for existing environment"
         },
         {
           label: "Modify applications",
           description: "Change which TeamDynamix applications are configured"
         },
         {
           label: "Add environment",
           description: "Add new environment (test/canary/dev)"
         },
         {
           label: "Copy to project",
           description: "Install .mcp.json to another project"
         }
       ]
     }]
   })
   ```

6. **Apply updates** based on selection:
   - **"Change credentials"** or **"Modify applications"** or **"Add environment"**: Update credential files
   - **"Copy to project"**: Help copy `.mcp.json` to another project (update 'args' path to absolute)

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
- Passwords are tied to your Windows user account - other users on this computer cannot decrypt them

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
