# TeamDynamix API MCP Server

An MCP (Model Context Protocol) server for interacting with the TeamDynamix Web API. This server provides tools for managing tickets and running reports through the TeamDynamix platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Configure credentials using `.env` file:
   - Copy `.env.example` to `.env`
   - Edit `.env` and fill in your TeamDynamix credentials:
   ```env
   TDX_BASE_URL=https://your-instance.teamdynamix.com
   TDX_USERNAME=your-username
   TDX_PASSWORD=your-password
   ```

4. Configure in Claude Desktop by adding to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "tdx-api-mcp": {
      "command": "node",
      "args": ["c:/source/mcp/tdx-api-mcp/dist/index.js"]
    }
  }
}
```

## Security

This server uses a `.env` file to store credentials securely:
- Credentials are stored in `.env` file (not in Claude config)
- The `.env` file is gitignored and never committed to version control
- The server loads credentials from the `.env` file at startup
- Never commit your actual credentials to git

### Important Security Notes:
- Always keep your `.env` file secure
- Set appropriate file permissions on `.env` (read-only for your user)
- Consider using Windows EFS to encrypt the file at rest
- Rotate your TeamDynamix password regularly

## Available Tools

### Ticket Management

#### `tdx_search_tickets`
Search for TeamDynamix tickets using various criteria.

**Parameters:**
- `searchText` (string, optional): Text to search for in tickets
- `maxResults` (number, optional): Maximum number of results to return (default: 50)
- `statusIds` (array of numbers, optional): Array of status IDs to filter by
- `priorityIds` (array of numbers, optional): Array of priority IDs to filter by

---

#### `tdx_get_ticket`
Get a TeamDynamix ticket by ID.

**Parameters:**
- `ticketId` (number, required): ID of the ticket to retrieve

---

#### `tdx_edit_ticket`
Edit a TeamDynamix ticket (full update - requires all fields).

**Parameters:**
- `ticketId` (number, required): ID of the ticket to edit
- `ticketData` (object, required): Complete ticket data for update

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

---

#### `tdx_add_ticket_feed`
Add a feed entry (comment/update) to a TeamDynamix ticket.

**Parameters:**
- `ticketId` (number, required): ID of the ticket to add feed entry to
- `comments` (string, required): The comment text to add
- `isPrivate` (boolean, optional): Whether the feed entry should be private (default: false)
- `notify` (array of strings, optional): Array of email addresses to notify

### Report Management

#### `tdx_list_reports`
List all available TeamDynamix reports.

**Parameters:**
- `maxResults` (number, optional): Maximum number of results to return (default: 100)

---

#### `tdx_search_reports`
Search for TeamDynamix reports by name.

**Parameters:**
- `searchText` (string, required): Text to search for in report names
- `maxResults` (number, optional): Maximum number of results to return (default: 50)

---

#### `tdx_run_report`
Run a TeamDynamix report by ID and get the results.

**Parameters:**
- `reportId` (number, required): ID of the report to run

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

## Authentication

The server uses JWT authentication with the TeamDynamix API. Tokens are automatically refreshed when they expire (24-hour validity period).

## Error Handling

All tools include error handling that returns descriptive error messages. Common errors include:
- Missing required parameters
- Authentication failures
- API timeouts (20-second timeout configured)
- Invalid ticket or report IDs

## API Endpoints Used

The server interacts with the following TeamDynamix API endpoints:
- `/api/auth/login` - Authentication
- `/api/tickets/search` - Search tickets
- `/api/tickets/{id}` - Get/edit tickets
- `/api/tickets/{id}/feed` - Add feed entries
- `/api/reports` - List reports
- `/api/reports/search` - Search reports
- `/api/reports/{id}` - Run reports