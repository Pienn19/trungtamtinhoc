import axiosClient from './axiosClient';

export async function getMyExamSchedules() {
    const res = await axiosClient.get('/lichthi/my');
    return res.data;
}

export async function registerForExam(scheduleId: number) {
    const res = await axiosClient.post(`/ketquathi/register/${scheduleId}`);
    return res.data;
}

export async function getMyGrades() {
    const res = await axiosClient.get('/ketquathi/my');
    return res.data;
}

export async function getMyLearningResults() {
    const res = await axiosClient.get('/ketquahoctap/my');
    return res.data;
}

// Admin functions
export async function getExamSchedules() {
    const res = await axiosClient.get('/lichthi');
    return res.data;
}

export async function getExamScheduleById(id: number) {
    const res = await axiosClient.get(`/lichthi/${id}`);
    return res.data;
}

export async function createExamSchedule(data: { idLop: number; idPhong: number; ngayThi: string }) {
    const res = await axiosClient.post('/lichthi', data);
    return res.data;
}

export async function updateExamSchedule(id: number, data: { idLop: number; idPhong: number; ngayThi: string }) {
    const res = await axiosClient.put(`/lichthi/${id}`, data);
    return res.data;
}

export async function deleteExamSchedule(id: number) {
    const res = await axiosClient.delete(`/lichthi/${id}`);
    return res.data;
}
