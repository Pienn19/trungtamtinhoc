const API_URL = "http://localhost:5025/api";

// Lấy danh sách khóa học
export const getKhoaHoc = async () => {
    const response = await fetch(`${API_URL}/KhoaHoc`);
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
  