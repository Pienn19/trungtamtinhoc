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
