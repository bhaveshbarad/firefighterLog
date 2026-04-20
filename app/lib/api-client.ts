import { parseErrorMessage } from './api-errors';
import { getStoredToken } from './auth-storage';

const DEFAULT_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export type AuthUser = { id: string; email: string };

export type ProfileRank = { id: string; label: string };

export type ProfileFireStation = {
    id:             string;
    name:           string;
    town:           string;
    state:          string;
    stationNumber:  string;
};

export type ProfileStationMembership = {
    id:           string;
    joinedAt:     string;
    fireStation:  ProfileFireStation;
};

export type ProfileResponse = {
    id:                       string;
    email:                    string;
    name:                     string | null;
    rank:                     ProfileRank | null;
    yearStartedFirefighting:  number | null;
    stationMemberships:     ProfileStationMembership[];
};

export type PatchProfileBody = {
    name?:                     string | null;
    email?:                    string;
    currentPassword?:          string;
    newPassword?:              string;
    rankId?:                   string | null;
    yearStartedFirefighting?:  number | null;
};

export type PatchProfileResponse = {
    profile:       ProfileResponse;
    access_token?: string;
};

export type LoginRegisterResponse = {
    access_token: string;
    user:         AuthUser;
};

export type CallLogListItem = {
    id:              string;
    title:           string;
    reportedAt:      string;
    isFalseAlarm:    boolean;
    notes:           string | null;
    callType:        { id: string; label: string };
    apparatusType:   { id: string; label: string };
};

export type CallLogListResponse = {
    items:    CallLogListItem[];
    total:    number;
    offset:   number;
    limit:    number;
    hasMore:  boolean;
};

export type GetCallLogsParams = {
    reportedFrom?:     string;
    reportedTo?:       string;
    callTypeId?:       string;
    apparatusTypeId?:  string;
    isFalseAlarm?:     boolean;
    search?:           string;
    offset?:           number;
    limit?:            number;
};

