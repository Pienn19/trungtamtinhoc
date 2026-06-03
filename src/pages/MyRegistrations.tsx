import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { DangKyDetailDTO } from '../types/KhoaHoc'
import { getMyRegistrations, cancelRegistration } from '../services/registrationService'
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
            navigate(`/payment/${registrationId}`)
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Lỗi khi lấy thông tin thanh toán')
        }
    }

    const paidCount = registrations.filter((reg) => (reg.paymentStatus ?? reg.trangThaiThanhToan ?? 'Chưa') !== 'Chưa').length
    const unpaidCount = registrations.length - paidCount

    if (loading) {
        return <div className="my-registrations-page"><div className="course-status">Đang tải...</div></div>
    }

    if (error) {
        return (
            <div className="my-registrations-page">
                <div className="course-error">{error}</div>
                <button className="course-action" onClick={loadRegistrations}>Thử lại</button>
            </div>
        )
    }

    return (
        <div className="my-registrations-page">
            <section className="hero-banner my-registrations-hero">
                <div>
                    <div className="muted-pill" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>Học viên / Lớp của tôi</div>
                    <h1 style={{ fontSize: 'clamp(2.1rem, 4vw, 3.6rem)', margin: '12px 0 10px', lineHeight: 1.05 }}>Các lớp học đã đăng ký</h1>
                    <p style={{ maxWidth: 720, lineHeight: 1.8, color: 'rgba(255,255,255,0.9)' }}>
                        Theo dõi tiến độ học tập, trạng thái thanh toán và lịch học của từng lớp trong một giao diện rõ ràng.
                    </p>
                    <div className="my-registrations-grid">
                        <div className="metric-card">
                            <div className="metric-value">{registrations.length}</div>
                            <div>Tổng lớp</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-value">{paidCount}</div>
                            <div>Đã thanh toán</div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-value">{unpaidCount}</div>
                            <div>Chưa thanh toán</div>
                        </div>
                    </div>
                </div>
            </section>

            {registrations.length === 0 ? (
                <div className="empty-state surface-card">
                    <p>Bạn chưa đăng ký lớp học nào</p>
                    <button onClick={() => navigate('/khoa-hoc')}>Xem Khóa Học</button>
                </div>
            ) : (
                <div className="registrations-list">
                    {registrations.map(reg => (
                        (() => {
                            const paymentStatus = reg.paymentStatus ?? reg.trangThaiThanhToan ?? 'Chưa'
                            const registrationStatus = reg.trangThai ?? 'Active'
                            return (
                                <div key={reg.idDangKy} className="registration-card">
                                    <div className="card-header">
                                        <div>
                                            <h3>{reg.lopHocInfo.tenLop}</h3>
                                            <p className="course-name">{reg.khoaHocInfo.tenKhoaHoc}</p>
                                        </div>
                                        <span className={`status ${registrationStatus.toLowerCase()}`}>
                                            {registrationStatus}
                                        </span>
                                    </div>

                                    <div className="card-content">
                                        <div className="info-row">
                                            <span className="label">Học viên:</span>
                                            <span className="value">{reg.hocVienInfo.hoTen}</span>
                                        </div>

                                        <div className="info-row">
                                            <span className="label">Giảng viên:</span>
                                            <span className="value">{reg.lopHocInfo.tenGiangVien || 'Chưa có'}</span>
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
                                            <span className="label">Lịch học:</span>
                                            <span className="value">
                                                {reg.lopHocInfo.ngayHocTrongTuan ? (
                                                    <>
                                                        {reg.lopHocInfo.ngayHocTrongTuan}
                                                        {reg.lopHocInfo.gioBatDau && reg.lopHocInfo.gioKetThuc && (
                                                            <> ({reg.lopHocInfo.gioBatDau} - {reg.lopHocInfo.gioKetThuc})</>
                                                        )}
                                                    </>
                                                ) : (
                                                    'Chưa cập nhật'
                                                )}
                                            </span>
                                        </div>

                                        <div className="info-row">
                                            <span className="label">Thời gian học:</span>
                                            <span className="value">
                                                {reg.lopHocInfo.ngayBatDau && reg.lopHocInfo.ngayKetThuc ? (
                                                    `${formatDate(reg.lopHocInfo.ngayBatDau)} đến ${formatDate(reg.lopHocInfo.ngayKetThuc)}`
                                                ) : (
                                                    'Chưa cập nhật'
                                                )}
                                            </span>
                                        </div>

                                        <div className="info-row">
                                            <span className="label">Học phí:</span>
                                            <span className="value price">{formatVND(reg.khoaHocInfo.hocPhi)}</span>
                                        </div>

                                        <div className="info-row">
                                            <span className="label">Trạng thái thanh toán:</span>
                                            <span className={`value payment-status ${paymentStatus.toLowerCase()}`}>
                                                {paymentStatus === 'Chưa' ? 'Chưa thanh toán' : 'Đã thanh toán'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="card-actions">
                                        {paymentStatus === 'Chưa' && (
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
                            )
                        })()
                    ))}
                </div>
            )}
        </div>
    )
}
