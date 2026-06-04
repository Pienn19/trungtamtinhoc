import axios from "axios";

const axiosClient = axios.create({
  baseURL: "/api",
});

// Interceptor: tự động gắn JWT vào header
axiosClient.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers['Cache-Control'] = 'no-cache';
    config.headers['Pragma'] = 'no-cache';
    config.headers['Expires'] = '0';

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//xử lý lỗi 401 Unauthorized: nếu token hết hạn hoặc không hợp lệ, tự động đăng xuất người dùng
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/login');

    if (error.response?.status === 401 && !isAuthRequest) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("userRole");

      if (window.location.pathname !== '/dang-nhap') {
        window.location.href = "/dang-nhap";
      }
    }

    return Promise.reject(error);
  }
);
export default axiosClient;