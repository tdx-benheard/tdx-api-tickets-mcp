# TeamDynamix MCP Tools Reference

This document provides detailed information about all available MCP tools for Claude Code.

## Best Practices

**⚠️ IMPORTANT: Choose the Right Tool**

- **Use `tdx_search_reports` + `tdx_run_report`** for ALL searching/listing of tickets (ALWAYS use this first!)
- **Use `tdx_get_ticket`** when you have a specific ticket ID and need complete details

**Why?** Reports return only the columns configured, making them efficient for browsing. Once you have a ticket ID from a report, use `tdx_get_ticket` to get full details.

**The Right Approach:**
```javascript
// DO: Search for reports first, then run with filters
// Step 1: Find appropriate report
tdx_search_reports({ searchText: "open tickets" })

// Step 2: Run report with name filter
tdx_run_report({
  reportId: 279612,  // From step 1
  withData: true,
  filterResponsibleFullName: "Ben Heard",
  page: 1,
  pageSize: 50
})
```

**Report Selection Best Practices:**
- **Prefer "All Open Tickets"** - When searching for open tickets, prefer reports named "All Open Tickets" over team-specific reports (e.g., "Team Name - Open Tickets")
- **Handle ambiguity gracefully** - When multiple reports match:
  1. Use the general/global report (e.g., "All Open Tickets") and return results
  2. At the end of results, mention other matching reports that were found (include report names and IDs)
  3. Inform user they can query those other reports if interested, but don't anticipate or wait for action
- **Global reports first** - Prefer global reports over team/project-specific reports unless user specifies otherwise

## Environment Selection

All tools support an optional `environment` parameter:
- `"prod"` - Production environment (default)
- `"dev"` - Development environment
- `"canary"` - Canary environment

Example: `{ ticketId: 12345, environment: "dev" }`

---

## Ticket Management

### `tdx_search_tickets`
Search for tickets with lightweight results (only ID, Title, Status, Responsible, Modified Date, Priority). **Use this for finding tickets with tasks assigned to you.**

**Parameters:**
- `searchText` (string) - Text to search for
- `statusIDs` (number[]) - Filter by status IDs (e.g., [2] for Open, [3] for In Process)
- `priorityIDs` (number[]) - Filter by priority IDs
- `responsibilityUids` (string[]) - Filter by responsible user UIDs (includes task responsibility)
- `completedTaskResponsibilityFilter` (boolean) - When used with responsibilityUids: false = active tasks, true = completed tasks
- `maxResults` (number) - Default: 50, max: 1000
- `appId` (string, optional)
- `environment` (string, optional)

**Example: Find tickets with active tasks assigned to you:**
```javascript
// Step 1: Get your UID
tdx_get_current_user()

// Step 2: Search with task filter
tdx_search_tickets({
  responsibilityUids: ["your-uid-here"],
  completedTaskResponsibilityFilter: false
})
```

**Response:** Lightweight ticket objects (~93% smaller than full tickets)
```json
[
  {
    "ID": 29290570,
    "Title": "Error page in dark mode",
    "StatusName": "In Process",
    "ResponsibleFullName": "Ben Heard",
    "ModifiedDate": "2025-11-20T05:08:42.333Z",
    "PriorityName": "Low"
  }
]
```

---

### `tdx_get_ticket`
Get a single ticket by ID with full details. App ID is auto-detected. **Automatically filters out bloated attribute choice data (85% size reduction).**

**Parameters:**
- `ticketId` (number, required)
- `appId` (string, optional) - Override auto-detection
- `environment` (string, optional)

**Attribute Filtering:**
The tool automatically filters custom attributes to remove excessive choice metadata:
- **Before:** All possible choices with full metadata (DateCreated, DateModified, Order, IsActive, etc.)
- **After:** Only selected choices with ID and Name
- **Savings:** ~85% reduction in response size for tickets with many custom attributes

Example filtered attribute:
```json
{
  "ID": 12299,
  "Name": "Support Tier",
  "Value": "28033",
  "ValueText": "Tier 3",
  "SelectedChoices": [
    {
      "ID": 28033,
      "Name": "Tier 3"
    }
  ]
}
```

---

### `tdx_update_ticket`
Partial ticket update (only specify fields to change).

**Parameters:**
- `ticketId` (number, required)
- `statusId` (number)
- `priorityId` (number)
- `title` (string)
- `description` (string)
- `comments` (string)
- `responsibleUid` (string)
- `tags` (string[])
- `appId` (string, optional)
- `environment` (string, optional)

---

### `tdx_add_ticket_feed`
Add a comment/update to a ticket.

**Parameters:**
- `ticketId` (number, required)
- `comments` (string, required)
- `isPrivate` (boolean) - Default: false
- `notify` (string[]) - Email addresses to notify
- `appId` (string, optional)
- `environment` (string, optional)

