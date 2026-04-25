import type { DangKyDTO, DangKyDetailDTO, RegisterClassRequestDTO } from '../types/KhoaHoc'
import { getAuthToken } from './authService'

const API_URL = 'http://localhost:5025/api'

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

    return response.json()
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
