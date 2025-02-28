export const authPath: Record<string, string> = {
    logout: '/api/front/auth/logout/',
} as const;

// prettier-ignore
export type AuthPath = typeof authPath;