---

### `tdx_get_ticket_feed`
Get comments/updates from a ticket.

**Parameters:**
- `ticketId` (number, required)
- `top` (number) - Max entries (default: 10, 0 = all)
- `appId` (string, optional)
- `environment` (string, optional)

---

### `tdx_add_ticket_tags` / `tdx_delete_ticket_tags`
Manage ticket tags.

**Note:** Tags are stored in DB but NOT returned by `tdx_get_ticket` due to API rollback.

**Parameters:**
- `ticketId` (number, required)
- `tags` (string[], required)
- `appId` (string, optional)
- `environment` (string, optional)

---

## Ticket Tasks Management

### `tdx_list_ticket_tasks`
Get all tasks on a ticket with lightweight results (ID, Title, Status, Responsible, Start/End dates, Percent Complete).

**Parameters:**
- `ticketId` (number, required)
- `appId` (string, optional)
- `environment` (string, optional)

**Response:** Lightweight task objects (~87% smaller than full tasks)
```json
[
  {
    "ID": 7693631,
    "Title": "Would we consider this a bug?",
    "StatusName": null,
    "ResponsibleFullName": "Ben Heard",
    "StartDate": "2025-10-22T20:30:00Z",
    "EndDate": "2025-10-23T13:30:00Z",
    "PercentComplete": 0
  }
]
```

---

### `tdx_get_ticket_task`
Get full details for a specific task on a ticket.

**Parameters:**
- `ticketId` (number, required)
- `taskId` (number, required)
- `appId` (string, optional)
- `environment` (string, optional)

---

### `tdx_update_ticket_task`
Update a task by adding a comment/feed entry.

**Parameters:**
- `ticketId` (number, required)
- `taskId` (number, required)
- `comments` (string, required) - The comment text to add
- `isPrivate` (boolean) - Default: false
- `notify` (string[]) - Array of email addresses to notify
- `appId` (string, optional)
- `environment` (string, optional)

**Example:**
```javascript
tdx_update_ticket_task({
  ticketId: 29228941,
  taskId: 7693631,
  comments: "Task completed - tested and verified",
  isPrivate: false,
  notify: ["manager@example.com"]
})
```

---

## Report Management

### `tdx_list_reports`
List all available reports.

**Parameters:**
- `maxResults` (number) - Default: 100
- `appId` (string, optional)
- `environment` (string, optional)

---

### `tdx_search_reports`
Search reports by name.

**Parameters:**
- `searchText` (string, required)
- `maxResults` (number) - Default: 50
- `appId` (string, optional)
- `environment` (string, optional)

---

### `tdx_run_report`
Run a report with client-side filtering and pagination. Returns pagination metadata.

**Important:** The API returns ALL rows in one call. Pagination/filtering happens client-side.

**Common Patterns:**
```javascript
// Get first page (recommended for large reports)
tdx_run_report({
  reportId: 273426,
  withData: true,
  page: 1,
  pageSize: 50
})
// Returns: { Pagination: { currentPage: 1, totalPages: 20, hasNextPage: true, ... }, DataRows: [...] }

// Filter by person name with pagination
tdx_run_report({
  reportId: 273426,
  withData: true,
  filterResponsibleFullName: "Ben Heard",
  filterStatusName: "Open",
  page: 1,
  pageSize: 50
})

// Iterate through pages (Claude can do this automatically)
// Page 1
tdx_run_report({ reportId: 273426, withData: true, page: 1 })
// Check response.Pagination.hasNextPage
// If true, get page 2
tdx_run_report({ reportId: 273426, withData: true, page: 2 })

// Alternative: Use offset/limit directly
tdx_run_report({
  reportId: 279612,
  withData: true,
  filterText: "dark mode",
  limit: 100,
  offset: 0
})
```

**All Parameters:**
- `reportId` (number, required)
- `withData` (boolean) - Include data rows (default: false)
- `dataSortExpression` (string) - Sort expression
- **Pagination (choose one approach):**
  - `page` (number) + `pageSize` (number, default: 50) - Recommended approach
  - `offset` (number, default: 0) + `limit` (number) - Alternative approach
- **Filtering:**
  - `filterResponsibleFullName` (string) - Filter by ResponsibleFullName column (partial match)
  - `filterStatusName` (string) - Filter by StatusName column (partial match)
  - `filterText` (string) - Search all text columns
- `appId` (string, optional)
- `environment` (string, optional)

**Response includes Pagination metadata:**
```javascript
{
  Pagination: {
    currentPage: 1,
    pageSize: 50,
    totalRows: 150,      // After filtering
    totalPages: 3,
    hasNextPage: true,
    hasPrevPage: false,
    returnedRows: 50
  },
  DataRows: [...],
  // ... other report fields
}
```

