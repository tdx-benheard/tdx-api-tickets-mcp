# TeamDynamix API MCP Server

An MCP (Model Context Protocol) server for interacting with the TeamDynamix Web API. This server provides tools for managing tickets, time entries, people, groups, and running reports through the TeamDynamix platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Configure credentials:

   **Option A: Credential Files (Recommended)**
   - Create `~/.config/tdx/prod-credentials.json` with your credentials
   - See CLAUDE.md for full configuration details

   **Option B: .env File (Legacy)**
   - Copy `.env.example` to `.env`
   - Edit `.env` and fill in your TeamDynamix credentials

4. Configure in Claude Desktop/Code:
**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "tdx-api-mcp": {
      "command": "node",
      "args": ["c:/source/mcp/tdx-api-mcp/dist/index.js"],
      "cwd": "c:/source/mcp/tdx-api-mcp",
      "env": {
        "TDX_CREDENTIALS_FILE": "C:\\Users\\[username]\\.config\\tdx\\prod-credentials.json"
      }
    }
  }
}
```

**Claude Code** (`~/.claude.json`):
```json
{
  "mcpServers": {
    "tdx-api-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/source/mcp/tdx-api-mcp/dist/index.js"],
      "env": {
        "TDX_CREDENTIALS_FILE": "C:\\Users\\[username]\\.config\\tdx\\prod-credentials.json"
      }
    }
  }
}
```

See [CLAUDE.md](./CLAUDE.md) for detailed configuration including multiple environments.

## Security

Credentials are stored outside the project directory:
- **Recommended**: Use credential JSON files in `~/.config/tdx/`
- **Legacy**: `.env` file in project root (backward compatible)
- Credential files are gitignored and never committed to version control
- Supports multiple environments with separate credentials (prod, dev, etc.)

### Important Security Notes:
- Never commit credential files to git
- Set restrictive file permissions (read-only for your user)
- Consider using file system encryption (Windows EFS, etc.)
- Use separate credentials per environment
- Rotate passwords regularly

## Available Tools

### Ticket Management

#### `tdx_search_tickets`
Search for TeamDynamix tickets using various criteria.

**Parameters:**
- `searchText` (string, optional): Text to search for in tickets
- `maxResults` (number, optional): Maximum number of results to return (default: 50)
- `statusIds` (array of numbers, optional): Array of status IDs to filter by
- `priorityIds` (array of numbers, optional): Array of priority IDs to filter by
- `appId` (string, optional): TeamDynamix application ID to search in

---

#### `tdx_get_ticket`
Get a TeamDynamix ticket by ID.

**Parameters:**
- `ticketId` (number, required): ID of the ticket to retrieve
- `appId` (string, optional): TeamDynamix application ID (auto-detected if not provided)

---

#### `tdx_edit_ticket`
Edit a TeamDynamix ticket (full update - requires all fields).

**Parameters:**
- `ticketId` (number, required): ID of the ticket to edit
- `ticketData` (object, required): Complete ticket data for update
- `appId` (string, optional): TeamDynamix application ID (auto-detected if not provided)

**Important**: The ticketData object must include at least one of:
- `RequestorEmail` (string)
- `RequestorUid` (string)
- `AccountID` (number)

**Common Ticket Object Fields:**
```javascript
{
  // Required (at least one)
  RequestorEmail: "user@example.com",
  RequestorUid: "user-uid",
  AccountID: 123,

  // Common fields
  Title: "Ticket title",
  Description: "Ticket description",
  StatusID: 456,
  PriorityID: 789,
  TypeID: 101,
  TypeCategoryID: 102,

  // Assignment
  ResponsibleGroupID: 201,
  ResponsibleUid: "responsible-uid",

  // Dates
  StartDate: "2024-01-01T00:00:00Z",
  EndDate: "2024-01-15T00:00:00Z",

  // Other common fields
  ImpactID: 301,
  UrgencyID: 302,
  SourceID: 303,
  ServiceID: 401,
  ServiceOfferingID: 402,
  EstimatedMinutes: 120,

  // Location
  LocationID: 501,
  LocationRoomID: 502,

  // Custom attributes (if applicable)
  Attributes: [
    {
      ID: 1001,
      Value: "Custom value"
    }
  ]
}
```

**Note**: Some fields become non-editable if the ticket has been converted to a task (StartDate, EndDate, EstimatedMinutes, ResponsibleGroupID, ResponsibleUid, StatusID if task not completed).

---

#### `tdx_update_ticket`
Update a TeamDynamix ticket (partial update).

**Parameters:**
- `ticketId` (number, required): ID of the ticket to update
- `statusId` (number, optional): New status ID for the ticket
- `priorityId` (number, optional): New priority ID for the ticket
- `title` (string, optional): New title for the ticket
- `description` (string, optional): New description for the ticket
- `comments` (string, optional): Comments to add to the ticket update
- `appId` (string, optional): TeamDynamix application ID (auto-detected if not provided)

---

#### `tdx_add_ticket_feed`
Add a feed entry (comment/update) to a TeamDynamix ticket.

**Parameters:**
- `ticketId` (number, required): ID of the ticket to add feed entry to
- `comments` (string, required): The comment text to add
- `isPrivate` (boolean, optional): Whether the feed entry should be private (default: false)
- `notify` (array of strings, optional): Array of email addresses to notify
- `appId` (string, optional): TeamDynamix application ID (auto-detected if not provided)

---

#### `tdx_add_ticket_tags`
Add tags to a TeamDynamix ticket.

**Parameters:**
- `ticketId` (number, required): ID of the ticket to add tags to
- `tags` (array of strings, required): Array of tag names to add
- `appId` (string, optional): TeamDynamix application ID (auto-detected if not provided)

**Important Notes:**
- Tags are successfully stored in the database and visible in the TeamDynamix UI
- Due to an API rollback, tags are **NOT returned** in `tdx_get_ticket` responses
- To verify tags were added, check the ticket in the TeamDynamix web interface
- Returns success message when tags are added (empty response body = success)

---

#### `tdx_delete_ticket_tags`
Delete tags from a TeamDynamix ticket.

**Parameters:**
- `ticketId` (number, required): ID of the ticket to delete tags from
- `tags` (array of strings, required): Array of tag names to delete
- `appId` (string, optional): TeamDynamix application ID (auto-detected if not provided)

**Note:** Returns success message when tags are deleted.

---

### People Management

#### `tdx_get_user`
Get a TeamDynamix user by UID or username.

**Parameters:**
- `uid` (string, optional): User UID (GUID) to retrieve
- `username` (string, optional): Username to retrieve (alternative to uid)

**Note:** Either `uid` or `username` must be provided.

---

#### `tdx_get_current_user`
Get the currently authenticated TeamDynamix user (based on credentials).

**Parameters:** None

---

#### `tdx_search_users`
Search for TeamDynamix users.

**Parameters:**
- `searchText` (string, optional): Text to search for in user records (name, email, username)
- `maxResults` (number, optional): Maximum number of results to return (default: 50, max: 100)

---

#### `tdx_get_user_uid`
Get a user UID (GUID) by username.

**Parameters:**
- `username` (string, required): Username to look up

---

### Group Management

#### `tdx_search_groups`
Search for TeamDynamix groups.

**Parameters:**
- `searchText` (string, optional): Text to search for in group names
- `maxResults` (number, optional): Maximum number of results to return (default: 50, max: 100)

---

#### `tdx_get_group`
Get a TeamDynamix group by ID.

**Parameters:**
- `groupId` (number, required): Group ID to retrieve

---

#### `tdx_list_groups`
List all available TeamDynamix groups.

**Parameters:**
- `maxResults` (number, optional): Maximum number of results to return (default: 100)

---

### Time & Expense Management

#### `tdx_search_time_entries`
Search for TeamDynamix time entries using various criteria.

**Parameters:**
- `startDate` (string, optional): Start date for time entries (ISO 8601 format: YYYY-MM-DD)
- `endDate` (string, optional): End date for time entries (ISO 8601 format: YYYY-MM-DD)
- `userUid` (string, optional): UID of user to search time entries for
- `ticketId` (number, optional): Ticket ID to filter time entries by
- `projectId` (number, optional): Project ID to filter time entries by
- `maxResults` (number, optional): Maximum number of results to return (default: 50)

---

#### `tdx_get_time_entry`
Get a TeamDynamix time entry by ID.

**Parameters:**
- `timeEntryId` (number, required): ID of the time entry to retrieve

---

#### `tdx_create_time_entry`
Create a new TeamDynamix time entry.

**Parameters:**
- `timeEntryData` (object, required): Time entry data including hours, date, description, etc.

**Common Time Entry Fields:**
```javascript
{
  DateWorked: "2025-10-15",      // Required: Date in ISO format
  Minutes: 120,                   // Required: Duration in minutes
  TimeTypeID: 3406,              // Required: Time type ID
  Description: "Work description",

  // Component association (at least one required)
  TicketID: 555058,              // Associate with ticket
  ProjectID: 12345,              // Associate with project

  // Optional fields
  BillTo: "Client name",
  BillRate: 100.00,
  IsBillable: true,
  IsActive: true
}
```

---

#### `tdx_update_time_entry`
Update an existing TeamDynamix time entry.

**Parameters:**
- `timeEntryId` (number, required): ID of the time entry to update
- `timeEntryData` (object, required): Updated time entry data

---

#### `tdx_delete_time_entry`
Delete a TeamDynamix time entry.

**Parameters:**
- `timeEntryId` (number, required): ID of the time entry to delete

**Note:** Time entries can only be deleted by the user who created them or an Admin Service Account.

---

#### `tdx_get_time_report`
Get weekly time report (timesheet) for a user.

**Parameters:**
- `reportDate` (string, required): Any date within the week to get report for (ISO 8601 format: YYYY-MM-DD)
- `userUid` (string, optional): UID of user to get report for (defaults to current user)

**Note:** The report returns timesheet data for the entire week containing the specified date.

---

#### `tdx_list_time_types`
List all active time types.

**Parameters:** None

---

#### `tdx_get_time_type`
Get a specific time type by ID.

**Parameters:**
- `timeTypeId` (number, required): ID of the time type to retrieve

---

### Report Management

#### `tdx_list_reports`
List all available TeamDynamix reports.

**Parameters:**
- `maxResults` (number, optional): Maximum number of results to return (default: 100)
- `appId` (string, optional): Filter reports by TeamDynamix application ID

---

#### `tdx_search_reports`
Search for TeamDynamix reports by name.

**Parameters:**
- `searchText` (string, required): Text to search for in report names
- `maxResults` (number, optional): Maximum number of results to return (default: 50)
- `appId` (string, optional): Filter reports by TeamDynamix application ID

---

#### `tdx_run_report`
Run a TeamDynamix report by ID and get the results.

**Parameters:**
- `reportId` (number, required): ID of the report to run
- `withData` (boolean, optional): Include report data in response (default: false)
- `dataSortExpression` (string, optional): Sort expression for report data
- `appId` (string, optional): TeamDynamix application ID

**Important Notes:**
- When `withData=true`, the API returns **ALL** matching rows (no limit enforced)
- The `MaxResults` property on reports is not enforced when retrieving data via API
- Reports are limited only by the 90-second SQL command timeout
- Large reports may be slow, timeout, or cause memory/network issues
- Reports cannot accept runtime filters/parameters - they use pre-configured filters only

## Development

### Project Structure
```
tdx-api-mcp/
├── src/
│   ├── index.ts      # Main server entry point
│   ├── client.ts     # TDX API client
│   ├── auth.ts       # Authentication handling
│   ├── tools.ts      # Tool schemas
│   └── handlers.ts   # Tool implementation handlers
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts
- `npm run build` - Build the TypeScript code
- `npm run dev` - Build in watch mode for development
- `npm start` - Run the built server
- `npm run test:api` - Test development environment API

