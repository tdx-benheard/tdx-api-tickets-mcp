# Git Worktrees

**IMPORTANT:** Always create worktrees in `.claude/worktrees/` (gitignored)

## Naming Conventions

- **Ticket work**: `.claude/worktrees/ticket-{TICKET_ID}`
- **Cherry-pick**: `.claude/worktrees/cherry-pick-{TICKET_ID}-{RELEASE_VERSION}`

## Ticket Worktree

Create worktree from develop branch for regular ticket work:

```bash
git fetch origin develop
git worktree add .claude/worktrees/ticket-{TICKET_ID} -b {BRANCH_NAME} origin/develop
cd .claude/worktrees/ticket-{TICKET_ID}/enterprise
```

**Example:**
```bash
git worktree add .claude/worktrees/ticket-28056844 -b feature/{USERNAME}/28056844_ReportSaveNavigatorScroll origin/develop
cd .claude/worktrees/ticket-28056844/enterprise
```

## Cherry-Pick Worktree

Create worktree from release branch for cherry-picking:

```bash
git fetch origin release/{RELEASE_VERSION}
git worktree add .claude/worktrees/cherry-pick-{TICKET_ID}-{RELEASE_VERSION} -b {BRANCH_NAME} origin/release/{RELEASE_VERSION}
cd .claude/worktrees/cherry-pick-{TICKET_ID}-{RELEASE_VERSION}/enterprise
```

**Example:**
```bash
git worktree add .claude/worktrees/cherry-pick-28056844-12.1 -b feature/{USERNAME}/28056844_Fix_12.1 origin/release/12.1
cd .claude/worktrees/cherry-pick-28056844-12.1/enterprise
```

## Navigation

Worktrees create a full repo checkout. Navigate to `enterprise/` subdirectory (standard working directory):

```bash
cd .claude/worktrees/ticket-{TICKET_ID}/enterprise
```

## Cleanup Commands

```bash
git worktree list                                                  # List all worktrees
git worktree remove .claude/worktrees/ticket-{TICKET_ID}           # Remove ticket worktree
git worktree remove .claude/worktrees/cherry-pick-{TICKET_ID}-{RELEASE_VERSION}  # Remove cherry-pick worktree
git worktree prune                                                 # Clean up deleted directories
git worktree remove --force .claude/worktrees/ticket-{TICKET_ID}   # Force remove
```

## Notes
- Each worktree is fully isolated
- Remove after PR merge
- Follow branch naming conventions from branches.md
