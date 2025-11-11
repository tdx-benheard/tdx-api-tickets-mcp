import { TDXClient } from './client.js';
import type { GetTicketArgs, EditTicketArgs, UpdateTicketArgs, AddTicketFeedArgs, GetTicketFeedArgs, TicketTagsArgs, ListReportsArgs, SearchReportsArgs, RunReportArgs, GetUserArgs, GetCurrentUserArgs, SearchUsersArgs, GetUserUidArgs, SearchGroupsArgs, GetGroupArgs, ListGroupsArgs } from './types.js';
export declare class ToolHandlers {
    private tdxClients;
    private defaultEnvironment;
    constructor(tdxClients: Map<string, TDXClient>, defaultEnvironment: string);
    private getClient;
    handleGetTicket(args: GetTicketArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleEditTicket(args: EditTicketArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleUpdateTicket(args: UpdateTicketArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleAddTicketFeed(args: AddTicketFeedArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleGetTicketFeed(args: GetTicketFeedArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleAddTicketTags(args: TicketTagsArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleDeleteTicketTags(args: TicketTagsArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleListReports(args: ListReportsArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleSearchReports(args: SearchReportsArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleRunReport(args: RunReportArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleGetUser(args: GetUserArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleGetCurrentUser(args: GetCurrentUserArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleSearchUsers(args: SearchUsersArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleGetUserUid(args: GetUserUidArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleSearchGroups(args: SearchGroupsArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleGetGroup(args: GetGroupArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    handleListGroups(args: ListGroupsArgs): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
}
//# sourceMappingURL=handlers.d.ts.map