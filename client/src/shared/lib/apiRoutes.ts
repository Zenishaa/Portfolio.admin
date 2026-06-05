/**
 * Centralized API route constants.
 *
 * Every endpoint used by the client is defined here.
 * Never use raw string literals for API paths in service files or components.
 */
export const API_ROUTES = {
  auth: {
    /** POST — GitHub OAuth login redirect (opens in window) */
    github: "/api/auth/github",
    /** POST — Invalidate the current session / refresh token */
    logout: "/api/auth/logout",
  },

  token: {
    /** POST — Exchange HttpOnly refresh cookie for a new access token */
    refresh: "/api/token/refresh",
  },

  user: {
    /** GET | PUT — Authenticated user profile */
    me: "/api/user/me",
  },

  projects: {
    /** GET — List all projects for the authenticated user */
    list: "/api/projects",
    /** GET | PUT | DELETE — Single project by slug or id */
    detail: (slug: string | number) => `/api/projects/${slug}`,
  },

  experience: {
    /** GET — List all experiences for the authenticated user, POST — Create a new experience */
    list: "/api/experience",
    /** GET | PUT | DELETE — Single experience by slug or id */
    detail: (slug: string | number) => `/api/experience/${slug}`,
  },

  certificates: {
    /** GET — List all certificates for the authenticated user */
    list: "/api/certificates",
    /** GET | PUT | DELETE — Single certificate by slug or id */
    detail: (slug: string | number) => `/api/certificates/${slug}`,
  },

  apiKeys: {
    /** GET — List all API keys for the authenticated user, POST — Create a new API key */
    list: "/api/keys",
    /** PUT — Regenerate an existing API key */
    regenerate: (id: string | number) => `/api/keys/regenerate/${id}`,
    /** PUT — Toggle the active status of an API key */
    toggle: (id: string | number) => `/api/keys/toggle/${id}`,
    /** DELETE — Permanently delete an API key */
    detail: (id: string | number) => `/api/keys/${id}`,
  },
} as const;
