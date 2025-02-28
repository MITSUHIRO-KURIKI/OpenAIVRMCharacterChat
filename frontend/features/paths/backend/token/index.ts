export const tokenPath: Record<string, string> = {
    create:    '/backendapi/token/create/',
    verify:    '/backendapi/token/verify/',
    refresh:   '/backendapi/token/refresh/',
    blacklist: '/backendapi/token/blacklist/',
} as const;

// prettier-ignore
export type tokenPath = typeof tokenPath;