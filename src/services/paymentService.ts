import type { ThanhToanDTO, BienLaiDTO, ConfirmPaymentRequestDTO } from '../types/KhoaHoc'
import { getAuthToken } from './authService'

const API_URL = 'http://localhost:5025/api'

/**
 * Feature #2: Payment Service
 * Handles payment confirmation and receipt management
 */

// Get payment info for a registration
export const getPaymentInfo = async (registrationId: number): Promise<ThanhToanDTO> => {
    const token = getAuthToken()
    if (!token) {
        throw new Error('Bạn cần đăng nhập')
    }

    const response = await fetch(`${API_URL}/thanhtoan/${registrationId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error('Không tìm thấy thông tin thanh toán')
    }

    return response.json()
}

// Confirm payment and generate receipt
export const confirmPayment = async (
    registrationId: number,
    paymentMethod: string,
    notes?: string
): Promise<{ payment: ThanhToanDTO; receipt: BienLaiDTO }> => {
    const token = getAuthToken()
    if (!token) {
        throw new Error('Bạn cần đăng nhập')
    }

    const request: ConfirmPaymentRequestDTO = {
        hinhThucThanhToan: paymentMethod,
        ghiChu: notes
    }

    const response = await fetch(`${API_URL}/thanhtoan/${registrationId}/confirm-payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Lỗi khi xác nhận thanh toán')
    }

    return response.json()
}

// Get receipt details
export const getReceipt = async (receiptId: number): Promise<BienLaiDTO> => {
    const token = getAuthToken()
    if (!token) {
        throw new Error('Bạn cần đăng nhập')
    }

    const response = await fetch(`${API_URL}/thanhtoan/bienlai/${receiptId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error('Không tìm thấy biên lai')
    }

    return response.json()
}

// Format payment status
export const getPaymentStatusLabel = (status: string): string => {
    const statusMap: { [key: string]: string } = {
        'Chưa': 'Chưa thanh toán',
        'Đã': 'Đã thanh toán',
        'Hoàn': 'Đã hoàn tiền'
    }
    return statusMap[status] || status
}

// Format payment method
export const getPaymentMethodLabel = (method: string): string => {
    const methodMap: { [key: string]: string } = {
        'Manual': 'Thanh toán trực tiếp',
        'Online': 'Thanh toán online',
        'Transfer': 'Chuyển khoản'
    }
    return methodMap[method] || method
}