**Notes:**
- Filtering is case-insensitive partial matching
- All filtering/pagination happens client-side after fetching
- Reports are limited only by 90-second SQL timeout
- Reports cannot accept runtime parameters (pre-configured filters only)

---

## User Management

### `tdx_get_user`
Get user by UID or username.

**Parameters:**
- `uid` (string) - User UID (GUID)
- `username` (string) - Username
- `environment` (string, optional)

**Note:** Must provide either `uid` or `username`.

---

### `tdx_get_current_user`
Get currently authenticated user.

**Parameters:**
- `environment` (string, optional)

---

### `tdx_search_users`
Search for users.

**Parameters:**
- `searchText` (string) - Search name, email, username
- `maxResults` (number) - Default: 50, max: 100
- `environment` (string, optional)

---

### `tdx_get_user_uid`
Get user UID by username.

**Parameters:**
- `username` (string, required)
- `environment` (string, optional)

---

## Group Management

### `tdx_search_groups`
Search for groups.

**Parameters:**
- `searchText` (string) - Search group names
- `maxResults` (number) - Default: 50, max: 100
- `environment` (string, optional)

---

### `tdx_get_group`
Get group by ID.

**Parameters:**
- `groupId` (number, required)
- `environment` (string, optional)

---

### `tdx_list_groups`
List all groups.

**Parameters:**
- `maxResults` (number) - Default: 100
- `environment` (string, optional)

---

## Common Status and Priority IDs

**Status IDs:**
- 2 = Open
- 3 = In Process
- 5 = Closed
- 6 = Closed and Approved
- 711 = Cancelled
- 191349 = Pending Client Review (custom)
- 568 = Ready for Test (custom)

**Priority IDs:**
- 8 = Low
- 9 = Medium
- 10 = High
- 11 = Critical

---

## Workflow Tips for Claude

### Finding Someone's Tickets

**✅ Universal Workflow (Works on Any TDX Instance):**
```javascript
// Step 1: Find an appropriate report
tdx_search_reports({ searchText: "open tickets" })
// Look for reports like:
// - "All Open Tickets"
// - "Open Tickets"
// - "[Team Name] - Open Tickets"
// Present options to user if multiple found

// Step 2: Run the report with filtering
tdx_run_report({
  reportId: 273426,  // ID from step 1
  withData: true,
  filterResponsibleFullName: "Ben Heard",
  page: 1,
  pageSize: 50
})
// Returns: Clean list with pagination metadata

// Step 3 (Optional): Get full details for specific ticket
tdx_get_ticket({ ticketId: 28803790 })
```


### When to Use Each Tool

1. **Searching/listing/browsing tickets** → `tdx_search_reports` + `tdx_run_report` with filters (ALWAYS use this)
2. **Getting specific ticket details** → `tdx_get_ticket` by ID (after finding ID in report)
3. **Updating a ticket** → `tdx_update_ticket` or `tdx_edit_ticket`

**Decision Tree:**
- User asks to "find/search/list tickets" → Use `tdx_search_reports` + `tdx_run_report` with filters
- User asks "show me Ben's tickets" → Use reports with `filterResponsibleFullName`
- User asks "get ticket details for #12345" → Use `tdx_get_ticket`
- User has ticket ID from report and needs full details → Use `tdx_get_ticket`

### Common Report Search Terms

When using `tdx_search_reports` to find appropriate reports, try these search terms:
- `"open tickets"` - Find open ticket reports
- `"in progress"` - Find in-progress ticket reports
- `"all tickets"` - Find comprehensive ticket reports
- `"unassigned"` - Find unassigned ticket reports
- `"[team name]"` - Find team-specific reports

Then present the user with options if multiple reports are found.

### Pagination Workflows

**Automatic Iteration Example:**
```javascript
// Claude can automatically iterate through pages
let currentPage = 1;
let hasMore = true;

while (hasMore) {
  const response = tdx_run_report({
    reportId: 273426,
    withData: true,
    filterResponsibleFullName: "Ben Heard",
    page: currentPage,
    pageSize: 50
  });

  // Process response.DataRows...

  hasMore = response.Pagination.hasNextPage;
  currentPage++;
}
```

### Other Tips

- **Large reports:** Always start with `page: 1, pageSize: 50`
- **Check pagination:** Use `response.Pagination.hasNextPage` to determine if more data exists
- **Date formats:** Always use ISO 8601: `"2025-11-10T00:00:00Z"`
- **Tags limitation:** Tags don't show in GET responses - inform user to check TDX UI
- **Token limits:** Responses auto-truncate with helpful messages if needed
