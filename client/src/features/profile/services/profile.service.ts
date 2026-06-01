import api from "@shared/lib/api";

export interface UserProfile {
  id: number;
  name: string;
  username: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  users_links: Record<string, string> | null;
  skills: string[] | null;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
}

export const getProfile = async () => {
  try {
    const response = await api.get("/api/user/me");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching profile", error);
    return null;
  }
};

export const updateProfile = async (formData: FormData) => {
  try {
    const response = await api.put("/api/user/me", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error updating profile", error);
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    return null;
  }
};
