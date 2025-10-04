import { TDXClient } from './client.js';

export class ToolHandlers {
  constructor(private tdxClient: TDXClient) {}

  async handleSearchTickets(args: any) {
    const searchParams: any = {};

    if (args?.searchText) searchParams.SearchText = args.searchText;
    if (args?.maxResults) searchParams.MaxResults = args.maxResults;
    if (args?.statusIds) searchParams.StatusIDs = args.statusIds;
    if (args?.priorityIds) searchParams.PriorityIDs = args.priorityIds;

    const results = await this.tdxClient.searchTickets(searchParams);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  async handleGetTicket(args: any) {
    if (!args?.ticketId) {
      throw new Error('ticketId is required');
    }

    const ticket = await this.tdxClient.getTicket(args.ticketId as number);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(ticket, null, 2),
        },
      ],
    };
  }

  async handleEditTicket(args: any) {
    if (!args?.ticketId || !args?.ticketData) {
      throw new Error('ticketId and ticketData are required');
    }

    const result = await this.tdxClient.editTicket(args.ticketId as number, args.ticketData);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  async handleUpdateTicket(args: any) {
    if (!args?.ticketId) {
      throw new Error('ticketId is required');
    }

    const updateData: any = {};

    if (args.statusId !== undefined) updateData.StatusID = args.statusId;
    if (args.priorityId !== undefined) updateData.PriorityID = args.priorityId;
    if (args.title) updateData.Title = args.title;
    if (args.description) updateData.Description = args.description;
    if (args.comments) updateData.Comments = args.comments;

    const result = await this.tdxClient.updateTicket(args.ticketId as number, updateData);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  async handleAddTicketFeed(args: any) {
    if (!args?.ticketId || !args?.comments) {
      throw new Error('ticketId and comments are required');
    }

    const feedEntry: any = {
      Comments: args.comments,
      IsPrivate: args.isPrivate || false,
    };

    if (args.notify) feedEntry.Notify = args.notify;

    const result = await this.tdxClient.addTicketFeedEntry(args.ticketId as number, feedEntry);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  async handleListReports(args: any) {
    const maxResults = args?.maxResults || 100;
    const reports = await this.tdxClient.listReports(maxResults);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(reports, null, 2),
        },
      ],
    };
  }

  async handleSearchReports(args: any) {
    if (!args?.searchText) {
      throw new Error('searchText is required');
    }

    const maxResults = args.maxResults || 50;
    const reports = await this.tdxClient.searchReports(args.searchText, maxResults);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(reports, null, 2),
        },
      ],
    };
  }

  async handleRunReport(args: any) {
    if (!args?.reportId) {
      throw new Error('reportId is required');
    }

    const results = await this.tdxClient.runReport(args.reportId as number);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }
}