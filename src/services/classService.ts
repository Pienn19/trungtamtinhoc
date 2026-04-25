import axiosClient from './axiosClient';

// Get all classes
export const getAllLopHoc = async () => {
    return await axiosClient.get('/lophoc');
};

// Get a specific class
export const getLopHocById = async (id: number) => {
    return await axiosClient.get(`/lophoc/${id}`);
};

// Get classes by course
export const getLopHocByCourse = async (courseId: number) => {
    return await axiosClient.get(`/lophoc/by-course/${courseId}`);
};

export const classService = {
    getAllLopHoc,
    getLopHocById,
    getLopHocByCourse,
};
