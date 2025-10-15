import { TDXClient } from './client.js';

export class ToolHandlers {
  constructor(private tdxClient: TDXClient) {}

  async handleSearchTickets(args: any) {
    const searchParams: any = {};

    if (args?.searchText) searchParams.SearchText = args.searchText;
    if (args?.maxResults) searchParams.MaxResults = args.maxResults;
    if (args?.statusIds) searchParams.StatusIDs = args.statusIds;
    if (args?.priorityIds) searchParams.PriorityIDs = args.priorityIds;

    const results = await this.tdxClient.searchTickets(searchParams, args?.appId);
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

    const ticket = await this.tdxClient.getTicket(args.ticketId as number, args?.appId);
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

    const result = await this.tdxClient.editTicket(args.ticketId as number, args.ticketData, args?.appId);
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
    if (args.responsibleUid) updateData.ResponsibleUid = args.responsibleUid;
    if (args.tags) updateData.Tags = args.tags;

    const result = await this.tdxClient.updateTicket(args.ticketId as number, updateData, args?.appId);
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

    const result = await this.tdxClient.addTicketFeedEntry(args.ticketId as number, feedEntry, args?.appId);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  async handleAddTicketTags(args: any) {
    if (!args?.ticketId || !args?.tags) {
      throw new Error('ticketId and tags are required');
    }

    const result = await this.tdxClient.addTicketTags(args.ticketId as number, args.tags, args?.appId);
    return {
      content: [
        {
          type: 'text',
          text: 'Tags added successfully. Note: Tags are stored but not returned in GET ticket responses due to API limitations. Verify tags in the TeamDynamix UI.',
        },
      ],
    };
  }

  async handleDeleteTicketTags(args: any) {
    if (!args?.ticketId || !args?.tags) {
      throw new Error('ticketId and tags are required');
    }

    const result = await this.tdxClient.deleteTicketTags(args.ticketId as number, args.tags, args?.appId);
    return {
      content: [
        {
          type: 'text',
          text: 'Tags deleted successfully.',
        },
      ],
    };
  }

  async handleListReports(args: any) {
    const maxResults = args?.maxResults || 100;
    const reports = await this.tdxClient.listReports(maxResults, args?.appId);
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
    const reports = await this.tdxClient.searchReports(args.searchText, maxResults, args?.appId);
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

    const results = await this.tdxClient.runReport(
      args.reportId as number,
      args?.appId,
      args?.withData || false,
      args?.dataSortExpression || ''
    );
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(results, null, 2),
        },
      ],
    };
  }

  async handleGetUser(args: any) {
    if (!args?.uid && !args?.username) {
      throw new Error('Either uid or username is required');
    }

    const user = await this.tdxClient.getUser(args?.uid, args?.username);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(user, null, 2),
        },
      ],
    };
  }

  async handleGetCurrentUser(args: any) {
    const user = await this.tdxClient.getCurrentUser();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(user, null, 2),
        },
      ],
    };
  }

  async handleSearchUsers(args: any) {
    const searchText = args?.searchText || '';
    const maxResults = args?.maxResults || 50;

    const users = await this.tdxClient.searchUsers(searchText, maxResults);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(users, null, 2),
        },
      ],
    };
  }

  async handleGetUserUid(args: any) {
    if (!args?.username) {
      throw new Error('username is required');
    }

    const uid = await this.tdxClient.getUserUid(args.username);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ username: args.username, uid }, null, 2),
        },
      ],
    };
  }

  async handleSearchGroups(args: any) {
    const searchText = args?.searchText || '';
    const maxResults = args?.maxResults || 50;

    const groups = await this.tdxClient.searchGroups(searchText, maxResults);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(groups, null, 2),
        },
      ],
    };
  }

  async handleGetGroup(args: any) {
    if (!args?.groupId) {
      throw new Error('groupId is required');
    }

    const group = await this.tdxClient.getGroup(args.groupId as number);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(group, null, 2),
        },
      ],
    };
  }

  async handleListGroups(args: any) {
    const maxResults = args?.maxResults || 100;

    const groups = await this.tdxClient.listGroups(maxResults);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(groups, null, 2),
        },
      ],
    };
  }

  // Time API Handlers

  async handleSearchTimeEntries(args: any) {
    const searchParams: any = {};

    if (args?.startDate) searchParams.StartDate = args.startDate;
    if (args?.endDate) searchParams.EndDate = args.endDate;
    if (args?.userUid) searchParams.UserUid = args.userUid;
    if (args?.ticketId) searchParams.TicketID = args.ticketId;
    if (args?.projectId) searchParams.ProjectID = args.projectId;
    if (args?.maxResults) searchParams.MaxResults = args.maxResults;

    const timeEntries = await this.tdxClient.searchTimeEntries(searchParams);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(timeEntries, null, 2),
        },
      ],
    };
  }

  async handleGetTimeEntry(args: any) {
    if (!args?.timeEntryId) {
      throw new Error('timeEntryId is required');
    }

    const timeEntry = await this.tdxClient.getTimeEntry(args.timeEntryId as number);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(timeEntry, null, 2),
        },
      ],
    };
  }

  async handleCreateTimeEntry(args: any) {
    if (!args?.timeEntryData) {
      throw new Error('timeEntryData is required');
    }

    const result = await this.tdxClient.createTimeEntry(args.timeEntryData);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  async handleUpdateTimeEntry(args: any) {
    if (!args?.timeEntryId || !args?.timeEntryData) {
      throw new Error('timeEntryId and timeEntryData are required');
    }

    const result = await this.tdxClient.updateTimeEntry(args.timeEntryId as number, args.timeEntryData);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  async handleDeleteTimeEntry(args: any) {
    if (!args?.timeEntryId) {
      throw new Error('timeEntryId is required');
    }

    await this.tdxClient.deleteTimeEntry(args.timeEntryId as number);
    return {
      content: [
        {
          type: 'text',
          text: 'Time entry deleted successfully.',
        },
      ],
    };
  }

  async handleGetTimeReport(args: any) {
    if (!args?.reportDate) {
      throw new Error('reportDate is required');
    }

    const report = await this.tdxClient.getTimeReport(args.reportDate, args?.userUid);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(report, null, 2),
        },
      ],
    };
  }

  async handleListTimeTypes(args: any) {
    const timeTypes = await this.tdxClient.listTimeTypes();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(timeTypes, null, 2),
        },
      ],
    };
  }

  async handleGetTimeType(args: any) {
    if (!args?.timeTypeId) {
      throw new Error('timeTypeId is required');
    }

    const timeType = await this.tdxClient.getTimeType(args.timeTypeId as number);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(timeType, null, 2),
        },
      ],
    };
  }
}