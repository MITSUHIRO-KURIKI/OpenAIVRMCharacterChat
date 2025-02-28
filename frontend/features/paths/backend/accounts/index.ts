export const accountsPath: Record<string, string> = {
    root:                   '/backendapi/accounts/',
    activation:             '/backendapi/accounts/activation/',
    me:                     '/backendapi/accounts/me/',
    reset_password:         '/backendapi/accounts/reset_password/',
    reset_password_confirm: '/backendapi/accounts/reset_password_confirm/',
    set_password:           '/backendapi/accounts/set_password/',
    delete:                 '/backendapi/accounts/delete/',
} as const;

// prettier-ignore
export type accountsPath = typeof accountsPath;