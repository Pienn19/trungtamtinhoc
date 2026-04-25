import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { KhoaHocDetailDTO, LopHocDTO } from '../types/KhoaHoc'
import { getCourseDetail, formatVND, formatDate } from '../services/courseService'
import { registerClass } from '../services/registrationService'
import { isAuthenticated } from '../services/authService'
import '../styles/CourseDetail.css'

export default function CourseDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [course, setCourse] = useState<KhoaHocDetailDTO | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [registering, setRegistering] = useState<number | null>(null)

    useEffect(() => {
        loadCourse()
    }, [id])

    const loadCourse = async () => {
        try {
            setLoading(true)
            if (!id) throw new Error('Không tìm thấy ID khóa học')
            const data = await getCourseDetail(parseInt(id))
            setCourse(data)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (classId: number) => {
        if (!isAuthenticated()) {
            navigate('/login')
            return
        }

        try {
            setRegistering(classId)
            await registerClass(classId)
            alert('Đăng ký lớp học thành công! Vui lòng thanh toán học phí.')
            navigate('/my-registrations')
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Lỗi khi đăng ký')
        } finally {
            setRegistering(null)
        }
    }

    if (loading) {
        return <div className="course-detail-container"><p>Đang tải...</p></div>
    }

    if (error || !course) {
        return (
            <div className="course-detail-container">
                <p className="error">{error || 'Không tìm thấy khóa học'}</p>
                <button onClick={() => navigate('/courses')}>Quay Lại</button>
            </div>
        )
    }

    return (
        <div className="course-detail-container">
            <button className="btn-back" onClick={() => navigate('/courses')}>
                ← Quay Lại
            </button>

            <div className="course-header">
                <h1>{course.tenKhoaHoc}</h1>
                <span className={`status ${course.trangThai.toLowerCase()}`}>
                    {course.trangThai}
                </span>
            </div>

            <div className="course-content">
                <div className="left-section">
                    {course.anhDaiDien && (
                        <img src={course.anhDaiDien} alt={course.tenKhoaHoc} className="course-image" />
                    )}

                    <div className="course-info">
                        <h3>Thông Tin Khóa Học</h3>
                        <div className="info-row">
                            <span className="label">Học phí:</span>
                            <span className="value price">{formatVND(course.hocPhi)}</span>
                        </div>

                        {course.ngayBatDau && (
                            <div className="info-row">
                                <span className="label">Ngày bắt đầu:</span>
                                <span className="value">{formatDate(course.ngayBatDau)}</span>
                            </div>
                        )}

                        {course.ngayKetThuc && (
                            <div className="info-row">
                                <span className="label">Ngày kết thúc:</span>
                                <span className="value">{formatDate(course.ngayKetThuc)}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="right-section">
                    <div className="description">
                        <h3>Mô Tả</h3>
                        <p>{course.moTa}</p>
                    </div>

                    {course.moTaChiTiet && (
                        <div className="detailed-description">
                            <h3>Chi Tiết</h3>
                            <p>{course.moTaChiTiet}</p>
                        </div>
                    )}

                    {course.doiTuong && (
                        <div className="info-section">
                            <h4>Đối Tượng Học Viên</h4>
                            <p>{course.doiTuong}</p>
                        </div>
                    )}

                    {course.loTrinh && (
                        <div className="info-section">
                            <h4>Lộ Trình</h4>
                            <p>{course.loTrinh}</p>
                        </div>
                    )}

                    {course.camKet && (
                        <div className="info-section">
                            <h4>Cam Kết</h4>
                            <p>{course.camKet}</p>
                        </div>
                    )}

                    {course.yeuCauDauVao && (
                        <div className="info-section">
                            <h4>Yêu Cầu Đầu Vào</h4>
                            <p>{course.yeuCauDauVao}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="classes-section">
                <h2>Danh Sách Lớp Học</h2>

                {course.lopHocs && course.lopHocs.length > 0 ? (
                    <div className="classes-grid">
                        {course.lopHocs.map((lophoc: LopHocDTO) => (
                            <div key={lophoc.idLop} className="class-card">
                                <h4>{lophoc.tenLop}</h4>

                                <div className="class-info">
                                    <div className="info-row">
                                        <span className="label">Sỹ số:</span>
                                        <span className="value">{lophoc.siSoToiDa} học viên</span>
                                    </div>

                                    <div className="info-row">
                                        <span className="label">Đã đăng ký:</span>
                                        <span className="value">{lophoc.soHocVienDangKy}</span>
                                    </div>

                                    <div className="info-row">
                                        <span className="label">Còn lại:</span>
                                        <span className="value">{lophoc.soChoConLai}</span>
                                    </div>

                                    <div className="info-row">
                                        <span className="label">Trạng thái:</span>
                                        <span className={`value status ${lophoc.trangThai.toLowerCase()}`}>
                                            {lophoc.trangThai}
                                        </span>
                                    </div>

                                    {lophoc.ngayBatDau && (
                                        <div className="info-row">
                                            <span className="label">Bắt đầu:</span>
                                            <span className="value">{formatDate(lophoc.ngayBatDau)}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    className={`btn-register ${!lophoc.allowDangKy || lophoc.soChoConLai === 0 ? 'disabled' : ''}`}
                                    onClick={() => handleRegister(lophoc.idLop)}
                                    disabled={!lophoc.allowDangKy || lophoc.soChoConLai === 0 || registering === lophoc.idLop}
                                >
                                    {registering === lophoc.idLop ? 'Đang đăng ký...' : 'Đăng Ký'}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Không có lớp học nào</p>
                )}
            </div>
        </div>
    )
}
