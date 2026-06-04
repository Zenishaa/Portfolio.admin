import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import { toast } from "react-hot-toast";
import { API_ROUTES } from "./apiRoutes";

// ─── Axios Instance ────────────────────────────────────────────────────────────

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // Send HttpOnly refresh cookie on every request
});

// ─── Types ────────────────────────────────────────────────────────────────────

/** Extends InternalAxiosRequestConfig to carry the _retry sentinel flag. */
interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// ─── Token-Refresh Queue ──────────────────────────────────────────────────────

/**
 * Tracks whether a token refresh is already in flight.
 * Prevents multiple simultaneous refresh calls when several 401s fire at once.
 */
let isRefreshing = false;

/** Requests queued while a refresh is in progress. */
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/**
 * Drains the failed-request queue after a refresh attempt.
 * Resolves all pending promises on success, rejects them on failure.
 */
const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ─── Request Interceptor ──────────────────────────────────────────────────────

/**
 * Attaches the stored access token to every outgoing request.
 * This runs automatically — callers never need to set Authorization manually.
 */
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

// ─── Response Interceptor ─────────────────────────────────────────────────────

api.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequest | undefined;
    const status = error.response?.status;

    // ── 401: Attempt token refresh ──────────────────────────────────────────
    if (status === 401 && originalRequest && !originalRequest._retry) {

      if (isRefreshing) {
        // A refresh is already in flight — queue this request to retry after
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest._retry = true;
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use raw axios (not the intercepted instance) to avoid infinite loops.
        // The HttpOnly refresh cookie is sent automatically via withCredentials.
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL || ""}${API_ROUTES.token.refresh}`,
          {},
          { withCredentials: true }
        );

        if (response.data?.success && response.data.accessToken) {
          const newAccessToken = response.data.accessToken;
          localStorage.setItem("accessToken", newAccessToken);

          // Flush the queue with the fresh token
          processQueue(null, newAccessToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error("Failed to retrieve a new token");
        }
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);

        // Only force logout if the server explicitly rejects the refresh token (401/403).
        // A temporary 500 should NOT wipe the user's session.
        const refreshStatus = (refreshError as AxiosError)?.response?.status;
        if (
          refreshStatus === 401 ||
          refreshStatus === 403 ||
          (refreshError as Error)?.message === "No refresh token available"
        ) {
          window.location.href = "/logout?error=Session expired";
        } else {
          toast.error(
            "Network error while verifying session. Please check your connection.",
            { id: "refresh-error" }
          );
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 429: Rate limit ─────────────────────────────────────────────────────
    if (status === 429) {
      const retryAfter = error.response?.headers?.["retry-after"];
      const message =
        (error.response?.data as Record<string, string>)?.message ||
        `Too many requests. ${retryAfter ? `Try again in ${retryAfter}s.` : "Please slow down."}`;

      toast.error(message, {
        id: "rate-limit-toast",
        duration: 5000,
      });

      error.message = message;
    }

    // ── 500+: Unexpected server error ────────────────────────────────────────
    if (status && status >= 500) {
      toast.error("Server error. Please try again later.", {
        id: "server-error-toast",
        duration: 4000,
      });
    }

    return Promise.reject(error);
  }
);

export default api;