import { truncateToTokenLimit } from './utils.js';
export class ToolHandlers {
    tdxClients;
    defaultEnvironment;
    constructor(tdxClients, defaultEnvironment) {
        this.tdxClients = tdxClients;
        this.defaultEnvironment = defaultEnvironment;
    }
    // Get the appropriate client based on environment parameter
    getClient(environment) {
        const env = environment || this.defaultEnvironment;
        const client = this.tdxClients.get(env);
        if (!client) {
            throw new Error(`Environment '${env}' not configured. Available: ${Array.from(this.tdxClients.keys()).join(', ')}`);
        }
        return client;
    }
    async handleGetTicket(args) {
        const client = this.getClient(args?.environment);
        if (!args?.ticketId) {
            throw new Error('ticketId is required');
        }
        const ticket = await client.getTicket(args.ticketId, args?.appId);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(ticket, null, 2),
                },
            ],
        };
    }
    async handleEditTicket(args) {
        const client = this.getClient(args?.environment);
        if (!args?.ticketId || !args?.ticketData) {
            throw new Error('ticketId and ticketData are required');
        }
        const result = await client.editTicket(args.ticketId, args.ticketData, args?.appId);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
    async handleUpdateTicket(args) {
        const client = this.getClient(args?.environment);
        if (!args?.ticketId) {
            throw new Error('ticketId is required');
        }
        const updateData = {};
        if (args.statusId !== undefined)
            updateData.StatusID = args.statusId;
        if (args.priorityId !== undefined)
            updateData.PriorityID = args.priorityId;
        if (args.title)
            updateData.Title = args.title;
        if (args.description)
            updateData.Description = args.description;
        if (args.comments)
            updateData.Comments = args.comments;
        if (args.responsibleUid)
            updateData.ResponsibleUid = args.responsibleUid;
        if (args.tags)
            updateData.Tags = args.tags;
        const result = await client.updateTicket(args.ticketId, updateData, args?.appId);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
    async handleAddTicketFeed(args) {
        const client = this.getClient(args?.environment);
        if (!args?.ticketId || !args?.comments) {
            throw new Error('ticketId and comments are required');
        }
        const feedEntry = {
            Comments: args.comments,
            IsPrivate: args.isPrivate || false,
        };
        if (args.notify)
            feedEntry.Notify = args.notify;
        const result = await client.addTicketFeedEntry(args.ticketId, feedEntry, args?.appId);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
    async handleGetTicketFeed(args) {
        const client = this.getClient(args?.environment);
        if (!args?.ticketId) {
            throw new Error('ticketId is required');
        }
        const top = args?.top !== undefined ? args.top : 10;
        const result = await client.getTicketFeed(args.ticketId, top, args?.appId);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(result, null, 2),
                },
            ],
        };
    }
    async handleAddTicketTags(args) {
        const client = this.getClient(args?.environment);
        if (!args?.ticketId || !args?.tags) {
            throw new Error('ticketId and tags are required');
        }
        await client.addTicketTags(args.ticketId, args.tags, args?.appId);
        return {
            content: [
                {
                    type: 'text',
                    text: 'Tags added successfully. Note: Tags are stored but not returned in GET ticket responses due to API limitations. Verify tags in the TeamDynamix UI.',
                },
            ],
        };
    }
    async handleDeleteTicketTags(args) {
        const client = this.getClient(args?.environment);
        if (!args?.ticketId || !args?.tags) {
            throw new Error('ticketId and tags are required');
        }
        await client.deleteTicketTags(args.ticketId, args.tags, args?.appId);
        return {
            content: [
                {
                    type: 'text',
                    text: 'Tags deleted successfully.',
                },
            ],
        };
    }
    async handleListReports(args) {
        const client = this.getClient(args?.environment);
        const maxResults = args?.maxResults || 100;
        const reports = await client.listReports(maxResults, args?.appId);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(reports, null, 2),
                },
            ],
        };
    }
    async handleSearchReports(args) {
        const client = this.getClient(args?.environment);
        if (!args?.searchText) {
            throw new Error('searchText is required');
        }
        const maxResults = args.maxResults || 50;
        const reports = await client.searchReports(args.searchText, maxResults, args?.appId);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(reports, null, 2),
                },
            ],
        };
    }
    async handleRunReport(args) {
        const client = this.getClient(args?.environment);
        if (!args?.reportId) {
            throw new Error('reportId is required');
        }
        const results = await client.runReport(args.reportId, args?.appId, args?.withData || false, args?.dataSortExpression || '');
        // Apply client-side filtering and pagination if DataRows exist
        if (results.DataRows && Array.isArray(results.DataRows)) {
            let filteredRows = results.DataRows;
            const originalRowCount = filteredRows.length;
            // Apply all filters in a single pass for better performance (O(n) instead of O(3n))
            const hasFilters = args?.filterResponsibleFullName ||
                args?.filterStatusName || args?.filterText;
            if (hasFilters) {
                // Prepare filter terms once
                const responsibleNameTerm = args?.filterResponsibleFullName?.toLowerCase();
                const statusNameTerm = args?.filterStatusName?.toLowerCase();
                const textSearchTerm = args?.filterText?.toLowerCase();
                filteredRows = filteredRows.filter((row) => {
                    // Filter by ResponsibleFullName
                    if (responsibleNameTerm && !row.ResponsibleFullName?.toLowerCase().includes(responsibleNameTerm)) {
                        return false;
                    }
                    // Filter by StatusName
                    if (statusNameTerm && !row.StatusName?.toLowerCase().includes(statusNameTerm)) {
                        return false;
                    }
                    // Text search across all columns
                    if (textSearchTerm) {
                        const matchFound = Object.values(row).some((val) => val?.toString().toLowerCase().includes(textSearchTerm));
                        if (!matchFound) {
                            return false;
                        }
                    }
                    return true;
                });
            }
            // Calculate pagination parameters
            let offset = 0;
            let limit;
            let page;
            let pageSize = 50;
            // Support both page/pageSize and offset/limit
            if (args?.page !== undefined) {
                page = Math.max(1, args.page); // Ensure page is at least 1
                pageSize = args?.pageSize || 50;
                offset = (page - 1) * pageSize;
                limit = pageSize;
            }
            else {
                offset = args?.offset || 0;
                limit = args?.limit;
                if (limit !== undefined) {
                    pageSize = limit;
                    page = Math.floor(offset / pageSize) + 1;
                }
            }
            const totalRowsAfterFilter = filteredRows.length;
            // Apply pagination
            let paginatedRows = filteredRows;
            if (limit !== undefined) {
                paginatedRows = filteredRows.slice(offset, offset + limit);
            }
            else if (offset > 0) {
                paginatedRows = filteredRows.slice(offset);
            }
            // Add pagination metadata
            if (page !== undefined || limit !== undefined) {
                const currentPage = page || Math.floor(offset / (limit || pageSize)) + 1;
                const totalPages = Math.ceil(totalRowsAfterFilter / pageSize);
                results.Pagination = {
                    currentPage,
                    pageSize,
                    totalRows: totalRowsAfterFilter,
                    totalPages,
                    hasNextPage: currentPage < totalPages,
                    hasPrevPage: currentPage > 1,
                    returnedRows: paginatedRows.length
                };
            }
            results.DataRows = paginatedRows;
            // Log filtering information
            if (args?.filterResponsibleFullName || args?.filterStatusName || args?.filterText) {
                if (totalRowsAfterFilter < originalRowCount) {
                    console.error(`[Handlers] Filtered ${originalRowCount} rows down to ${totalRowsAfterFilter}`);
                }
            }
        }
        // Apply token limit truncation
        const { data, truncated, message } = truncateToTokenLimit(results);
        let responseText = JSON.stringify(data, null, 2);
        if (truncated && message) {
            responseText = `${message}\n\n${responseText}`;
        }
        return {
            content: [
                {
                    type: 'text',
                    text: responseText,
                },
            ],
        };
    }
    async handleGetUser(args) {
        const client = this.getClient(args?.environment);
        if (!args?.uid && !args?.username) {
            throw new Error('Either uid or username is required');
        }
        const user = await client.getUser(args?.uid, args?.username);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(user, null, 2),
                },
            ],
        };
    }
    async handleGetCurrentUser(args) {
        const client = this.getClient(args?.environment);
        const user = await client.getCurrentUser();
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(user, null, 2),
                },
            ],
        };
    }
    async handleSearchUsers(args) {
        const client = this.getClient(args?.environment);
        const searchText = args?.searchText || '';
        const maxResults = args?.maxResults || 50;
        const users = await client.searchUsers(searchText, maxResults);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(users, null, 2),
                },
            ],
        };
    }
    async handleGetUserUid(args) {
        const client = this.getClient(args?.environment);
        if (!args?.username) {
            throw new Error('username is required');
        }
        const uid = await client.getUserUid(args.username);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ username: args.username, uid }, null, 2),
                },
            ],
        };
    }
    async handleSearchGroups(args) {
        const client = this.getClient(args?.environment);
        const searchText = args?.searchText || '';
        const maxResults = args?.maxResults || 50;
        const groups = await client.searchGroups(searchText, maxResults);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(groups, null, 2),
                },
            ],
        };
    }
    async handleGetGroup(args) {
        const client = this.getClient(args?.environment);
        if (!args?.groupId) {
            throw new Error('groupId is required');
        }
        const group = await client.getGroup(args.groupId);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(group, null, 2),
                },
            ],
        };
    }
    async handleListGroups(args) {
        const client = this.getClient(args?.environment);
        const maxResults = args?.maxResults || 100;
        const groups = await client.listGroups(maxResults);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(groups, null, 2),
                },
            ],
        };
    }
}
//# sourceMappingURL=handlers.js.map