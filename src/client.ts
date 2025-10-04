import axios, { AxiosInstance } from 'axios';
import { TDXAuth } from './auth.js';

export class TDXClient {
  private auth: TDXAuth;
  private baseUrl: string;
  private client: AxiosInstance;

  constructor(baseUrl: string, username: string, password: string) {
    this.baseUrl = baseUrl;
    this.auth = new TDXAuth({ baseUrl, username, password });
    this.client = axios.create({
      baseURL: baseUrl,
      timeout: 20000
    });

    // Add auth interceptor
    this.client.interceptors.request.use(async (config) => {
      const headers = await this.auth.getAuthHeaders();
      Object.assign(config.headers, headers);
      return config;
    });

    // Add response error interceptor for auth refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, will refresh on next request
          const headers = await this.auth.getAuthHeaders();
          Object.assign(error.config.headers, headers);
          return this.client.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  // Search tickets
  async searchTickets(searchParams: any) {
    const response = await this.client.post('/api/tickets/search', searchParams);
    return response.data;
  }

  // Get ticket for editing
  async getTicket(ticketId: number) {
    const response = await this.client.get(`/api/tickets/${ticketId}`);
    return response.data;
  }

  // Edit ticket (full update)
  async editTicket(ticketId: number, ticketData: any) {
    const response = await this.client.put(`/api/tickets/${ticketId}`, ticketData);
    return response.data;
  }

  // Update ticket (partial update)
  async updateTicket(ticketId: number, updateData: any) {
    const response = await this.client.patch(`/api/tickets/${ticketId}`, updateData);
    return response.data;
  }

  // Add feed entry to ticket
  async addTicketFeedEntry(ticketId: number, feedEntry: any) {
    const response = await this.client.post(`/api/tickets/${ticketId}/feed`, feedEntry);
    return response.data;
  }

  // List all available reports
  async listReports(maxResults: number = 100) {
    const response = await this.client.get('/api/reports', {
      params: { maxResults }
    });
    return response.data;
  }

  // Search reports by name
  async searchReports(searchText: string, maxResults: number = 50) {
    const response = await this.client.get('/api/reports/search', {
      params: { searchText, maxResults }
    });
    return response.data;
  }

  // Run report by ID
  async runReport(reportId: number) {
    const response = await this.client.get(`/api/reports/${reportId}`);
    return response.data;
  }
}