export interface LoginDTO {
    tenDangNhap: string
    matKhau: string
}

export interface LoginResponse {
    token: string
}

export interface RegisterDTO {
    tenDangNhap: string
    matKhau: string
  }