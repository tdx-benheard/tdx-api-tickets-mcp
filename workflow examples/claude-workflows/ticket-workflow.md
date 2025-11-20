# Ticket Workflow

## Prerequisites
- **MCP Server**: `tdx-tickets-mcp` (https://github.com/tdx-benheard/tdx-tickets-mcp)
- **User Config**: See `CLAUDE.local.md` for username and report IDs
- **Status IDs**: See MCP TOOLS.md or: 2=Open, 3=In Process, 191349=Pending Client Review, 568=Ready for Test, 5=Closed
- **MCP Functions**: `tdx_run_report`, `tdx_get_ticket`, `tdx_update_ticket`, `tdx_add_ticket_feed`, `tdx_add_ticket_tags`
- **Commit Standards**: See `commit.md` for format and workflow

## Phase 1: Ticket Selection

**When user provides specific ticket ID:**
- Skip to Phase 2 with that ticket

**When user says "get me a ticket" or similar:**
- Check `CLAUDE.local.md` for report priorities
- Follow the configured report checking order

**When user provides specific report name or ID:**
- Run that report
- Apply any filtering logic from `CLAUDE.local.md`

## Phase 2: Ticket Processing

### Step 1: Present Summary
- Get ticket via `tdx_get_ticket`
- Show: ID, title, priority, classification, issue description, application/component
- **Ask if user wants to proceed investigating**
- If NO → stop

### Step 2: Light Investigation
- Surface-level analysis: read description, search relevant code (Grep/Glob), identify problem areas
- **Determine confidence**: HIGH (clear fix), MEDIUM (needs deeper work), LOW (requires special tools/missing context)
- Present: issue, root cause hypothesis, confidence + reasoning, files to modify
- **Ask if user wants you to implement fix**
- If NO → stop (optionally add comment explaining why)

### Step 3: Claim Ticket & Set In Process
- **Ask user via AskUserQuestion**: "I will claim this ticket (assign to you, add 'Clauded' tag) and set status to In Process. Ok to proceed?"
- If YES:
  - Assign and update status via `tdx_update_ticket` (responsibleUid, statusId: 3)
  - Add tag via `tdx_add_ticket_tags` (tags: ["Clauded"])
- If NO: Stop workflow

### Step 4: Deep Investigation (if confidence MEDIUM/LOW)
- **Use Task tool with subagent_type=Explore** for codebase exploration
- Refine understanding, update confidence
- Present refined analysis

### Step 5: Create Branch
- Format: `feature/{USERNAME}/[TicketId]_[Summary]` (PascalCase, no spaces)
- **Ask if worktree should be created** via `AskUserQuestion`
- **If YES**: See `worktrees.md` for ticket worktree creation
- **If NO**: `git fetch origin develop && git checkout -b [BranchName] origin/develop`

### Step 6: Implement & Verify
- Write fix following existing patterns
- **Only edit source files** (SCSS not compiled CSS, etc.)
- Present changes to user
- **Get user confirmation** before committing
- If declined → adjust or abort

### Step 6.5: Build (if NOT in worktree)
- **If NOT in worktree**: Build to verify changes compile
- **If in worktree**: Skip build (user will build in main directory later)
- **ALWAYS reference `build.md` for correct build commands**
- Use minimal build strategy (only affected project, not full solution)
- Present build results to user

### Step 7: Commit
- **If worktree**: Ensure in worktree directory
- Stage source files only (no compiled assets, no .gitignore unless required, no AI docs)
- Follow commit format from `commit.md`
```bash
git add [files]
git commit -m "$(cat <<'EOF'
[Brief title]

[Detailed description]

[ItemType] #[TicketId]
EOF
)"
```
- ItemType from ticket's `ClassificationName` (Problem, Change, Incident)
- **If worktree**: Return to main enterprise directory, cleanup `git worktree remove .claude/worktrees/ticket-[TicketId]`

### Step 8: Document
- Get commit hash: `git log feature/{USERNAME}/[TicketId]_[Summary] -1 --format='%H'`
- Create lean documentation:
```markdown
# [Title]
**ID:** [TicketId] | **Branch:** [BranchName] | **Commit:** [ShortHash]

## Fix Summary
[2-3 sentences: root cause + changes]

## Files Modified
- `path/file` - [change description]

## Testing Notes
- [key test area]
```
- **Show to user first**
- **Ask via AskUserQuestion**: Create file (`.claude/tickets/[TicketId]_[Summary].md`) OR post to ticket (private feed via `tdx_add_ticket_feed` with `isPrivate: true`)

## Key Patterns
- **Always use Explore agent** (Task tool) for code investigation
- **Worktree isolation** keeps workspace clean
- **User approval** before creating branch (verify branch name)
- **User approval** before committing
- **Parallel tool calls** when independent
- **Don't edit compiled files** (CSS, JS bundles)
