import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const tools: Tool[] = [
  {
    name: 'tdx_search_tickets',
    description: 'Search for TeamDynamix tickets using various criteria',
    inputSchema: {
      type: 'object',
      properties: {
        searchText: {
          type: 'string',
          description: 'Text to search for in tickets',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results to return (default: 50)',
          default: 50,
        },
        statusIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of status IDs to filter by',
        },
        priorityIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of priority IDs to filter by',
        },
      },
    },
  },
  {
    name: 'tdx_get_ticket',
    description: 'Get a TeamDynamix ticket by ID',
    inputSchema: {
      type: 'object',
      properties: {
        ticketId: {
          type: 'number',
          description: 'ID of the ticket to retrieve',
        },
      },
      required: ['ticketId'],
    },
  },
  {
    name: 'tdx_edit_ticket',
    description: 'Edit a TeamDynamix ticket (full update - requires all fields)',
    inputSchema: {
      type: 'object',
      properties: {
        ticketId: {
          type: 'number',
          description: 'ID of the ticket to edit',
        },
        ticketData: {
          type: 'object',
          description: 'Complete ticket data for update',
        },
      },
      required: ['ticketId', 'ticketData'],
    },
  },
  {
    name: 'tdx_update_ticket',
    description: 'Update a TeamDynamix ticket (partial update)',
    inputSchema: {
      type: 'object',
      properties: {
        ticketId: {
          type: 'number',
          description: 'ID of the ticket to update',
        },
        statusId: {
          type: 'number',
          description: 'New status ID for the ticket',
        },
        priorityId: {
          type: 'number',
          description: 'New priority ID for the ticket',
        },
        title: {
          type: 'string',
          description: 'New title for the ticket',
        },
        description: {
          type: 'string',
          description: 'New description for the ticket',
        },
        comments: {
          type: 'string',
          description: 'Comments to add to the ticket update',
        },
      },
      required: ['ticketId'],
    },
  },
  {
    name: 'tdx_add_ticket_feed',
    description: 'Add a feed entry (comment/update) to a TeamDynamix ticket',
    inputSchema: {
      type: 'object',
      properties: {
        ticketId: {
          type: 'number',
          description: 'ID of the ticket to add feed entry to',
        },
        comments: {
          type: 'string',
          description: 'The comment text to add',
        },
        isPrivate: {
          type: 'boolean',
          description: 'Whether the feed entry should be private',
          default: false,
        },
        notify: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of email addresses to notify',
        },
      },
      required: ['ticketId', 'comments'],
    },
  },
  {
    name: 'tdx_list_reports',
    description: 'List all available TeamDynamix reports',
    inputSchema: {
      type: 'object',
      properties: {
        maxResults: {
          type: 'number',
          description: 'Maximum number of results to return (default: 100)',
          default: 100,
        },
      },
    },
  },
  {
    name: 'tdx_search_reports',
    description: 'Search for TeamDynamix reports by name',
    inputSchema: {
      type: 'object',
      properties: {
        searchText: {
          type: 'string',
          description: 'Text to search for in report names',
        },
        maxResults: {
          type: 'number',
          description: 'Maximum number of results to return (default: 50)',
          default: 50,
        },
      },
      required: ['searchText'],
    },
  },
  {
    name: 'tdx_run_report',
    description: 'Run a TeamDynamix report by ID and get the results',
    inputSchema: {
      type: 'object',
      properties: {
        reportId: {
          type: 'number',
          description: 'ID of the report to run',
        },
      },
      required: ['reportId'],
    },
  },
];