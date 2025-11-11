# Uninstalling TeamDynamix Tickets API MCP Server

This guide covers how to remove the TeamDynamix Tickets API MCP server from your system.

## Quick Removal (Disable Only)

To temporarily disable the MCP server without deleting files:

### If Configured Per-Project

1. **Open the project's `.mcp.json` file**
2. **Remove the `tdx-api-tickets-mcp` entry** from the `mcpServers` object
3. **Restart Claude Code**

```json
{
  "mcpServers": {
    "tdx-api-tickets-mcp": { ... }  ← Remove this entire entry
  }
}
```

### If Configured Globally

1. **Open `~/.claude.json`** (Windows: `C:\Users\YourUsername\.claude.json`)
2. **Remove the `tdx-api-tickets-mcp` entry** from the `mcpServers` object
3. **Restart Claude Code**

---

## Complete Removal (Delete Everything)

To completely remove the MCP server and all associated files:

### Step 1: Remove from Claude Code Configuration

**Per-project configuration:**
```bash
# Delete or edit .mcp.json in the project root
rm .mcp.json  # Or edit to remove just the tdx-api-tickets-mcp entry

# Delete Claude settings
rm -rf .claude/settings.local.json
```

**Global configuration:**
```bash
# Edit ~/.claude.json to remove tdx-api-tickets-mcp entry
# (Manual edit required - remove the mcpServers entry)
```

### Step 2: Delete Credentials

**Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.config\tdx-mcp"
```

**Windows (Command Prompt):**
```cmd
rmdir /s /q "%USERPROFILE%\.config\tdx-mcp"
```

**macOS/Linux:**
```bash
rm -rf ~/.config/tdx-mcp
```

### Step 3: Delete Project Directory

**All platforms:**
```bash
cd ..  # Navigate out of the project directory first
rm -rf tdx-api-tickets-mcp  # Or use your file manager
```

**Windows (PowerShell):**
```powershell
cd ..
Remove-Item -Recurse -Force tdx-api-tickets-mcp
```

### Step 4: Restart Claude Code

After removing configuration files, completely restart Claude Code (quit and reopen, not just reload window).

---

## Verification

After uninstalling, verify the MCP server is removed:

1. **Open Claude Code**
2. **Check the MCP servers list** (should not show tdx-api-tickets-mcp)
3. **Try asking Claude to use a TeamDynamix tool** - it should say the tool is not available

---

## Troubleshooting

### MCP Server Still Appears After Removal

- **Check both locations**: Per-project (`.mcp.json`) and global (`~/.claude.json`)
- **Completely quit Claude Code** (not just reload) and reopen
- **Check for typos** in the server name when searching config files

### Credentials Still Present

Credentials are stored separately from the MCP server configuration:
- **Location**: `~/.config/tdx-mcp/` (Windows: `C:\Users\YourUsername\.config\tdx-mcp\`)
- **Files**: `prod-credentials.json`, `dev-credentials.json`, `canary-credentials.json`
- **To delete**: Use the commands in Step 2 above

### Want to Reinstall Later

If you might want to use the MCP server again:
1. **Keep the credentials** - Just remove the MCP server configuration
2. **Keep the project directory** - Just remove from Claude Code config
3. **To reinstall**: Run `npm run setup` again and it will reuse existing credentials

---

## Partial Removal Options

### Remove Only Specific Environment

To remove only prod, dev, or canary credentials:

```bash
# Remove only production credentials
rm ~/.config/tdx-mcp/prod-credentials.json

# Remove only development credentials
rm ~/.config/tdx-mcp/dev-credentials.json

# Remove only canary credentials
rm ~/.config/tdx-mcp/canary-credentials.json
```

### Remove from Specific Project Only

If configured globally but you want to disable for one project:

1. **Create `.mcp.json` in that project** with an empty `mcpServers` object:
   ```json
   {
     "mcpServers": {}
   }
   ```

2. **Create `.claude/settings.local.json`**:
   ```json
   {
     "enableAllProjectMcpServers": false
   }
   ```

This disables project-level MCP servers for that specific project while keeping global configuration intact.

---

## Need Help?

If you encounter issues during uninstallation:
- Check [GitHub Issues](https://github.com/tdx-benheard/tdx-api-tickets-mcp/issues)
- Review the [README](./README.md) for configuration details
- Verify file paths match your operating system
