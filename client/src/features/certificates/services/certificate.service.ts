import api from "@shared/lib/api";

export const createCertificate = async (formData: FormData) => {
  const response = await api.post("/api/certificates", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const getCertificate = async (slug: string) => {
  const response = await api.get(`/api/certificates/${slug}`);

  return response.data;
};

export const updateCertificate = async (
  slug: string,
  formData: FormData
) => {
  const response = await api.put(`/api/certificates/${slug}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const deleteCertificate = async (slug: string) => {
  const response = await api.delete(`/api/certificates/${slug}`);

  return response.data;
};
