import axiosClient from "./axiosClient";
import { type LoginDTO } from "../types/Auth";
import { type RegisterDTO } from "../types/Auth";

export const login = async (data: LoginDTO) => {
  try {
    console.log("Sending login request with:", { tenDangNhap: data.tenDangNhap });
    const res = await axiosClient.post("/auth/login", data);
    console.log("Login response received:", res);
    return res.data;
  } catch (error: any) {
    console.error("Login API error:", error);
    console.error("Response status:", error.response?.status);
    console.error("Response data:", error.response?.data);
    throw error;
  }
};

export const register = async (data: RegisterDTO) => {
  const res = await axiosClient.post("/Auth/register", data)
  return res.data
}

export const changePassword = async (oldPassword: string, newPassword: string, confirmPassword: string) => {
  const res = await axiosClient.post("/auth/change-password", {
    matKhauCu: oldPassword,
    matKhauMoi: newPassword,
    xacNhanMatKhau: confirmPassword
  });
  return res.data;
};

export const logout = async () => {
  try {
    // Gọi backend để log
    await axiosClient.post("/auth/logout");
  } catch (error) {
    // Bỏ qua lỗi từ backend
    console.error("Logout error:", error);
  }

  // Xóa token khỏi localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");
};

export const getCurrentUser = () => {
  const username = localStorage.getItem("username");
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  if (!username || !userId) {
    return null;
  }

  return {
    username,
    userId: parseInt(userId, 10),
    userRole
  };
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

export const getAuthToken = () => {
  return localStorage.getItem("token");
};
