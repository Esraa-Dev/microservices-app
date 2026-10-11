import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

let isRefreshing = false;

let refreshSubscribers: (() => void)[] = [];

const handleLogout = () => {
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
};

const subscribeTokenRefresh = (callback: () => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshSuccess = () => {
  refreshSubscribers.forEach((callback) => callback());
  refreshSubscribers = [];
};

const axiosInstance = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_SERVER_PRODUCT_URI}/api`,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error: AxiosError) => {
    const originalRequest =
      error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        await axiosInstance.post('/refresh-token');

        isRefreshing = false;

        onRefreshSuccess();

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];

        handleLogout();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;