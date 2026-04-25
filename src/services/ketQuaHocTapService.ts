import axiosClient from './axiosClient';

export const ketQuaHocTapService = {
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
    createResult: async (data: { idDangKy: number; diemChuyenCan?: number; diemThi?: number }) => {
        return await axiosClient.post('/ketquahoctap', data);
    },

    // Update result
    updateResult: async (id: number, data: { diemChuyenCan?: number; diemThi?: number }) => {
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
};
