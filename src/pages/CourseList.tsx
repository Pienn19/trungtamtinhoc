import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { KhoaHocDTO } from '../types/KhoaHoc'
import { getCourseList, formatVND, formatDate } from '../services/courseService'
import '../styles/CourseList.css'

export default function CourseList() {
    const [courses, setCourses] = useState<KhoaHocDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        loadCourses()
    }, [])

    const loadCourses = async () => {
        try {
            setLoading(true)
            const data = await getCourseList()
            setCourses(data)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi không xác định')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="course-page"><div className="course-shell"><p className="course-status">Đang tải...</p></div></div>
    }

    if (error) {
        return (
            <div className="course-page">
                <div className="course-shell">
                    <p className="course-error">{error}</p>
                    <button className="course-action" onClick={loadCourses}>Thử lại</button>
                </div>
            </div>
        )
    }

    return (
        <div className="course-page">
            <section className="course-hero hero-banner">
                <div className="course-shell course-hero-grid">
                    <div>
                        <div className="muted-pill" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>Chương trình đào tạo</div>
                        <h1 className="course-hero-title">Danh sách khóa học</h1>
                        <p className="course-hero-text">Các khóa học thực hành được sắp xếp rõ ràng theo chương trình, thời lượng và học phí.</p>
                    </div>
                    <div className="course-hero-panel">
                        <div className="course-hero-box">
                            <span>Khóa học</span>
                            <strong>{courses.length}</strong>
                        </div>
                        <div className="course-hero-box">
                            <span>Định hướng</span>
                            <strong>Thực hành - Ứng dụng</strong>
                        </div>
                    </div>
                </div>
            </section>

            <div className="course-shell">
                <div className="course-section-head">
                    <div>
                        <div className="muted-pill">Khám phá</div>
                        <h2 className="section-title" style={{ marginTop: 10 }}>Chọn khóa học phù hợp với mục tiêu của bạn</h2>
                        <p className="section-subtitle">Mỗi khóa học đều có mô tả, học phí và thông tin lớp học rõ ràng.</p>
                    </div>
                </div>

                {courses.length === 0 ? (
                    <div className="course-empty surface-card">Không có khóa học nào</div>
                ) : (
                    <div className="course-grid">
                        {courses.map(course => (
                            <div key={course.idKhoaHoc} className="course-card surface-card">
                                <div className="course-header">
                                    <h3>{course.tenKhoaHoc}</h3>
                                    <span className={`status ${course.trangThai.toLowerCase()}`}>
                                        {course.trangThai}
                                    </span>
                                </div>

                                <p className="course-description">{course.moTa}</p>

                                <div className="course-info">
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

                                <div style={{ display: 'grid', gap: 10 }}>
                                    <button className="btn-view-detail" onClick={() => navigate('/dang-ky-khoa-hoc')}>
                                        Đăng ký lớp
                                    </button>
                                    <button className="btn-view-detail secondary" onClick={() => navigate(`/khoa-hoc/${course.idKhoaHoc}`)}>
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
