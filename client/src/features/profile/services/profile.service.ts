import api from "@shared/lib/api";
import { API_ROUTES } from "@shared/lib/apiRoutes";

export interface UserProfile {
  id: number;
  name: string;
  username: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  headline: string | null;

  users_links: Record<string, string> | null;
  skills: string[] | null;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
}

/**
 * Fetch the authenticated user's profile.
 *
 * Errors are intentionally NOT caught here so they bubble up to the
 * global Axios interceptor in api.ts, which handles token refresh and
 * session expiry automatically.
 */
export const getProfile = async () => {
  const response = await api.get(API_ROUTES.user.me);
  return response.data;
};

/**
 * Update the authenticated user's profile.
 * `formData` should include any changed fields (name, bio, skills, avatar, etc.).
 *
 * Errors bubble up to the caller so the UI can display proper error messages.
 */
export const updateProfile = async (formData: FormData) => {
  const response = await api.put(API_ROUTES.user.me, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