### Testing
```bash
# Test development environment
npm run test:api

# Test production environment
npx tsx src/test-prod.ts
```

Tests validate:
- Authentication
- Ticket search (≥1 ticket found)
- Report listing (≥1 report found)
- Ticket retrieval
- Report execution with data (production only)

## Authentication

The server uses JWT authentication with the TeamDynamix API:
- Tokens cached for 23 hours (1-hour buffer before 24hr expiry)
- Automatic refresh on 401 responses
- Each server instance maintains its own token cache

## Error Handling

All tools include error handling that returns descriptive error messages. Common errors include:
- Missing required parameters
- Authentication failures
- API timeouts (20-second timeout configured)
- Invalid ticket or report IDs

## API Endpoints Used

The server interacts with the following TeamDynamix API endpoints:

**Authentication:**
- `POST /api/auth` - Authentication

**Tickets:**
- `POST /api/{appId}/tickets/search` - Search tickets
- `GET /api/{appId}/tickets/{id}` - Get ticket
- `POST /api/{appId}/tickets/{id}` - Edit ticket (full update)
- `POST /api/{appId}/tickets/{id}` - Update ticket (partial update via fetch+merge)
- `POST /api/{appId}/tickets/{id}/feed` - Add feed entry
- `POST /api/{appId}/tickets/{id}/tags` - Add tags to ticket
- `DELETE /api/{appId}/tickets/{id}/tags` - Delete tags from ticket

**Reports:**
- `GET /api/reports` - List reports
- `POST /api/reports/search` - Search reports
- `GET /api/reports/{id}` - Run report

**People:**
- `GET /api/people/{uid}` - Get user by UID
- `GET /api/people/{username}` - Get user by username
- `GET /api/people/getuid/{username}` - Get user UID by username
- `GET /api/people/lookup` - Search users

**Groups:**
- `POST /api/groups/search` - Search/list groups
- `GET /api/groups/{id}` - Get group by ID

**Time & Expense:**
- `POST /api/time/search` - Search time entries
- `GET /api/time/{id}` - Get time entry
- `POST /api/time` - Create time entries (bulk)
- `PUT /api/time/{id}` - Update time entry
- `DELETE /api/time/{id}` - Delete time entry
- `GET /api/time/report/{reportDate}` - Get time report (current user)
- `GET /api/time/report/{reportDate}/{uid}` - Get time report (specific user)
- `GET /api/time/types` - List time types
- `GET /api/time/types/{id}` - Get time type

## Additional Documentation

For detailed information about configuration, troubleshooting, and advanced features, see [CLAUDE.md](./CLAUDE.md).