import axiosClient from './axiosClient';

export const ketQuaHocTapService = {
    // Get classes assigned for grade entry
    getMyClasses: async () => {
        return await axiosClient.get('/ketquahoctap/my-classes');
    },

    // Get students in a class with existing grades
    getClassStudents: async (classId: number) => {
        return await axiosClient.get(`/ketquahoctap/class/${classId}/students`);
    },

    // Get all results
    getAllResults: async () => {
        return await axiosClient.get('/ketquahoctap');
    },

    // Get result by ID
    getResultById: async (id: number) => {
        return await axiosClient.get(`/ketquahoctap/${id}`);
    },

    // Get results by class
    getResultsByClass: async (classId: number) => {
        return await axiosClient.get(`/ketquahoctap/by-class/${classId}`);
    },

    // Create new result
    createResult: async (data: { idDangKy: number; diemLyThuyet?: number; diemThucHanh?: number }) => {
        return await axiosClient.post('/ketquahoctap', data);
    },

    // Update result
    updateResult: async (id: number, data: { diemLyThuyet?: number; diemThucHanh?: number }) => {
        return await axiosClient.put(`/ketquahoctap/${id}`, data);
    },

    // Delete result
    deleteResult: async (id: number) => {
        return await axiosClient.delete(`/ketquahoctap/${id}`);
    },

    // Get class statistics
    getClassStatistics: async (classId: number) => {
        return await axiosClient.get(`/ketquahoctap/statistics/by-class/${classId}`);
    },

    // Import grades for a class (Excel workbook)
    importClassGrades: async (classId: number, file: File) => {
        const form = new FormData();
        form.append('file', file);
        return await axiosClient.post(`/giangvien/${classId}/grades/import`, form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },

    // Export grades for a class (returns CSV blob)
    exportClassGrades: async (classId: number) => {
        return await axiosClient.get(`/giangvien/${classId}/grades/export`, { responseType: 'blob' });
    },

    // Admin certificate workflow
    getCertificateCandidates: async () => {
        return await axiosClient.get('/chungchi/candidates');
    },

    approveCertificate: async (idKetQua: number) => {
        return await axiosClient.post(`/chungchi/approve/${idKetQua}`);
    },

    revokeCertificate: async (idChungChi: number) => {
        return await axiosClient.delete(`/chungchi/${idChungChi}`);
    },
};
