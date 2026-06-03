import { API_BASE_URL } from "./apiBase";

const API_URL = API_BASE_URL;

// Lấy danh sách khóa học
export const getKhoaHoc = async () => {
  const response = await fetch(`${API_URL}/KhoaHoc`);
  if (!response.ok) {
    throw new Error("Không thể tải danh sách khóa học");
  }
  return response.json();
};

// Lấy chi tiết khóa học theo ID
export const getKhoaHocById = async (id: number) => {
  const response = await fetch(`${API_URL}/KhoaHoc/${id}`);

  if (!response.ok) {
    throw new Error("Không tìm thấy khóa học");
  }

  return response.json();
};
