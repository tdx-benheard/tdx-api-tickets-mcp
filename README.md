# TeamDynamix Tickets API MCP Server

**Give Claude direct access to your TeamDynamix instance.**

Ask Claude to find tickets, update statuses, add comments, run reports, and search users—all through natural conversation.

---

## What Can Claude Do?

Once installed, ask Claude things like:

- *"Show me all open tickets assigned to John Doe"*
- *"Add a comment to ticket #12345"*
- *"Run the 'In Progress' report and show me the top 5 oldest tickets"*
- *"Find tickets with 'password reset' in the title"*
- *"Who is responsible for ticket #9876?"*

**Features:**
- 🎫 Search and manage tickets (get, update, comment)
- 👥 Look up users and groups
- 📊 Run reports with filtering/sorting/pagination
- ✅ View and update ticket tasks
- 🔄 Multi-environment support (prod/dev/test/canary)

---

## Prerequisites

- **Node.js 18+** and npm
- **TeamDynamix account** with API access
- **Claude Code**
- **Windows** (DPAPI password encryption required)

---

## Setup

### 1. Install Dependencies

```bash
cd tdx-tickets-mcp
npm install
```

### 2. Run Setup

**Ask Claude:**
> "Set up the TeamDynamix MCP server for me"

Claude will walk you through:
1. Running the setup tool (`npm run setup`)
2. Entering credentials (encrypted with DPAPI)
3. Installing to your project directory

### 3. Restart Claude Code

Launch Claude Code from your **project directory** (where `.mcp.json` was created) and test:
> "Show me all TDX reports"

---

## How It Works

**Credentials:**
- Stored in `~/.config/tdx-mcp/prod-credentials.json` (shared across projects)
- Encrypted with **Windows DPAPI** (user-scoped, secure)
- Outside version control

**Configuration:**
- `.mcp.json` in your project root points to the server
- Portable—copy to other projects and update paths
- Ask Claude to install to multiple projects

---

## Next Steps

- **Advanced guide:** See [ADVANCED.md](./ADVANCED.md) for multi-environment setup, troubleshooting, and uninstallation
- **Tool reference:** See [TOOLS.md](./TOOLS.md) for all available tools (Claude reads this)
- **Architecture:** See [CLAUDE.md](./CLAUDE.md) for setup workflows and key behaviors (Claude reads this)

---

## Security

✅ **DPAPI-encrypted passwords** (Windows user-scoped)
✅ **Credentials outside repo** (`~/.config/tdx-mcp/`)
✅ **Masked input** (password never visible)
✅ **JWT tokens** cached securely (auto-refresh)

---

## Support

**Ask Claude:**
- *"Update my TeamDynamix credentials"*
- *"Add development environment to TeamDynamix MCP"*
- *"Install TeamDynamix MCP to another project"*
- *"Help troubleshoot my TeamDynamix MCP server"*

**Issues:** [GitHub Issues](https://github.com/tdx-benheard/tdx-tickets-mcp/issues)

---

## License

MIT
