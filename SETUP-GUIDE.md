# TeamDynamix MCP Server - Claude-Driven Setup

This guide shows you how to set up the TeamDynamix MCP server by simply asking Claude to configure it for you. No manual npm commands needed - Claude handles everything!

## Prerequisites

- Node.js 18+ installed
- TeamDynamix account with API access
- Claude Code
- Windows (for DPAPI password encryption)

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tdx-benheard/tdx-api-tickets-mcp.git
   cd tdx-api-tickets-mcp
   ```

2. **Ask Claude to set it up:**

   In Claude Code, simply ask:
   > "Set up the TeamDynamix MCP server for me"

   Claude will handle everything: dependencies, build, configuration, and credentials.

## What Claude Does During Setup

### Step 0: Verify Directory

Claude checks that you're in the correct directory (the MCP server folder).

### Step 1: Run Interactive Setup Tool

Claude will tell you to run the setup command in a separate terminal, providing the correct path for your system.

**Simple Setup (Production Only):**
```bash
npm run setup
```
- Automatically installs dependencies and builds the project
- Asks only: username and password
- Configures production environment automatically
- Auto-selects application if only one is found
- Saves credentials directly to `~/.config/tdx-mcp/prod-credentials.json`

**Advanced Setup (All Environments):**
```bash
npm run setup-advanced
```
- Full configuration: environment, domain, username, password, apps
- Use for test/dev/canary environments

**Security Notes**:
- Your password is entered in your terminal, not in chat
- Password is masked during entry (appears as ***)
- DPAPI encryption ties password to your Windows user account
- Only you can decrypt the password on your machine
- Encrypted passwords are stored in `~/.config/tdx-mcp/` (outside version control)

### Step 2: Return to Claude

After the tool completes, simply return to Claude Code and say: **"complete"**

Claude will verify the credentials were created successfully.

### Step 3: Choose Installation Location

Claude asks where you want to use the MCP server:

```
Where do you open Claude Code?

