import api from "./api";
import { API_ROUTES } from "./apiRoutes";

/**
 * Validates the current session by verifying the access token with the backend.
 *
 * Flow:
 * 1. Checks if an access token exists in localStorage.
 * 2. Makes a GET request to /api/user/me.
 * 3. If the access token is expired, the Axios interceptor in api.ts will
 *    automatically attempt to use the refresh token to get a new access token.
 * 4. If the refresh token is also expired or invalid, api.ts will redirect
 *    the user to the global /logout route.
 *
 * @returns {Promise<boolean>} True if the session is valid (or successfully refreshed).
 */
export const verifySession = async (): Promise<boolean> => {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    return false;
  }

  try {
    await api.get(API_ROUTES.user.me);
    return true;
  } catch {
    // Both access and refresh tokens failed (or a network error occurred).
    // api.ts handles the /logout redirection in the 401/403 case.
    return false;
  }
};
