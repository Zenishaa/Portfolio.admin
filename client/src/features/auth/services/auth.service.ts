import api from "@shared/lib/api";
import { API_ROUTES } from "@shared/lib/apiRoutes";

/**
 * Calls the backend logout endpoint to invalidate the refresh token cookie.
 * Fire-and-forget — we do not await this in the Logout page so the user
 * experiences no delay. Errors are non-fatal (the local session is cleared
 * regardless by the Logout component).
 */
export const logoutUser = (): Promise<void> =>
  api
    .post(API_ROUTES.auth.logout, {}, { withCredentials: true })
    .then(() => undefined);
