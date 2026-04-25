import axiosClient from "./axiosClient";
import type { UserDTO, CreateUserDTO, UpdateUserDTO } from "../types/Auth";

export const getAllUsers = async (): Promise<UserDTO[]> => {
    const res = await axiosClient.get("/admin/users");
    return res.data;
};

export const getUserById = async (userId: number): Promise<UserDTO> => {
    const res = await axiosClient.get(`/admin/users/${userId}`);
    return res.data;
};

export const createUser = async (data: CreateUserDTO): Promise<{ message: string; userId: number }> => {
    const res = await axiosClient.post("/admin/users", data);
    return res.data;
};

export const updateUser = async (userId: number, data: UpdateUserDTO): Promise<{ message: string }> => {
    const res = await axiosClient.put(`/admin/users/${userId}`, data);
    return res.data;
};

export const toggleUserStatus = async (userId: number, status: boolean): Promise<{ message: string }> => {
    const res = await axiosClient.put(`/admin/users/${userId}/toggle-status`, {
        trangThai: status
    });
    return res.data;
};

export const resetUserPassword = async (userId: number, newPassword: string): Promise<{ message: string }> => {
    const res = await axiosClient.put(`/admin/users/${userId}/reset-password`, {
        matKhauMoi: newPassword
    });
    return res.data;
};
