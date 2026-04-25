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
