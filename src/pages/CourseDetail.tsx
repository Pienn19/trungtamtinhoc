import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { KhoaHocDetailDTO, LopHocDTO } from '../types/KhoaHoc'
import { getCourseDetail, formatVND, formatDate } from '../services/courseService'
import { getCourseImageSrc } from '../utils/imageHelper'
import { normalizeUserRole } from '../utils/authHelper'
import '../styles/CourseDetail.css'

export default function CourseDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [course, setCourse] = useState<KhoaHocDetailDTO | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        void loadCourse()
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

    const handleRegister = () => {
        if (!id) {
            navigate('/dang-ky-khoa-hoc')
            return
        }

        navigate(`/dang-ky-khoa-hoc/${id}`)
    }

    if (loading) {
        return <div className="page-shell"><div className="course-status">Đang tải...</div></div>
    }

    if (error || !course) {
        return (
            <div className="page-shell">
                <div className="course-error">{error || 'Không tìm thấy khóa học'}</div>
                <button className="course-action" style={{ maxWidth: 220 }} onClick={() => navigate('/khoa-hoc')}>
                    Quay lại danh sách
                </button>
            </div>
        )
    }

    const canRegister = normalizeUserRole(localStorage.getItem('userRole')) !== 'GiangVien' && normalizeUserRole(localStorage.getItem('userRole')) !== 'Admin'

    return (
        <div className="page-shell course-detail-page">
            <section className="hero-banner course-detail-hero">
                <div className="course-detail-hero-inner">
                    <button className="course-detail-back" onClick={() => navigate('/khoa-hoc')}>
                        ← Quay lại danh sách
                    </button>
                    <div className="muted-pill" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>Chi tiết khóa học</div>
                    <h1 className="course-detail-title">{course.tenKhoaHoc}</h1>
                    <p className="course-detail-subtitle">
                        Xem thông tin chương trình, lộ trình, lớp học và lựa chọn ca phù hợp để đăng ký.
                    </p>
                </div>
            </section>

            <div className="course-detail-grid">
                <aside className="course-detail-side surface-card">
                    {course.anhDaiDien && (
                        <img src={getCourseImageSrc(course.anhDaiDien)} alt={course.tenKhoaHoc} className="course-detail-image" />
                    )}

                    <div className="course-detail-summary">
                        <div className="course-detail-summary-item">
                            <span>Học phí</span>
                            <strong>{formatVND(course.hocPhi)}</strong>
                        </div>
                        {course.ngayBatDau && (
                            <div className="course-detail-summary-item">
                                <span>Ngày bắt đầu</span>
                                <strong>{formatDate(course.ngayBatDau)}</strong>
                            </div>
                        )}
                        {course.ngayKetThuc && (
                            <div className="course-detail-summary-item">
                                <span>Ngày kết thúc</span>
                                <strong>{formatDate(course.ngayKetThuc)}</strong>
                            </div>
                        )}
                    </div>
                </aside>

                <section className="course-detail-main soft-grid">
                    <div className="surface-card course-panel">
                        <h3>Mô tả khóa học</h3>
                        <p>{course.moTa}</p>
                    </div>

                    {course.moTaChiTiet && (
                        <div className="surface-card course-panel">
                            <h3>Chi tiết</h3>
                            <p>{course.moTaChiTiet}</p>
                        </div>
                    )}

                    <div className="section-grid">
                        {course.doiTuong && (
                            <div className="surface-card course-panel">
                                <h4>Đối tượng</h4>
                                <p>{course.doiTuong}</p>
                            </div>
                        )}

                        {course.loTrinh && (
                            <div className="surface-card course-panel">
                                <h4>Lộ trình</h4>
                                <p>{course.loTrinh}</p>
                            </div>
                        )}

                        {course.camKet && (
                            <div className="surface-card course-panel">
                                <h4>Cam kết</h4>
                                <p>{course.camKet}</p>
                            </div>
                        )}

                        {course.yeuCauDauVao && (
                            <div className="surface-card course-panel">
                                <h4>Yêu cầu đầu vào</h4>
                                <p>{course.yeuCauDauVao}</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>

            <section className="course-detail-classes">
                <div className="section-head">
                    <div>
                        <div className="muted-pill">Danh sách lớp học</div>
                        <h2 className="section-title" style={{ marginTop: 10 }}>Chọn lớp phù hợp</h2>
                        <p className="section-subtitle">Mỗi lớp hiển thị sĩ số, số chỗ còn lại và trạng thái mở đăng ký.</p>
                    </div>
                </div>

                {course.lopHocs && course.lopHocs.length > 0 ? (
                    <div className="classes-grid">
                        {course.lopHocs.map((lophoc: LopHocDTO) => (
                            <div key={lophoc.idLop} className="surface-card class-card">
                                <div className="class-card-head">
                                    <h4>{lophoc.tenLop}</h4>
                                    <span className={`status ${lophoc.trangThai.toLowerCase()}`}>{lophoc.trangThai}</span>
                                </div>

                                <div className="class-info">
                                    <div className="info-row">
                                        <span className="label">Sĩ số</span>
                                        <span className="value">{lophoc.siSoToiDa} học viên</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Đã đăng ký</span>
                                        <span className="value">{lophoc.soHocVienDangKy}</span>
                                    </div>
                                    <div className="info-row">
                                        <span className="label">Còn lại</span>
                                        <span className="value">{lophoc.soChoConLai}</span>
                                    </div>
                                    {lophoc.ngayBatDau && (
                                        <div className="info-row">
                                            <span className="label">Bắt đầu</span>
                                            <span className="value">{formatDate(lophoc.ngayBatDau)}</span>
                                        </div>
                                    )}
                                </div>

                                {canRegister && (
                                    <button className="class-register-btn" onClick={handleRegister}>
                                        Đăng ký lớp
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="course-empty">Không có lớp học nào</div>
                )}
            </section>
        </div>
    )
}
