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
    hoTen?: string
    email?: string
    dienThoai?: string
}

export interface CurrentUser {
    username: string
    userId: number
    userRole?: string
}

// User Management DTOs
export interface UserDTO {
    idTaiKhoan: number
    tenDangNhap: string
    hoTen: string
    email: string
    dienThoai: string
    tenVaiTro: string
    trangThai: boolean
    ngayTao: string
}

export interface CreateUserDTO {
    tenDangNhap: string
    matKhau: string
    hoTen: string
    email?: string
    dienThoai?: string
    idVaiTro?: number
}

export interface UpdateUserDTO {
    hoTen: string
    email?: string
    dienThoai?: string
    idVaiTro: number
}

export interface ToggleUserStatusDTO {
    trangThai: boolean
}

export interface ResetPasswordDTO {
    matKhauMoi: string
}