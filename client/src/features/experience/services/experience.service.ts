import api from "@shared/lib/api";
import { API_ROUTES } from "@shared/lib/apiRoutes";

/**
 * Fetch all experiences for the authenticated user.
 */
export const getExperiences = async () => {
  const response = await api.get(API_ROUTES.experience.list);
  return response.data;
};

/**
 * Fetch a single experience by slug or id.
 */
export const getExperience = async (slug: string) => {
  const response = await api.get(API_ROUTES.experience.detail(slug));
  return response.data;
};

/**
 * Create a new experience. `formData` must include all required fields.
 * Content-Type is set to multipart/form-data to support file uploads.
 */
export const createExperience = async (formData: FormData) => {
  const response = await api.post(API_ROUTES.experience.list, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Update an existing experience by slug or id.
 * Content-Type is set to multipart/form-data to support file uploads.
 */
export const updateExperience = async (slug: string, formData: FormData) => {
  const response = await api.put(API_ROUTES.experience.detail(slug), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Permanently delete an experience by slug or id.
 */
export const deleteExperience = async (slug: string) => {
  const response = await api.delete(API_ROUTES.experience.detail(slug));
  return response.data;
};
