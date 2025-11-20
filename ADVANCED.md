# Advanced Guide

Multi-environment setup, configuration, troubleshooting, and uninstallation.

---

## Multi-Environment Setup

Default setup configures **production** only. To add test/dev/canary:

**Ask Claude:** *"Add development environment to TeamDynamix MCP"*

**Or manually:**
```bash
npm run setup-advanced
```

**Credential files** (`~/.config/tdx-mcp/`):
- `prod-credentials.json` - Production
- `dev-credentials.json` - Development
- `test-credentials.json` - Test
- `canary-credentials.json` - Canary

**Using different environments:**
Ask Claude: *"Get ticket #12345 from the dev environment"*

---

## Using in Multiple Projects

**Credentials are shared** - stored in `~/.config/tdx-mcp/`, used by all projects.

**`.mcp.json` is portable** - copy to other projects, update `args` path to absolute.

**Quick install:**
Ask Claude: *"Install TeamDynamix MCP to another project"*

**Manual install:**
```bash
cp .mcp.json /path/to/another-project/
# Edit .mcp.json, update args to absolute path:
# "args": ["C:/source/MCP/tdx-tickets-mcp/dist/index.js"]
```

---

## Updating Configuration

**Ask Claude:** *"Update my TeamDynamix MCP configuration"*

**Or manually:**
```bash
npm run setup  # Updates credentials
```

**To change app IDs:**
Edit `~/.config/tdx-mcp/prod-credentials.json` and update `TICKET_APP_IDS`.

---

## Troubleshooting

### Claude Doesn't See MCP Server
- Verify `.mcp.json` exists in project root
- Check credentials: `~/.config/tdx-mcp/prod-credentials.json`
- Restart Claude Code completely (quit and reopen)
- Launch from the directory containing `.mcp.json`

### Authentication Fails
- Verify username/password are correct
- Check account has API access in TeamDynamix
- Ask Claude: *"Update my TeamDynamix credentials"*

### No Ticketing Apps Found
- Check `TICKET_APP_IDS` in credentials file
- Verify account has access to ticketing apps
- Contact TeamDynamix administrator

### Tools Return Errors
- **"Environment not configured"**: Run `npm run setup-advanced`
- **"Credentials file not found"**: Run setup for that environment
- **"Invalid password format"**: Password must start with `dpapi:` - run setup

---

## Manual Configuration

**.mcp.json template:**
```json
{
  "mcpServers": {
    "tdx-tickets-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/source/MCP/tdx-tickets-mcp/dist/index.js"],
      "env": {
        "TDX_PROD_CREDENTIALS_FILE": "~/.config/tdx-mcp/prod-credentials.json",
        "TDX_DEFAULT_ENVIRONMENT": "prod"
      }
    }
  }
}
```

**Key fields:**
- `args`: Absolute path to `dist/index.js`
- `TDX_DEFAULT_ENVIRONMENT`: `"prod"`, `"dev"`, `"test"`, or `"canary"`

**Locations:**
- Project-local: `.mcp.json` in project root (recommended)
- Global: `~/.claude.json`

---

## Testing

```bash
npm run test:prod    # Test production
npm run test:api     # Test development
npm run test:test    # Test test environment
npm run test:canary  # Test canary
```

---

## Uninstalling

### Quick Removal (Disable Only)

**Project-local configuration:**
1. Remove the `tdx-tickets-mcp` entry from `.mcp.json`
2. Restart Claude Code

**Global configuration:**
1. Edit `~/.claude.json` and remove the `tdx-tickets-mcp` entry
2. Restart Claude Code

---

### Complete Removal

**1. Remove from Claude Code:**
```bash
# Project-local
rm .mcp.json

# Global - manually edit ~/.claude.json to remove the entry
```

**2. Delete credentials:**
```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force "$env:USERPROFILE\.config\tdx-mcp"

# macOS/Linux
rm -rf ~/.config/tdx-mcp
```

**3. Delete project directory:**
```bash
cd ..
rm -rf tdx-tickets-mcp
```

**4. Restart Claude Code** (completely quit and reopen)

---

### Partial Removal

**Remove only specific environment:**
```bash
rm ~/.config/tdx-mcp/prod-credentials.json  # Remove production only
rm ~/.config/tdx-mcp/dev-credentials.json   # Remove development only
```

**Disable for specific project only (when configured globally):**

Create `.mcp.json` in project:
```json
{
  "mcpServers": {}
}
```

---

## See Also

- [README.md](./README.md) - Quick start
- [TOOLS.md](./TOOLS.md) - Tool reference (for Claude)
- [CLAUDE.md](./CLAUDE.md) - Architecture and behaviors (for Claude)
