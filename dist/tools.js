// Common environment parameter for all tools
const environmentParam = {
    environment: {
        type: 'string',
        description: 'Environment to use: "prod" for production, "dev" for development, "canary" for canary testing. Defaults to prod.',
        enum: ['prod', 'dev', 'canary'],
    },
};
export const tools = [
    {
        name: 'tdx_get_ticket',
        description: 'Get a TeamDynamix ticket by ID',
        inputSchema: {
            type: 'object',
            properties: {
                ...environmentParam,
                ticketId: {
                    type: 'number',
                    description: 'ID of the ticket to retrieve',
                },
                appId: {
                    type: 'string',
                    description: 'Optional: TeamDynamix application ID (overrides default and auto-detection)',
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
                ...environmentParam,
                ticketId: {
                    type: 'number',
                    description: 'ID of the ticket to edit',
                },
                ticketData: {
                    type: 'object',
                    description: 'Complete ticket data for update',
                },
                appId: {
                    type: 'string',
                    description: 'Optional: TeamDynamix application ID (overrides default and auto-detection)',
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
                ...environmentParam,
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
                responsibleUid: {
                    type: 'string',
                    description: 'UID of the person to assign the ticket to',
                },
                tags: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of tags to apply to the ticket',
                },
                appId: {
                    type: 'string',
                    description: 'Optional: TeamDynamix application ID (overrides default and auto-detection)',
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
                ...environmentParam,
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
                appId: {
                    type: 'string',
                    description: 'Optional: TeamDynamix application ID (overrides default and auto-detection)',
                },
            },
            required: ['ticketId', 'comments'],
        },
    },
    {
        name: 'tdx_get_ticket_feed',
        description: 'Get feed entries (comments/updates) for a TeamDynamix ticket. Returns up to 10 recent entries by default.',
        inputSchema: {
            type: 'object',
            properties: {
                ...environmentParam,
                ticketId: {
                    type: 'number',
                    description: 'ID of the ticket to get feed entries from',
                },
                top: {
                    type: 'number',
                    description: 'Maximum number of feed entries to return (default: 10, 0 returns all)',
                    default: 10,
                },
                appId: {
                    type: 'string',
                    description: 'Optional: TeamDynamix application ID (overrides default and auto-detection)',
                },
            },
            required: ['ticketId'],
        },
    },
    {
        name: 'tdx_add_ticket_tags',
        description: 'Add tags to a TeamDynamix ticket. Note: Tags are stored but not returned in GET responses due to API limitations.',
        inputSchema: {
            type: 'object',
            properties: {
                ...environmentParam,
                ticketId: {
                    type: 'number',
                    description: 'ID of the ticket to add tags to',
                },
                tags: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of tag names to add to the ticket',
                },
                appId: {
                    type: 'string',
                    description: 'Optional: TeamDynamix application ID (overrides default and auto-detection)',
                },
            },
            required: ['ticketId', 'tags'],
        },
    },
    {
        name: 'tdx_delete_ticket_tags',
        description: 'Delete tags from a TeamDynamix ticket',
        inputSchema: {
            type: 'object',
            properties: {
                ...environmentParam,
                ticketId: {
                    type: 'number',
                    description: 'ID of the ticket to delete tags from',
                },
                tags: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Array of tag names to delete from the ticket',
                },
                appId: {
                    type: 'string',
                    description: 'Optional: TeamDynamix application ID (overrides default and auto-detection)',
                },
            },
            required: ['ticketId', 'tags'],
        },
    },
    {
        name: 'tdx_list_reports',
        description: 'List all available TeamDynamix reports',
        inputSchema: {
            type: 'object',
            properties: {
                ...environmentParam,
                maxResults: {
                    type: 'number',
                    description: 'Maximum number of results to return (default: 100)',
                    default: 100,
                },
                appId: {
                    type: 'string',
                    description: 'Optional: TeamDynamix application ID (overrides default)',
                },
            },
        },
    },
    {
        name: 'tdx_search_reports',
        description: 'Search for TeamDynamix reports by name. Use this to find reports like "All Open Tickets", "Open Tickets", "In Progress", etc. before running them with tdx_run_report. Common patterns: "open", "in progress", "closed", "all tickets".',
        inputSchema: {
            type: 'object',
            properties: {
                ...environmentParam,
                searchText: {
                    type: 'string',
                    description: 'Text to search for in report names',
                },
                maxResults: {
                    type: 'number',
                    description: 'Maximum number of results to return (default: 50)',
                    default: 50,
                },
                appId: {
                    type: 'string',
                    description: 'Optional: TeamDynamix application ID (overrides default)',
                },
            },
            required: ['searchText'],
        },
    },
    {
        name: 'tdx_run_report',
        description: 'Run a TeamDynamix report to retrieve ticket lists (PREFERRED for listing multiple tickets - much more efficient than search). Supports client-side filtering and pagination. Use tdx_search_reports to find reports like "All Open Tickets", "Open Tickets", etc.',
        inputSchema: {
            type: 'object',
            properties: {
                ...environmentParam,
                reportId: {
                    type: 'number',
                    description: 'ID of the report to run',
                },
                appId: {
                    type: 'string',
                    description: 'Optional: TeamDynamix application ID (overrides default)',
                },
                withData: {
                    type: 'boolean',
                    description: 'Optional: Include report data in response (default: false)',
                    default: false,
                },
                dataSortExpression: {
                    type: 'string',
                    description: 'Optional: Sort expression for report data',
                    default: '',
                },
                page: {
                    type: 'number',
                    description: 'Optional: Page number to retrieve (1-based, alternative to offset/limit)',
                },
                pageSize: {
                    type: 'number',
                    description: 'Optional: Number of rows per page (default: 50, used with page parameter)',
                    default: 50,
                },
                limit: {
                    type: 'number',
                    description: 'Optional: Limit results to N rows (applied after fetching from API, alternative to page/pageSize)',
                },
                offset: {
                    type: 'number',
                    description: 'Optional: Skip first N rows (applied after fetching from API, default: 0, used with limit)',
                    default: 0,
                },
                filterResponsibleFullName: {
                    type: 'string',
                    description: 'Optional: Filter report rows by ResponsibleFullName column (case-insensitive partial match)',
                },
                filterStatusName: {
                    type: 'string',
                    description: 'Optional: Filter report rows by StatusName column (case-insensitive partial match)',
                },
                filterText: {
                    type: 'string',
                    description: 'Optional: Search all text columns for this value (case-insensitive)',
                },
            },
            required: ['reportId'],
        },
    },
    {
        name: 'tdx_get_user',
        description: 'Get a TeamDynamix user by UID or username',
        inputSchema: {
            type: 'object',
            properties: {
                ...environmentParam,
                uid: {
                    type: 'string',
                    description: 'User UID (GUID) to retrieve',
                },
                username: {
                    type: 'string',
                    description: 'Username to retrieve (alternative to uid)',
                },
            },
        },
    },
    {
        name: 'tdx_get_current_user',
        description: 'Get the currently authenticated TeamDynamix user (based on credentials)',
        inputSchema: {
            type: 'object',
            properties: {
                ...environmentParam,
            },
        },
    },
    {
        name: 'tdx_search_users',
        description: 'Search for TeamDynamix users',
        inputSchema: {
            type: 'object',
            properties: {
                ...environmentParam,
                searchText: {
                    type: 'string',
                    description: 'Text to search for in user records (name, email, username)',
                },
                maxResults: {
                    type: 'number',
                    description: 'Maximum number of results to return (default: 50, max: 100)',
                    default: 50,
                },
            },
        },
    },
    {
        name: 'tdx_get_user_uid',
        description: 'Get a user UID (GUID) by username',
        inputSchema: {
            type: 'object',
            properties: {
                ...environmentParam,
                username: {
                    type: 'string',
                    description: 'Username to look up',
                },
            },
            required: ['username'],
        },
    },
    {
        name: 'tdx_search_groups',
        description: 'Search for TeamDynamix groups',
        inputSchema: {
            type: 'object',
            properties: {
                ...environmentParam,
                searchText: {
                    type: 'string',
                    description: 'Text to search for in group names',
                },
                maxResults: {
                    type: 'number',
                    description: 'Maximum number of results to return (default: 50, max: 100)',
                    default: 50,
                },
            },
        },
    },
    {
        name: 'tdx_get_group',
        description: 'Get a TeamDynamix group by ID',
        inputSchema: {
            type: 'object',
            properties: {
                ...environmentParam,
                groupId: {
                    type: 'number',
                    description: 'Group ID to retrieve',
                },
            },
            required: ['groupId'],
        },
    },
    {
        name: 'tdx_list_groups',
        description: 'List all available TeamDynamix groups',
        inputSchema: {
            type: 'object',
            properties: {
                ...environmentParam,
                maxResults: {
                    type: 'number',
                    description: 'Maximum number of results to return (default: 100)',
                    default: 100,
                },
            },
        },
    },
];
//# sourceMappingURL=tools.js.map