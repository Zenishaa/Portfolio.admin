import api from "@shared/lib/api";
import { API_ROUTES } from "@shared/lib/apiRoutes";

export interface ApiKey {
  id: number;
  name: string;
  api_key: string;
  status: "active" | "inactive";
  rate_limit: number;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export interface GetApiKeysResponse {
  success: boolean;
  apis: ApiKey[];
  message?: string;
}

export interface SingleApiKeyResponse {
  success: boolean;
  api: ApiKey;
  message?: string;
}

/**
 * Fetch all API keys for the authenticated user.
 */
export const getApiKeys = async (): Promise<GetApiKeysResponse> => {
  const response = await api.get(API_ROUTES.apiKeys.list);
  return response.data;
};

/**
 * Create a new API key.
 * @param name The name for the new API key
 * @param expires_at Optional expiration date in ISO format
 */
export const createApiKey = async (
  name: string,
  expires_at?: string
): Promise<SingleApiKeyResponse> => {
  const response = await api.post(API_ROUTES.apiKeys.list, {
    name,
    expires_at,
  });
  return response.data;
};

/**
 * Regenerate an existing API key. This will invalidate the old key and create a new one.
 * @param id The ID of the API key to regenerate
 */
export const regenerateApiKey = async (
  id: number
): Promise<SingleApiKeyResponse> => {
  const response = await api.put(API_ROUTES.apiKeys.regenerate(id));
  return response.data;
};

/**
 * Toggle the status of an API key between active and inactive.
 * @param id The ID of the API key to toggle
 */
export const toggleApiStatus = async (
  id: number
): Promise<SingleApiKeyResponse> => {
  const response = await api.put(API_ROUTES.apiKeys.toggle(id));
  return response.data;
};

/**
 * Permanently delete an API key.
 * @param id The ID of the API key to delete
 */
export const deleteApiKey = async (
  id: number
): Promise<{ success: boolean; message?: string }> => {
  const response = await api.delete(API_ROUTES.apiKeys.detail(id));
  return response.data;
};
