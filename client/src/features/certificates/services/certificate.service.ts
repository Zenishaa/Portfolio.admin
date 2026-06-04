import api from "@shared/lib/api";
import { API_ROUTES } from "@shared/lib/apiRoutes";

/**
 * Fetch all certificates for the authenticated user.
 */
export const getCertificates = async () => {
  const response = await api.get(API_ROUTES.certificates.list);
  return response.data;
};

/**
 * Fetch a single certificate by slug or id.
 */
export const getCertificate = async (slug: string) => {
  const response = await api.get(API_ROUTES.certificates.detail(slug));
  return response.data;
};

/**
 * Create a new certificate. `formData` must include all required fields.
 * Content-Type is set to multipart/form-data to support file uploads.
 */
export const createCertificate = async (formData: FormData) => {
  const response = await api.post(API_ROUTES.certificates.list, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Update an existing certificate by slug or id.
 * Content-Type is set to multipart/form-data to support file uploads.
 */
export const updateCertificate = async (slug: string, formData: FormData) => {
  const response = await api.put(
    API_ROUTES.certificates.detail(slug),
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return response.data;
};

/**
 * Permanently delete a certificate by slug or id.
 */
export const deleteCertificate = async (slug: string) => {
  const response = await api.delete(API_ROUTES.certificates.detail(slug));
  return response.data;
};
