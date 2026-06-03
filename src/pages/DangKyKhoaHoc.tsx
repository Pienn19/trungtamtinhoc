import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { formatDate, formatVND, getCourseDetail, getCourseList } from '../services/courseService'
import { registerClass, checkScheduleConflict } from '../services/registrationService'
import { toast } from 'react-toastify'
import { isAuthenticated } from '../services/authService'
import type { KhoaHocDTO, KhoaHocDetailDTO, LopHocDTO } from '../types/KhoaHoc'
import '../styles/DangKyKhoaHoc.css'

export default function DangKyKhoaHoc() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [courses, setCourses] = useState<KhoaHocDTO[]>([])
  const [course, setCourse] = useState<KhoaHocDetailDTO | null>(null)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [selectedLop, setSelectedLop] = useState<number | null>(null)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingCourse, setLoadingCourse] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingConflict, setCheckingConflict] = useState(false)
  const [shouldCheckConflict, setShouldCheckConflict] = useState(false)
  const [conflictData, setConflictData] = useState<{ hasConflict: boolean; conflictingClasses: Array<{ idLop: number; tenLop: string; ngayBatDau?: string; ngayKetThuc?: string }> } | null>(null)

  const selectedClass: LopHocDTO | null = course?.lopHocs.find((lop) => lop.idLop === selectedLop) ?? null
  const selectedCourse = courses.find((khoaHoc) => khoaHoc.idKhoaHoc === selectedCourseId) ?? null

  useEffect(() => {
    void loadCourses()
  }, [])

  useEffect(() => {
    if (!id) {
      setSelectedCourseId(null)
      return
    }

    const parsedId = Number(id)
    if (!Number.isNaN(parsedId)) {
      setSelectedCourseId(parsedId)
    }
  }, [id])

  useEffect(() => {
    if (selectedCourseId === null) {
      setCourse(null)
      setSelectedLop(null)
      return
    }

    void loadCourse(selectedCourseId)
  }, [selectedCourseId])

  useEffect(() => {
    if (shouldCheckConflict && selectedLop && isAuthenticated()) {
      void checkConflictAsync()
    }
  }, [shouldCheckConflict, selectedLop])

  const loadCourses = async () => {
    try {
      setLoadingCourses(true)
      const data = await getCourseList()
      setCourses(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoadingCourses(false)
    }
  }

  const loadCourse = async (courseId: number) => {
    try {
      setLoadingCourse(true)
      const data = await getCourseDetail(courseId)
      setCourse(data)
      setSelectedLop(data.lopHocs.find((lop) => lop.allowDangKy && lop.soChoConLai > 0)?.idLop ?? data.lopHocs[0]?.idLop ?? null)
      setError(null)
    } catch (err) {
      setCourse(null)
      setSelectedLop(null)
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoadingCourse(false)
    }
  }

  const checkConflictAsync = async () => {
    if (!selectedLop) return

    try {
      setCheckingConflict(true)
      const result = await checkScheduleConflict(selectedLop)
      setConflictData(result)
    } catch (err) {
      console.error('Error checking conflict:', err)
      setConflictData(null)
    } finally {
      setCheckingConflict(false)
    }
  }

  const handleDangKy = async () => {
    if (!selectedLop) return

    if (!isAuthenticated()) {
      navigate('/dang-nhap')
      return
    }

    try {
      setRegistering(true)
      const response = await registerClass(selectedLop)
      const registrationId = response.idDangKy ?? (response as any).registrationId ?? (response as any).paymentId
      toast.success('Đăng ký lớp học thành công! Vui lòng thanh toán học phí.')

      if (registrationId) {
        navigate(`/payment/${registrationId}`)
        return
      }

      navigate('/lop-cua-toi')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi đăng ký'
      toast.error(msg)
    } finally {
      setRegistering(false)
    }
  }

  const handleCourseChange = (value: string) => {
    const courseId = Number(value)
    setSelectedCourseId(Number.isNaN(courseId) ? null : courseId)
  }

  const openClasses = course?.lopHocs.filter((lop) => lop.allowDangKy && lop.soChoConLai > 0).length ?? 0

  if (loadingCourses) {
    return <div className="page-shell"><div className="course-status">Đang tải danh sách khóa học...</div></div>
  }

  if (error && courses.length === 0) {
    return (
      <div className="page-shell">
        <div className="course-error">{error}</div>
        <button className="course-action" onClick={() => navigate('/khoa-hoc')}>
          Quay lại danh sách khóa học
        </button>
      </div>
    )
  }

  return (
    <div className="page-shell registration-page">
      <section className="hero-banner registration-hero">
        <div className="registration-hero-copy">
          <button className="registration-back" onClick={() => navigate('/khoa-hoc')}>
            ← Quay lại danh sách khóa học
          </button>
          <div className="muted-pill" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>Đăng ký lớp học</div>
          <h1 className="registration-title">Chọn môn trước, chọn lớp sau</h1>
          <p className="registration-subtitle">Luồng đăng ký được tách rõ ràng để bạn dễ xem học phí, lịch học và số chỗ còn lại trước khi xác nhận.</p>
        </div>

        <div className="registration-hero-stats">
          <div className="registration-stat">
            <div className="registration-stat-value">{courses.length}</div>
            <div className="registration-stat-label">Khóa học</div>
          </div>
          <div className="registration-stat">
            <div className="registration-stat-value">{course ? course.lopHocs.length : 0}</div>
            <div className="registration-stat-label">Lớp của môn chọn</div>
          </div>
          <div className="registration-stat">
            <div className="registration-stat-value">{openClasses}</div>
            <div className="registration-stat-label">Lớp còn chỗ</div>
          </div>
        </div>
      </section>

      <div className="registration-grid">
        <aside className="registration-sidebar">
          <div className="surface-card registration-panel">
            <h2>Bước 1. Chọn môn</h2>
            <select className="auth-input registration-select" value={selectedCourseId ?? ''} onChange={(event) => handleCourseChange(event.target.value)}>
              <option value="">-- Chọn một khóa học --</option>
              {courses.map((khoaHoc) => (
                <option key={khoaHoc.idKhoaHoc} value={khoaHoc.idKhoaHoc}>
                  {khoaHoc.tenKhoaHoc}
                </option>
              ))}
            </select>

            {selectedCourse && (
              <div className="registration-course-summary">
                <strong>{selectedCourse.tenKhoaHoc}</strong>
                <span className="registration-price">{formatVND(selectedCourse.hocPhi)}</span>
                <span className="registration-status">{selectedCourse.trangThai}</span>
              </div>
            )}
          </div>

          <div className="surface-card registration-panel">
            <h2>Khóa học đang chọn</h2>
            <div className="registration-description">
              {selectedCourseId === null
                ? 'Hãy chọn một môn để hệ thống hiển thị các lớp tương ứng.'
                : loadingCourse
                  ? 'Đang tải lớp học của môn này...'
                  : course?.moTa || 'Không có mô tả.'}
            </div>
          </div>
        </aside>

        <section className="surface-card registration-main">
          {selectedCourseId === null ? (
            <div className="registration-empty">
              Chọn một môn ở bên trái để xem danh sách lớp và đăng ký.
            </div>
          ) : loadingCourse || !course ? (
            <div className="registration-empty">Đang tải dữ liệu lớp...</div>
          ) : (
            <>
              <div className="registration-course-head">
                <div>
                  <h2>{course.tenKhoaHoc}</h2>
                  <p>Học phí: {formatVND(course.hocPhi)}</p>
                </div>
                <div className="registration-course-meta">
                  {course.ngayBatDau && <span>Khai giảng: {formatDate(course.ngayBatDau)}</span>}
                  {course.ngayKetThuc && <span>Kết thúc: {formatDate(course.ngayKetThuc)}</span>}
                </div>
              </div>

              <div className="registration-classes">
                <div className="registration-section-head">
                  <h3>Bước 2. Chọn lớp</h3>
                  <p>Chỉ lớp còn chỗ và đang mở đăng ký mới có thể chọn.</p>
                </div>

                {course.lopHocs.length === 0 ? (
                  <div className="registration-empty">Khóa này chưa có lớp nào.</div>
                ) : (
                  <div className="registration-class-grid">
                    {course.lopHocs.map((lop) => {
                      const isDisabled = !lop.allowDangKy || lop.soChoConLai <= 0
                      const isSelected = selectedLop === lop.idLop

                      return (
                        <button
                          key={lop.idLop}
                          type="button"
                          onClick={() => {
                            if (isDisabled) return
                            setSelectedLop(lop.idLop)
                          }}
                          disabled={isDisabled}
                          className={`registration-class-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        >
                          <div className="registration-class-head">
                            <strong>{lop.tenLop}</strong>
                            <span className={`registration-class-pill ${!lop.allowDangKy ? 'locked' : lop.soChoConLai <= 0 ? 'full' : 'open'}`}>
                              {!lop.allowDangKy ? 'Đang khóa' : lop.soChoConLai <= 0 ? 'Đã đầy' : `Còn ${lop.soChoConLai} chỗ`}
                            </span>
                          </div>
                          <div className="registration-class-meta">
                            <span>📅 {lop.ngayBatDau ? formatDate(lop.ngayBatDau) : 'Chưa có'} - {lop.ngayKetThuc ? formatDate(lop.ngayKetThuc) : 'Chưa có'}</span>
                            <span>👥 {lop.soHocVienDangKy}/{lop.siSoToiDa} học viên</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="registration-confirm">
                {selectedClass ? (
                  <>
                    <div className="registration-confirm-summary">
                      <div><span>Lớp</span><strong>{selectedClass.tenLop}</strong></div>
                      <div><span>Thời gian</span><strong>{selectedClass.ngayBatDau ? formatDate(selectedClass.ngayBatDau) : 'Chưa xác định'} đến {selectedClass.ngayKetThuc ? formatDate(selectedClass.ngayKetThuc) : 'Chưa xác định'}</strong></div>
                      <div><span>Sĩ số</span><strong>{selectedClass.soHocVienDangKy}/{selectedClass.siSoToiDa}</strong></div>
                    </div>

                    <div className="registration-conflict-check">
                      <label className="registration-checkbox-label">
                        <input
                          type="checkbox"
                          checked={shouldCheckConflict}
                          onChange={(e) => setShouldCheckConflict(e.target.checked)}
                          disabled={checkingConflict}
                        />
                        <span>Kiểm tra xung đột lịch học với các lớp hiện tại</span>
                      </label>
                      {checkingConflict && <p className="registration-checking">Đang kiểm tra...</p>}
                      {shouldCheckConflict && conflictData && (
                        <div className={`registration-conflict-result ${conflictData.hasConflict ? 'conflict' : 'no-conflict'}`}>
                          {conflictData.hasConflict ? (
                            <>
                              <p className="conflict-warning">⚠️ Phát hiện xung đột lịch học với các lớp sau:</p>
                              <ul className="conflict-class-list">
                                {conflictData.conflictingClasses.map((cls) => (
                                  <li key={cls.idLop}>
                                    <strong>{cls.tenLop}</strong>
                                    {cls.ngayBatDau && <span> ({formatDate(cls.ngayBatDau)} - {cls.ngayKetThuc ? formatDate(cls.ngayKetThuc) : 'Chưa xác định'})</span>}
                                  </li>
                                ))}
                              </ul>
                              <p className="conflict-note">Vui lòng chọn lớp khác hoặc hủy đăng ký lớp trùng lịch để tiếp tục.</p>
                            </>
                          ) : (
                            <p className="conflict-success">✓ Không có xung đột lịch học. Bạn có thể đăng ký lớp này.</p>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      className="auth-button"
                      disabled={registering || !selectedClass.allowDangKy || selectedClass.soChoConLai <= 0 || (shouldCheckConflict && conflictData?.hasConflict)}
                      onClick={handleDangKy}
                    >
                      {registering ? 'Đang xử lý...' : 'Xác nhận đăng ký'}
                    </button>
                  </>
                ) : (
                  <div className="registration-empty">Chọn một lớp hợp lệ để tiếp tục đăng ký.</div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
