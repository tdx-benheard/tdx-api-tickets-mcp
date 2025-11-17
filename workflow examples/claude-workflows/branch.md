# Branch Naming Convention

## Pattern
```
feature/{USERNAME}/{TICKET_ID}_{BriefDescription}
```
- Always `feature/` prefix (even for bugs)
- Developer username from `CLAUDE.local.md`
- Ticket ID from TeamDynamix
- PascalCase description

## Example
```
feature/{USERNAME}/29221965_FixFilterDropAccessibility
```

## Create Branch
**IMPORTANT:** Update develop first
```bash
git checkout develop
git pull
git checkout -b feature/{USERNAME}/{TICKET_ID}_{Description}
```