[1] C:\source\TDDev\enterprise
[2] Don't setup MCP server (I'll use it from the MCP server folder)
[3] Enter custom path
```

**What happens:**
- **Option 1 or 3**: Copies `.mcp.json` to your target project with absolute path
- **Option 2**: No `.mcp.json` needed - you'll use Claude Code from the MCP server folder itself

⚠️ **Why absolute paths?** When installing to another project, the `.mcp.json` needs the full path to find the MCP server. Example:
  - From: `"args": ["./dist/index.js"]` (only works in MCP server folder)
  - To: `"args": ["C:/source/MCP/tdx-api-tickets-mcp/dist/index.js"]` (works anywhere)

**Example `.mcp.json` created (production only):**
```json
{
  "mcpServers": {
    "tdx-api-tickets-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/source/MCP/tdx-api-tickets-mcp/dist/index.js"],
      "env": {
        "TDX_PROD_CREDENTIALS_FILE": "~/.config/tdx-mcp/prod-credentials.json",
        "TDX_DEFAULT_ENVIRONMENT": "prod"
      }
    }
  }
}
```

**Note:** The `.mcp.json` only includes environment variables for configured environments. If you later run `npm run setup-advanced` for test/dev/canary, those will be added.

### Step 4: Final Instructions

Claude tells you:
- Where files were created
- To restart Claude Code
- How to test the setup

## Testing Your Setup

After Claude completes setup and you restart Claude Code, test by asking:

> "Show me all TDX reports"

or

> "Show me all tickets assigned to me"

## Multiple Environments

The default setup configures production only. To add other environments (test/dev/canary):

**Option 1: Ask Claude**
> "Set up TeamDynamix MCP for development environment"

**Option 2: Manual**
```bash
npm run setup-advanced
```

Each run creates a separate credential file:
- `prod-credentials.json` (created by default)
- `test-credentials.json`
- `canary-credentials.json`
- `dev-credentials.json`

## Updating Configuration

### Updating Existing Credentials

To update existing configuration, ask Claude:

> "Update my TeamDynamix MCP server configuration"

Claude will:
1. **Detect existing credentials** for all environments
2. **Show current configuration**:
   ```
   Current configuration found for 'prod':
     • URL: https://solutions.teamdynamix.com/TDWebApi
     • Username: john.doe@company.com
     • App IDs: 129, 245
   ```
3. **Ask what to update**:
   - [1] Change credentials (username/password)
   - [2] Modify application selection
   - [3] Change environment settings
   - [4] Add new environment (dev/canary)

### Common Update Scenarios

**Change password**:
> "Update my TeamDynamix password"

**Add new application**:
> "Add another TeamDynamix application to my configuration"

**Switch to different apps**:
> "Change which TeamDynamix applications I'm using"

**Add development environment**:
> "Set up TeamDynamix MCP for development environment"

**Reconfigure for different project**:
> "Configure TeamDynamix MCP for another project"

### What Gets Updated

When updating:
- ✅ Existing credentials are preserved (won't ask for everything again)
- ✅ Can selectively update username, password, or apps
- ✅ Can add new environments without affecting existing ones
- ✅ Changes take effect after Claude Code restart

## Troubleshooting

### "Authentication failed"
- Verify your username and password are correct
- Check that your account has API access in TeamDynamix
- Ensure the domain is correct for your environment

### "No ticketing apps found"
- Your account may not have access to ticketing apps
- Contact your TeamDynamix administrator
- Try manually entering app IDs if you know them

### Claude doesn't see the MCP server
- Verify credentials file exists at `~/.config/tdx-mcp/{env}-credentials.json`
- Check `.mcp.json` exists in your project root
- Restart Claude Code completely (quit and reopen)
- Check Claude Code's output panel for errors

### Password encryption fails
- Requires Windows DPAPI
- Must be running on Windows
- Ensure PowerShell is available


## What Gets Created

After setup completes, you'll have:

### **1. Credentials** (Shared Across All Projects)
- **Location**: `~/.config/tdx-mcp/{environment}-credentials.json`
- **Contains**: URL, username, encrypted password, app IDs
- **Shared**: These credentials can be used by multiple projects
- **Security**: All passwords are DPAPI-encrypted

### **2. MCP Server Configuration** (Portable)

**Option A: Project-Specific** (`.mcp.json` in project root)
- **Ready to copy**: This file can be copied to other projects
- **Portable**: Just update the `args` path to point to `dist/index.js` (absolute path)
- **Use in other projects**:
  ```bash
  cp .mcp.json /path/to/another-project/.mcp.json
  # Edit and update the path in args to absolute path
  ```

**Option B: Global** (`~/.claude.json`)
- **Available everywhere**: MCP server works in all Claude Code projects
- **Single configuration**: One place to manage the server

---

## Using in Multiple Projects

Your setup is **portable and reusable**:

1. **Credentials are global** - Stored in `~/.config/tdx-mcp/`, shared across all projects
2. **`.mcp.json` is portable** - Copy it to any project where you want the MCP server
3. **Easy to make global** - Move config to `~/.claude.json` to enable everywhere

**To add to another project:**
```bash
# Copy the .mcp.json to new project
cp .mcp.json /path/to/another-project/

# Edit the new .mcp.json and update args to absolute path:
# "args": ["C:/source/MCP/tdx-api-tickets-mcp/dist/index.js"]
```

**To make global (available in all projects):**
> Ask Claude: "Make my TeamDynamix MCP server globally available"

## Need Help?

Just ask Claude:
- "Help me set up TeamDynamix MCP server"
- "What's my current TeamDynamix MCP configuration?"
- "Update my TeamDynamix credentials"
- "Configure TeamDynamix MCP for a new project"

Claude can guide you through the entire process interactively - from cloning to configuration!
