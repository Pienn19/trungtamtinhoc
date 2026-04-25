export interface KhoaHoc {
    idKhoaHoc: number;
    tenKhoaHoc: string;
    thoiLuong: number;
    hocPhi: number;
    moTa: string;
    anhDaiDien: string;
    moTaChiTiet?: string;
    doiTuong?: string;
    loTrinh?: string;
    camKet?: string;
    yeuCauDauVao?: string;
}

// ============================================
// Feature #2: Course & Registration Types
// ============================================

export interface KhoaHocDTO {
    idKhoaHoc: number
    tenKhoaHoc: string
    thoiLuong: number
    moTa: string
    hocPhi: number
    ngayBatDau: string | null
    ngayKetThuc: string | null
    trangThai: string
}

export interface KhoaHocDetailDTO extends KhoaHocDTO {
    anhDaiDien: string
    moTaChiTiet: string
    doiTuong: string
    loTrinh: string
    camKet: string
    yeuCauDauVao: string
    lopHocs: LopHocDTO[]
}

export interface LopHocDTO {
    idLop: number
    tenLop: string
    idKhoaHoc: number
    ngayBatDau: string
    ngayKetThuc: string
    siSoToiDa: number
    soHocVienDangKy: number
    soChoConLai: number
    allowDangKy: boolean
    trangThai: string
}

export interface DangKyDTO {
    idDangKy: number
    idHocVien: number
    idLopHoc: number
    ngayDangKy: string
    trangThai: string
}

export interface DangKyDetailDTO extends DangKyDTO {
    hocVienInfo: {
        idHocVien: number
        hoTen: string
        email: string
    }
    lopHocInfo: {
        idLop: number
        tenLop: string
    }
    khoaHocInfo: {
        idKhoaHoc: number
        tenKhoaHoc: string
        hocPhi: number
    }
    paymentStatus: string
}

export interface ThanhToanDTO {
    idThanhToan: number
    idDangKy: number
    soTien: number
    hinhThucThanhToan: string
    trangThaiThanhToan: string
    ngayTao: string
    ngayThanhToan?: string
    ghiChu?: string
}

export interface BienLaiDTO {
    idBienLai: number
    idThanhToan: number
    soBienLai: string
    noiDung: string
    soTien: number
    ngayLap: string
    trangThai: string
    ghiChu?: string
}

export interface ConfirmPaymentRequestDTO {
    hinhThucThanhToan: string
    ghiChu?: string
}

export interface RegisterClassRequestDTO {
    idLopHoc: number
}
