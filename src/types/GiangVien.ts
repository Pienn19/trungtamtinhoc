export type GiangVienDTO = {
    idGiangVien: number;
    hoTenGv: string;
    chuyenMon: string;
    dienThoaiGv: string;
    emailGv: string;
    phiGiangDay: number;
};

export type TeachingAssignmentDetailDTO = {
    idPhanCong: number;
    idLop: number;
    tenLop: string;
    idGiangVien: number;
    hoTenGv: string;
    chuyenMon: string;
    phiGiangDay: number;
    tenKhoaHoc: string;
    ngayBatDau: string;
    ngayKetThuc: string;
};

export type InstructorCostDTO = {
    idGiangVien: number;
    hoTenGv: string;
    phiGiangDay: number;
    soLopGiao: number;
    tongThiLo: number;
};

export type LichHocDTO = {
    idLichHoc: number;
    idLop: number;
    idGiangVien?: number | null;
    tenLop?: string | null;
    tenGiangVien?: string | null;
    ngay: string;
    gioBatDau?: string | null;
    gioKetThuc?: string | null;
    loai?: string | null;
    trangThai?: string | null;
    diaDiem?: string | null;
    ghiChu?: string | null;
};

export type CreateLichHocDTO = {
    idLop: number;
    idGiangVien: number;
    ngay: string;
    gioBatDau: string;
    gioKetThuc: string;
    loai?: string | null;
    trangThai?: string | null;
    diaDiem?: string | null;
    ghiChu?: string | null;
};
