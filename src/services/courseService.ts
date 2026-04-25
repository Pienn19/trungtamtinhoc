import type { KhoaHocDTO, KhoaHocDetailDTO, LopHocDTO } from '../types/KhoaHoc'

const API_URL = 'http://localhost:5025/api'

/**
 * Feature #2: Course Service
 * Handles all course-related API calls
 */

// Get list of all active courses
export const getCourseList = async (): Promise<KhoaHocDTO[]> => {
    const response = await fetch(`${API_URL}/khoahoc`)
    if (!response.ok) {
        throw new Error('Lỗi khi lấy danh sách khóa học')
    }
    return response.json()
}

// Get course details with class list
export const getCourseDetail = async (courseId: number): Promise<KhoaHocDetailDTO> => {
    const response = await fetch(`${API_URL}/khoahoc/${courseId}`)
    if (!response.ok) {
        throw new Error('Không tìm thấy khóa học')
    }
    return response.json()
}

// Get classes for a specific course
export const getClassesByCourse = async (courseId: number): Promise<LopHocDTO[]> => {
    const response = await fetch(`${API_URL}/lophoc/by-course/${courseId}`)
    if (!response.ok) {
        throw new Error('Lỗi khi lấy danh sách lớp học')
    }
    return response.json()
}

// Get class details
export const getClassDetail = async (classId: number): Promise<LopHocDTO> => {
    const response = await fetch(`${API_URL}/lophoc/${classId}`)
    if (!response.ok) {
        throw new Error('Không tìm thấy lớp học')
    }
    return response.json()
}

// Format VND currency
export const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount)
}

// Format date
export const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN')
}
