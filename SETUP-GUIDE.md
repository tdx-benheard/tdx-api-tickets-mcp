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

### Step 0: Install Dependencies and Build Project

Claude will automatically:
- Run `npm install` to install dependencies
- Run `npm run build` to compile TypeScript
- Verify the build succeeded

### Step 1: Run Interactive Setup Tool

Claude will tell you to run the setup command in a separate terminal, providing the correct path for your system.

**Security Notes**:
- Your password is entered in your terminal, not in chat
- Password is masked during entry (appears as ***)
- DPAPI encryption ties password to your Windows user account
- Only you can decrypt the password on your machine
- Encrypted passwords are stored in `~/.config/tdx-mcp/` (outside version control)

### Step 2: Paste Configuration to Claude

After the tool completes:

1. **Copy the output** (if not already in clipboard)
2. **Paste it to Claude Code** (the entire `TDXCREDS:START...END` block)
3. Claude will parse and validate the configuration

### Step 3: Create Configuration Files

Claude automatically creates:

**Credentials file** at `~/.config/tdx-mcp/{environment}-credentials.json`:
```json
{
  "TDX_BASE_URL": "https://solutions.teamdynamix.com/TDWebApi",
  "TDX_USERNAME": "john.doe@company.com",
  "TDX_PASSWORD": "dpapi:AQAAANCMnd8BFdERjHoAwE...",
  "TDX_TICKET_APP_IDS": "129,245"
}
```

### Step 4: Install to Target Project

Claude asks:
```
Which project should use this MCP server?
Enter project directory path
Example: 'C:\source\my-project'
```

**What happens:**
- Copies `.mcp.json` to your target project
- **Converts relative path to absolute path** (critical step!)
  - From: `"args": ["./dist/index.js"]`
  - To: `"args": ["C:/source/MCP/tdx-api-tickets-mcp/dist/index.js"]`

⚠️ **Why absolute paths?** The target project needs to know where to find the MCP server. Relative paths only work within the MCP server's own directory.

**Example `.mcp.json` created:**
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

### Step 5: Final Instructions

Claude tells you:
- Where files were created
- To restart Claude Code
- How to test the setup

## Testing Your Setup

After Claude completes setup and you restart Claude Code, test by asking:

> "List available TeamDynamix reports"

or

> "Get ticket 12345"

## Multiple Environments

You can run setup multiple times for different environments:

1. First time: "Set up TeamDynamix MCP for production"
2. Second time: "Set up TeamDynamix MCP for development"
3. Third time: "Set up TeamDynamix MCP for canary"

Each creates a separate credential file (`prod-credentials.json`, `dev-credentials.json`, `canary-credentials.json`).

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
