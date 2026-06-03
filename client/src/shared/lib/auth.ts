import api from "./api";

/**
 * Validates the current session by verifying the access token with the backend.
 * 
 * Flow:
 * 1. Checks if an access token exists.
 * 2. Makes a request to /api/user/me.
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
    await api.get("/api/user/me");
    return true;
  } catch (error) {
    // If we reach here, it means both access & refresh tokens failed 
    // (or there was a network error). api.ts handles the /logout redirection.
    return false;
  }
};
