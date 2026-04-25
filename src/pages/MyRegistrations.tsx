import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DangKyDetailDTO } from '../types/KhoaHoc'
import { getMyRegistrations, cancelRegistration } from '../services/registrationService'
import { getPaymentInfo } from '../services/paymentService'
import { formatVND, formatDate } from '../services/courseService'
import '../styles/MyRegistrations.css'

export default function MyRegistrations() {
    const navigate = useNavigate()
    const [registrations, setRegistrations] = useState<DangKyDetailDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [canceling, setCanceling] = useState<number | null>(null)

    useEffect(() => {
        loadRegistrations()
    }, [])

    const loadRegistrations = async () => {
        try {
            setLoading(true)
            const data = await getMyRegistrations()
            setRegistrations(data)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async (registrationId: number) => {
        if (!confirm('Bạn có chắc muốn hủy đăng ký lớp học này?')) {
            return
        }

        try {
            setCanceling(registrationId)
            await cancelRegistration(registrationId)
            alert('Hủy đăng ký thành công')
            loadRegistrations()
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Lỗi khi hủy đăng ký')
        } finally {
            setCanceling(null)
        }
    }

    const handlePayment = async (registrationId: number) => {
        try {
            const paymentInfo = await getPaymentInfo(registrationId)
            navigate(`/payment/${paymentInfo.idThanhToan}`)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Lỗi khi lấy thông tin thanh toán')
        }
    }

    if (loading) {
        return <div className="my-registrations-container"><p>Đang tải...</p></div>
    }

    if (error) {
        return (
            <div className="my-registrations-container">
                <h1>Các Lớp Của Tôi</h1>
                <p className="error">{error}</p>
                <button onClick={loadRegistrations}>Thử lại</button>
            </div>
        )
    }

    return (
        <div className="my-registrations-container">
            <h1>Các Lớp Của Tôi</h1>

            {registrations.length === 0 ? (
                <div className="empty-state">
                    <p>Bạn chưa đăng ký lớp học nào</p>
                    <button onClick={() => navigate('/courses')}>Xem Khóa Học</button>
                </div>
            ) : (
                <div className="registrations-list">
                    {registrations.map(reg => (
                        <div key={reg.idDangKy} className="registration-card">
                            <div className="card-header">
                                <div>
                                    <h3>{reg.lopHocInfo.tenLop}</h3>
                                    <p className="course-name">{reg.khoaHocInfo.tenKhoaHoc}</p>
                                </div>
                                <span className={`status ${reg.trangThai.toLowerCase()}`}>
                                    {reg.trangThai}
                                </span>
                            </div>

                            <div className="card-content">
                                <div className="info-row">
                                    <span className="label">Học viên:</span>
                                    <span className="value">{reg.hocVienInfo.hoTen}</span>
                                </div>

                                <div className="info-row">
                                    <span className="label">Email:</span>
                                    <span className="value">{reg.hocVienInfo.email}</span>
                                </div>

                                <div className="info-row">
                                    <span className="label">Ngày đăng ký:</span>
                                    <span className="value">{formatDate(reg.ngayDangKy)}</span>
                                </div>

                                <div className="info-row">
                                    <span className="label">Học phí:</span>
                                    <span className="value price">{formatVND(reg.khoaHocInfo.hocPhi)}</span>
                                </div>

                                <div className="info-row">
                                    <span className="label">Trạng thái thanh toán:</span>
                                    <span className={`value payment-status ${reg.paymentStatus.toLowerCase()}`}>
                                        {reg.paymentStatus === 'Chưa' ? 'Chưa thanh toán' : 'Đã thanh toán'}
                                    </span>
                                </div>
                            </div>

                            <div className="card-actions">
                                {reg.paymentStatus === 'Chưa' && (
                                    <button
                                        className="btn-pay"
                                        onClick={() => handlePayment(reg.idDangKy)}
                                    >
                                        Thanh Toán
                                    </button>
                                )}

                                <button
                                    className="btn-cancel"
                                    onClick={() => handleCancel(reg.idDangKy)}
                                    disabled={canceling === reg.idDangKy}
                                >
                                    {canceling === reg.idDangKy ? 'Đang hủy...' : 'Hủy Đăng Ký'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
