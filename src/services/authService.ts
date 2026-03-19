import axiosClient from "./axiosClient";
import { type LoginDTO } from "../types/Auth";
import { type RegisterDTO } from "../types/Auth";

export const login = async (data: LoginDTO) => {

  const res = await axiosClient.post("/auth/login", data);

  return res.data;
};

export const register = async (data: RegisterDTO) => {
  const res = await axiosClient.post("/Auth/register", data)
  return res.data
}