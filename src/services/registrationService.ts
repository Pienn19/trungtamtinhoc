import type { DangKyDTO, DangKyDetailDTO, RegisterClassRequestDTO } from '../types/KhoaHoc'
import { getAuthToken } from './authService'
import { API_BASE_URL } from './apiBase'

const API_URL = API_BASE_URL

/**
 * Feature #2: Registration Service
 * Handles student registration for classes
 */

// Register for a class
export const registerClass = async (classId: number): Promise<DangKyDTO> => {
    const token = getAuthToken()
    if (!token) {
        throw new Error('Bạn cần đăng nhập để đăng ký lớp học')
    }

    const request: RegisterClassRequestDTO = {
        idLopHoc: classId
    }

    const response = await fetch(`${API_URL}/dangky/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Lỗi khi đăng ký lớp học')
    }

    return response.json()
}

// Check schedule conflict with registered classes
export const checkScheduleConflict = async (classId: number): Promise<{ hasConflict: boolean; conflictingClasses: Array<{ idLop: number; tenLop: string; ngayBatDau?: string; ngayKetThuc?: string }> }> => {
    const token = getAuthToken()
    if (!token) {
        throw new Error('Bạn cần đăng nhập để kiểm tra trùng lịch')
    }

    const response = await fetch(`${API_URL}/schedule/check-conflict/${classId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Lỗi khi kiểm tra trùng lịch')
    }

    return response.json()
}

// Get my registrations
export const getMyRegistrations = async (): Promise<DangKyDetailDTO[]> => {
    const token = getAuthToken()
    if (!token) {
        throw new Error('Bạn cần đăng nhập')
    }

    const response = await fetch(`${API_URL}/dangky/my-registrations`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error('Lỗi khi lấy danh sách đăng ký của bạn')
    }

    const data = await response.json()
    if (!Array.isArray(data)) {
        return []
    }

    return data.map((item) => ({
        ...item,
        paymentStatus: item.paymentStatus ?? item.trangThaiThanhToan ?? 'Chưa',
    }))
}

// Get registration details
export const getRegistrationDetail = async (registrationId: number): Promise<DangKyDetailDTO> => {
    const token = getAuthToken()
    if (!token) {
        throw new Error('Bạn cần đăng nhập')
    }

    const response = await fetch(`${API_URL}/dangky/${registrationId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error('Không tìm thấy đăng ký')
    }

    return response.json()
}

// Cancel registration
export const cancelRegistration = async (registrationId: number): Promise<void> => {
    const token = getAuthToken()
    if (!token) {
        throw new Error('Bạn cần đăng nhập')
    }

    const response = await fetch(`${API_URL}/dangky/${registrationId}/cancel`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error('Lỗi khi hủy đăng ký')
    }
}
