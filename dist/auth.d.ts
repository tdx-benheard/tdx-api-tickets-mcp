import { AuthConfig } from './types.js';
/**
 * Manages authentication tokens for TeamDynamix API.
 * Handles token caching, expiry, and thread-safe refresh.
 */
export declare class TDXAuth {
    private token;
    private tokenExpiry;
    private config;
    private refreshPromise;
    constructor(config: AuthConfig);
    /**
     * Gets a valid authentication token, refreshing if necessary.
     * Uses a mutex pattern to prevent concurrent refresh requests.
     *
     * @returns Promise resolving to authentication token
     * @throws Error if authentication fails
     */
    getToken(): Promise<string>;
    /**
     * Refreshes the authentication token from the API.
     *
     * @returns Promise resolving to new authentication token
     * @throws Error if authentication fails
     */
    private refreshToken;
    /**
     * Gets authentication headers with a valid token.
     *
     * @returns Promise resolving to headers object
     */
    getAuthHeaders(): Promise<Record<string, string>>;
    /**
     * Invalidates the current token, forcing a refresh on next request.
     * Useful when a 401 response is received.
     */
    invalidateToken(): void;
}
//# sourceMappingURL=auth.d.ts.map