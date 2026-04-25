import axiosClient from './axiosClient';
import type { GiangVienDTO } from '../types/GiangVien';

// Instructor Management
export const giangVienService = {
    // Get all instructors
    getAllGiangVien: async () => {
        return await axiosClient.get('/giangvien');
    },

    // Get instructor by ID
    getGiangVienById: async (id: number) => {
        return await axiosClient.get(`/giangvien/${id}`);
    },

    // Create new instructor
    createGiangVien: async (data: Omit<GiangVienDTO, 'idGiangVien'>) => {
        return await axiosClient.post('/giangvien', data);
    },

    // Update instructor
    updateGiangVien: async (id: number, data: Partial<GiangVienDTO>) => {
        return await axiosClient.put(`/giangvien/${id}`, data);
    },

    // Delete instructor
    deleteGiangVien: async (id: number) => {
        return await axiosClient.delete(`/giangvien/${id}`);
    },
};

// Teaching Assignment Management
export const teachingAssignmentService = {
    // Get all teaching assignments
    getAllAssignments: async () => {
        return await axiosClient.get('/giangvien/phan-cong/list');
    },

    // Get assignment by ID
    getAssignmentById: async (id: number) => {
        return await axiosClient.get(`/giangvien/phan-cong/${id}`);
    },

    // Create teaching assignment
    createAssignment: async (data: { idLop: number; idGiangVien: number }) => {
        return await axiosClient.post('/giangvien/phan-cong', data);
    },

    // Delete assignment
    deleteAssignment: async (id: number) => {
        return await axiosClient.delete(`/giangvien/phan-cong/${id}`);
    },

    // Calculate instructor costs
    calculateInstructorCosts: async () => {
        return await axiosClient.get('/giangvien/chi-phi/tinh-theo-giang-vien');
    },
};