export class ApiError extends Error {
    constructor(
        message: string,
        public readonly status?: number,
        public readonly body?: unknown,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

type RequestOptions = {
    auth: boolean;
};

function joinUrl(baseUrl: string, path: string): string {
    const base = baseUrl.replace(/\/$/, '');
    const p    = path.startsWith('/') ? path : `/${path}`;
    return `${base}${p}`;
}

async function readJsonBody(res: Response): Promise<unknown> {
    try {
        const text = await res.text();
        if (! text) {
            return {};
        }
        return JSON.parse(text) as unknown;
    } catch {
        return {};
    }
}

function appendCallLogFilterParams(sp: URLSearchParams, params: GetCallLogsParams): void {
    if (params.reportedFrom) {
        sp.set('reportedFrom', params.reportedFrom);
    }
    if (params.reportedTo) {
        sp.set('reportedTo', params.reportedTo);
    }
    if (params.callTypeId) {
        sp.set('callTypeId', params.callTypeId);
    }
    if (params.apparatusTypeId) {
        sp.set('apparatusTypeId', params.apparatusTypeId);
    }
    if (params.isFalseAlarm !== undefined) {
        sp.set('isFalseAlarm', String(params.isFalseAlarm));
    }
    if (params.search?.trim()) {
        sp.set('search', params.search.trim());
    }
    if (params.offset !== undefined) {
        sp.set('offset', String(params.offset));
    }
    if (params.limit !== undefined) {
        sp.set('limit', String(params.limit));
    }
}

/**
 * HTTP JSON client with optional Bearer auth and Nest-style error bodies.
 */
export function createApiClient(baseUrl: string = DEFAULT_BASE_URL) {
    async function requestJson<T>(
        path:       string,
        init:       RequestInit = {},
        options:    RequestOptions,
    ): Promise<T> {
        const url = joinUrl(baseUrl, path);
        const headers = new Headers(init.headers);

        if (options.auth) {
            const token = await getStoredToken();
            if (! token) {
                throw new ApiError('Not signed in');
            }
            headers.set('Authorization', `Bearer ${token}`);
        }

        let res: Response;
        try {
            res = await fetch(url, { ...init, headers });
        } catch {
            throw new ApiError('Network error');
        }

        const data = await readJsonBody(res);

        if (! res.ok) {
            throw new ApiError(parseErrorMessage(data), res.status, data);
        }

        return data as T;
    }

    async function requestText(
        path:    string,
        init:    RequestInit = {},
        options: RequestOptions,
    ): Promise<string> {
        const url       = joinUrl(baseUrl, path);
        const headers   = new Headers(init.headers);

        if (options.auth) {
            const token = await getStoredToken();
            if (! token) {
                throw new ApiError('Not signed in');
            }
            headers.set('Authorization', `Bearer ${token}`);
        }

        let res: Response;
        try {
            res = await fetch(url, { ...init, headers });
        } catch {
            throw new ApiError('Network error');
        }

        const text = await res.text();

        if (! res.ok) {
            let data: unknown = {};
            try {
                data = text ? JSON.parse(text) as unknown : {};
            } catch {
                data = {};
            }
            throw new ApiError(parseErrorMessage(data), res.status, data);
        }

        return text;
    }

    return {
        async getMe(): Promise<AuthUser> {
            return requestJson<AuthUser>(
                '/auth/me',
                { method: 'GET' },
                { auth: true },
            );
        },

        async login(email: string, password: string): Promise<LoginRegisterResponse> {
            return requestJson<LoginRegisterResponse>(
                '/auth/login',
                {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ email, password }),
                },
                { auth: false },
            );
        },

        async register(email: string, password: string): Promise<LoginRegisterResponse> {
            return requestJson<LoginRegisterResponse>(
                '/auth/register',
                {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ email, password }),
                },
                { auth: false },
            );
        },

        async getCallLogStats(): Promise<{ total: number }> {
            const data = await requestJson<{ total?: number }>(
                '/call-logs/stats',
                { method: 'GET' },
                { auth: true },
            );
            const total = data.total;
            return {
                total: typeof total === 'number' ? total : 0,
            };
        },

        async getCallLogs(
            params: GetCallLogsParams = {},
        ): Promise<CallLogListResponse> {
            const sp = new URLSearchParams();
            appendCallLogFilterParams(sp, params);
            const q = sp.toString();
            const path = q ? `/call-logs?${q}` : '/call-logs';
            return requestJson<CallLogListResponse>(
                path,
                { method: 'GET' },
                { auth: true },
            );
        },

        async getCallLog(id: string): Promise<CallLogListItem> {
            return requestJson<CallLogListItem>(
                `/call-logs/${encodeURIComponent(id)}`,
                { method: 'GET' },
                { auth: true },
            );
        },

        /**
         * CSV matching current filters (server caps row count). Omits pagination.
         */
        async getCallLogsExportCsv(
            params: GetCallLogsParams = {},
        ): Promise<string> {
            const sp = new URLSearchParams();
            appendCallLogFilterParams(sp, {
                ...params,
                offset: undefined,
                limit:  undefined,
            });
            const q = sp.toString();
            const path = q
                ? `/call-logs/export?${q}`
                : '/call-logs/export';
            return requestText(path, { method: 'GET' }, { auth: true });
        },

        async getCallTypes(): Promise<{ id: string; label: string }[]> {
            return requestJson<{ id: string; label: string }[]>(
                '/call-types',
                { method: 'GET' },
                { auth: true },
            );
        },

        async getApparatusTypes(): Promise<{ id: string; label: string }[]> {
            return requestJson<{ id: string; label: string }[]>(
                '/apparatus-types',
                { method: 'GET' },
                { auth: true },
            );
        },

        async getProfile(): Promise<ProfileResponse> {
            return requestJson<ProfileResponse>(
                '/profile',
                { method: 'GET' },
                { auth: true },
            );
        },

        async patchProfile(body: PatchProfileBody): Promise<PatchProfileResponse> {
            return requestJson<PatchProfileResponse>(
                '/profile',
                {
                    method:  'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(body),
                },
                { auth: true },
            );
        },

        async getRanks(): Promise<{ id: string; label: string }[]> {
            return requestJson<{ id: string; label: string }[]>(
                '/ranks',
                { method: 'GET' },
                { auth: true },
            );
        },

        async getFireStations(): Promise<ProfileFireStation[]> {
            return requestJson<ProfileFireStation[]>(
                '/fire-stations',
                { method: 'GET' },
                { auth: true },
            );
        },

        async createFireStation(body: {
            name:           string;
            town:           string;
            state:          string;
            stationNumber:  string;
        }): Promise<ProfileFireStation> {
            return requestJson<ProfileFireStation>(
                '/fire-stations',
                {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(body),
                },
                { auth: true },
            );
        },

        async addStationMembership(body: {
            fireStationId:  string;
            joinedAt:         string;
        }): Promise<ProfileResponse> {
            return requestJson<ProfileResponse>(
                '/profile/stations',
                {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(body),
                },
                { auth: true },
            );
        },

        async patchStationMembership(
            membershipId: string,
            body: {
                fireStationId?:  string;
                joinedAt?:        string;
            },
        ): Promise<ProfileResponse> {
            return requestJson<ProfileResponse>(
                `/profile/stations/${encodeURIComponent(membershipId)}`,
                {
                    method:  'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(body),
                },
                { auth: true },
            );
        },

        async removeStationMembership(
            membershipId: string,
        ): Promise<ProfileResponse> {
            return requestJson<ProfileResponse>(
                `/profile/stations/${encodeURIComponent(membershipId)}`,
                { method: 'DELETE' },
                { auth: true },
            );
        },

        async createCallLog(body: {
            title:             string;
            reportedAt:        string;
            callTypeId:        string;
            apparatusTypeId:   string;
            isFalseAlarm:      boolean;
            notes?:            string;
        }): Promise<{
            id:            string;
            title:         string;
            reportedAt:    string;
            isFalseAlarm:  boolean;
            notes:         string | null;
            callType:      { id: string; label: string };
            apparatusType: { id: string; label: string };
        }> {
            return requestJson(
                '/call-logs',
                {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(body),
                },
                { auth: true },
            );
        },
    };
}

export const api = createApiClient();
