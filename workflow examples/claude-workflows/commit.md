# Commit Standards

## Workflow
1. **Pre-commit:** Ask user if they want code review (errors, inefficiencies, redundancies)
2. **Draft:** Create commit message following format below
3. **🚨 MUST GET USER APPROVAL 🚨** - Show message, ask "Does this look good?", wait for confirmation
4. **Execute:** Only after approval, run git commit

## Ticket Number Extraction
Ticket is in branch name: `feature/{USERNAME}/{TICKET_ID}_{Description}`
Extract with: `git branch --show-current`

## Required Format
```
Brief description of what was done

Optional: Additional details explaining why/how.

Type #Number
```
- Item type + number at **very end** (not first line)
- NO square brackets around type
- Item types: Problem, Feature, Enhancement, Task

## Example
```
Fix accessibility in filter dropdown

Update keyboard navigation and screen reader support.

Problem #29221965
```
