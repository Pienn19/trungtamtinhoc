export type KetQuaHocTapDTO = {
    idKetQua: number;
    idDangKy: number;
    diemChuyenCan: number | null;
    diemThi: number | null;
    ketLuan: string;
    ngayCapNhat: string;
};

export type KetQuaHocTapDetailDTO = {
    idKetQua: number;
    idDangKy: number;
    hocVienName: string;
    courseeName: string;
    className: string;
    diemChuyenCan: number | null;
    diemThi: number | null;
    diemTrungBinh: number | null;
    ketLuan: string;
    trangThaiHoc: string;
    ngayCapNhat: string;
};

export type GradeStatisticsDTO = {
    totalStudents: number;
    passed: number;
    failed: number;
    passRate: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
};

export type TeacherClassDTO = {
    idLop: number;
    tenLop?: string | null;
    idKhoaHoc?: number | null;
    tenKhoaHoc?: string | null;
    idGiangVien: number;
    tenGiangVien?: string | null;
};

export type ClassStudentResultDTO = {
    idDangKy: number;
    idHocVien: number;
    hoTenHocVien?: string | null;
    emailHocVien?: string | null;
    idLop: number;
    tenLop?: string | null;
    idKetQua?: number | null;
    diemChuyenCan?: number | null;
    diemThi?: number | null;
    diemTrungBinh?: number | null;
    ketLuan?: string | null;
};

export type CertificateCandidateDTO = {
    idKetQua: number;
    idDangKy: number;
    idHocVien: number;
    hoTenHocVien?: string | null;
    idKhoaHoc: number;
    tenKhoaHoc?: string | null;
    idLop: number;
    tenLop?: string | null;
    diemTrungBinh?: number | null;
    ketLuan?: string | null;
    duDieuKienCap: boolean;
    daCoChungChi: boolean;
    idChungChi?: number | null;
    ngayCap?: string | null;
};
