import api from "@shared/lib/api";
import { API_ROUTES } from "@shared/lib/apiRoutes";

/**
 * Fetch all projects for the authenticated user.
 */
export const getProjects = async () => {
  const response = await api.get(API_ROUTES.projects.list);
  return response.data;
};

/**
 * Fetch a single project by slug or id.
 */
export const getProject = async (slug: string) => {
  const response = await api.get(API_ROUTES.projects.detail(slug));
  return response.data;
};

/**
 * Create a new project. `formData` must include all required fields.
 * Content-Type is set to multipart/form-data to support file uploads.
 */
export const createProject = async (formData: FormData) => {
  const response = await api.post(API_ROUTES.projects.list, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Update an existing project by slug or id.
 * Content-Type is set to multipart/form-data to support file uploads.
 */
export const updateProject = async (slug: string, formData: FormData) => {
  const response = await api.put(API_ROUTES.projects.detail(slug), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Permanently delete a project by slug or id.
 */
export const deleteProject = async (slug: string) => {
  const response = await api.delete(API_ROUTES.projects.detail(slug));
  return response.data;
};
