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
        return <div className="course-list-container"><p>Đang tải...</p></div>
    }

    if (error) {
        return (
            <div className="course-list-container">
                <p className="error">{error}</p>
                <button onClick={loadCourses}>Thử lại</button>
            </div>
        )
    }

    return (
        <div className="course-list-container">
            <h1>Danh Sách Khóa Học</h1>

            {courses.length === 0 ? (
                <p>Không có khóa học nào</p>
            ) : (
                <div className="course-grid">
                    {courses.map(course => (
                        <div key={course.idKhoaHoc} className="course-card">
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

                            <button
                                className="btn-view-detail"
                                onClick={() => navigate(`/courses/${course.idKhoaHoc}`)}
                            >
                                Xem Chi Tiết
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
