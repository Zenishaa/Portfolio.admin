import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import { toast } from "react-hot-toast";

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Send HttpOnly refresh cookie on all requests
});

// For TypeScript to recognize the _retry flag on the config object
interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// State to manage token refreshing queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;

    // Check if error is 401 (Unauthorized) and the request hasn't been retried yet
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {

      if (isRefreshing) {
        // If a refresh is already in progress, put this request in a queue to wait
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest._retry = true; // Guarantee no infinite loops for queued requests
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call the backend to refresh the token using raw axios to avoid interceptor loops.
        // The HttpOnly cookie containing the refresh token is sent automatically via withCredentials.
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || ""}/api/token/refresh`,
          {},
          { withCredentials: true }
        );

        if (response.data?.success && response.data.accessToken) {
          const newAccessToken = response.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);

          // Resolve all queued requests with the new token
          processQueue(null, newAccessToken);

          // Retry the original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error("Failed to retrieve a new token");
        }
      } catch (refreshError: any) {
        // Reject all queued requests
        processQueue(refreshError, null);

        // Only force logout if the server explicitly rejects the refresh token (401/403)
        // or if there's no response (meaning it's not a standard network timeout).
        // This prevents wiping the user's session during a temporary 500 server error.
        const status = refreshError?.response?.status;
        if (status === 401 || status === 403 || refreshError.message === "No refresh token available") {
          window.location.href = "/logout?error=Session expired";
        } else {
          toast.error("Network error while verifying session. Please check your connection.", { id: "refresh-error" });
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle rate limiting (429) — show toast with server message
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      const message =
        (error.response.data as any)?.message ||
        `Too many requests. ${retryAfter ? `Try again in ${retryAfter}s.` : "Please slow down."}`;

      toast.error(message, {
        id: "rate-limit-toast",
        duration: 5000,
      });

      error.message = message;
    }

    return Promise.reject(error);
  }
);

export default api;