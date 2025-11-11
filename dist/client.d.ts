import type { Ticket, TicketUpdate, TicketSearchParams, FeedEntry, CreateFeedEntry, Report, ReportData, User, UserLookup, Group, RetryConfig } from './types.js';
/**
 * TeamDynamix API Client
 * Handles all API interactions with authentication, retry logic, and error handling.
 */
export declare class TDXClient {
    private auth;
    private baseUrl;
    private appIds;
    private ticketAppIdCache;
    private client;
    private username;
    private timeout;
    private retryConfig;
    constructor(baseUrl: string, username: string, password: string, appIds: string | string[], timeout?: number, retryConfig?: Partial<RetryConfig>);
    /**
     * Search for tickets based on search criteria.
     *
     * @param searchParams - Search parameters (text, status, priority, etc.)
     * @param appIdOverride - Optional app ID to override default
     * @returns Array of matching tickets
     */
    searchTickets(searchParams: TicketSearchParams, appIdOverride?: string): Promise<Ticket[]>;
    /**
     * Get a single ticket by ID.
     * Automatically discovers the correct app ID if not cached.
     *
     * @param ticketId - The ticket ID to retrieve
     * @param appIdOverride - Optional app ID to override discovery
     * @returns The ticket data
     * @throws Error if ticket not found in any configured app
     */
    getTicket(ticketId: number, appIdOverride?: string): Promise<Ticket>;
    /**
     * Helper method to get the correct appId for a ticket.
     * Uses cache or discovers by trying each configured app.
     *
     * @param ticketId - The ticket ID
     * @param appIdOverride - Optional app ID override
     * @returns The app ID for the ticket
     */
    private getAppIdForTicket;
    /**
     * Edit a ticket with full replacement (all fields required).
     *
     * @param ticketId - The ticket ID to edit
     * @param ticketData - Complete ticket data
     * @param appIdOverride - Optional app ID override
     * @returns The updated ticket
     */
    editTicket(ticketId: number, ticketData: Partial<Ticket>, appIdOverride?: string): Promise<Ticket>;
    /**
     * Update a ticket with partial data (auto-merges with existing ticket).
     * This is preferred over editTicket for most use cases.
     *
     * @param ticketId - The ticket ID to update
     * @param updateData - Partial ticket data to update
     * @param appIdOverride - Optional app ID override
     * @returns The updated ticket
     */
    updateTicket(ticketId: number, updateData: TicketUpdate, appIdOverride?: string): Promise<Ticket>;
    /**
     * Add tags to a ticket.
     *
     * @param ticketId - The ticket ID
     * @param tags - Array of tag names to add
     * @param appIdOverride - Optional app ID override
     */
    addTicketTags(ticketId: number, tags: string[], appIdOverride?: string): Promise<void>;
    /**
     * Delete tags from a ticket.
     *
     * @param ticketId - The ticket ID
     * @param tags - Array of tag names to delete
     * @param appIdOverride - Optional app ID override
     */
    deleteTicketTags(ticketId: number, tags: string[], appIdOverride?: string): Promise<void>;
    /**
     * Add a feed entry (comment/update) to a ticket.
     *
     * @param ticketId - The ticket ID
     * @param feedEntry - Feed entry data (comments, privacy, notifications)
     * @param appIdOverride - Optional app ID override
     * @returns The created feed entry
     */
    addTicketFeedEntry(ticketId: number, feedEntry: CreateFeedEntry, appIdOverride?: string): Promise<FeedEntry>;
    /**
     * Get feed entries (comments/updates) for a ticket.
     *
     * @param ticketId - The ticket ID
     * @param top - Maximum number of entries to return (0 = all)
     * @param appIdOverride - Optional app ID override
     * @returns Array of feed entries
     */
    getTicketFeed(ticketId: number, top?: number, appIdOverride?: string): Promise<FeedEntry[]>;
    /**
     * List all available reports.
     *
     * @param maxResults - Maximum number of reports to return
     * @param appIdOverride - Optional app ID to filter by
     * @returns Array of report metadata
     */
    listReports(maxResults?: number, appIdOverride?: string): Promise<Report[]>;
    /**
     * Search for reports by name.
     *
     * @param searchText - Text to search for in report names
     * @param maxResults - Maximum number of results
     * @param appIdOverride - Optional app ID to filter by
     * @returns Array of matching reports
     */
    searchReports(searchText: string, maxResults?: number, appIdOverride?: string): Promise<Report[]>;
    /**
     * Run a report and optionally retrieve its data.
     *
     * @param reportId - The report ID to run
     * @param appIdOverride - Optional app ID override
     * @param withData - Whether to include report data rows
     * @param dataSortExpression - Optional sort expression
     * @returns Report metadata and optionally data
     */
    runReport(reportId: number, appIdOverride?: string, withData?: boolean, dataSortExpression?: string): Promise<ReportData>;
    /**
     * Get a user by UID or username.
     *
     * @param uid - User UID (GUID)
     * @param username - Username (alternative to UID)
     * @returns User data
     */
    getUser(uid?: string, username?: string): Promise<User>;
    /**
     * Get the currently authenticated user.
     *
     * @returns Current user data
     */
    getCurrentUser(): Promise<User>;
    /**
     * Search for users (returns restricted lookup results).
     *
     * @param searchText - Search text (name, email, username)
     * @param maxResults - Maximum results (1-100)
     * @returns Array of user lookup results
     */
    searchUsers(searchText?: string, maxResults?: number): Promise<UserLookup[]>;
    /**
     * Get a user's UID by username.
     *
     * @param username - Username to look up
     * @returns User UID (GUID)
     */
    getUserUid(username: string): Promise<string>;
    /**
     * Search for groups.
     *
     * @param searchText - Search text
     * @param maxResults - Maximum results (1-100)
     * @returns Array of matching groups
     */
    searchGroups(searchText?: string, maxResults?: number): Promise<Group[]>;
    /**
     * Get a group by ID.
     *
     * @param groupId - Group ID
     * @returns Group data
     */
    getGroup(groupId: number): Promise<Group>;
    /**
     * List all groups.
     *
     * @param maxResults - Maximum number of groups to return
     * @returns Array of groups
     */
    listGroups(maxResults?: number): Promise<Group[]>;
}
//# sourceMappingURL=client.d.ts.map