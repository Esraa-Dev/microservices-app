
import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const BASE_URL = `${process.env.NEXT_PUBLIC_SERVER_AUTH_URI}/api`;

const authAxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<void> | null = null;

authAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | RetryConfig
      | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const pathname = new URL(
      originalRequest.url ?? "",
      `${BASE_URL}/`
    ).pathname;

    const excludedEndpoints = [
      "/login-user",
      "/register-user",
      "/signup-user",
      "/verify-user",
      "/logged-in-user",
      "/refresh-token",
    ];

    if (
      excludedEndpoints.some((endpoint) =>
        pathname.endsWith(endpoint)
      )
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post("/refresh-token")
          .then(() => undefined)
          .finally(() => {
            refreshPromise = null;
          });
      }

      await refreshPromise;

      return authAxiosInstance(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  }
);

export default authAxiosInstance;
