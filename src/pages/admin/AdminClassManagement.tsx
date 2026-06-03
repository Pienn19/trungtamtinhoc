import { useEffect, useMemo, useState } from 'react'
import axiosClient from '../../services/axiosClient'
import { FiEdit2, FiTrash2, FiPlus, FiRefreshCw, FiUsers } from 'react-icons/fi'
import '../../styles/admin-class-management.css'

type KhoaHocOption = {
    idKhoaHoc: number
    tenKhoaHoc: string
    thoiLuong?: number
}

type HocVienDangKy = {
    idHocVien: number
    hoTen?: string | null
    email?: string | null
    dienThoai?: string | null
    ngayDangKy?: string | null
}

type LopHoc = {
    idLop: number
    tenLop: string
    idKhoaHoc: number | null
    ngayBatDau: string | null
    ngayKetThuc: string | null
    siSoToiDa: number
    soTietMotBuoi: number
    soHocVienDangKy: number
    soChoConLai: number
    allowDangKy: boolean
    hocViensRegistered?: HocVienDangKy[] | null
    trangThai: string | null
}

type LopHocDetail = LopHoc & {
    tenKhoaHoc?: string | null
    ghiChu?: string | null
    hocViensRegistered?: HocVienDangKy[] | null
}

type GhepLopResult = {
    sourceClassId: number
    targetClassId: number
    movedRegistrations: number
    targetStudentCount: number
    message: string
}

const defaultForm = {
    tenLop: '',
    idKhoaHoc: 0,
    siSoToiDa: 30,
    soTietMotBuoi: 5,
    allowDangKy: true,
    ngayBatDau: '',
    ngayKetThuc: '',
    trangThai: 'Planning',
    ghiChu: '',
}

const STATUS_LABELS: Record<string, string> = {
    Planning: 'Lên kế hoạch',
    OnGoing: 'Đang diễn ra',
    Closed: 'Đã kết thúc',
}

const calculateEndDateFromDuration = (startDate: string, thoiLuong: number) => {
    if (!startDate || !thoiLuong || thoiLuong <= 0) return ''

    const start = new Date(`${startDate}T00:00:00`)
    if (Number.isNaN(start.getTime())) return ''

    const sessions = thoiLuong / 5
    const weeks = sessions / 3
    const days = Math.ceil(weeks * 7)

    const end = new Date(start)
    end.setDate(end.getDate() + days)

    const yyyy = end.getFullYear()
    const mm = String(end.getMonth() + 1).padStart(2, '0')
    const dd = String(end.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

export default function AdminClassManagement() {
    const [classes, setClasses] = useState<LopHoc[]>([])
    const [courses, setCourses] = useState<KhoaHocOption[]>([])
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
    const [selectedClassDetail, setSelectedClassDetail] = useState<LopHocDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [detailLoading, setDetailLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState(defaultForm)
    const [showMergeModal, setShowMergeModal] = useState(false)
    const [mergeSourceClass, setMergeSourceClass] = useState<LopHoc | null>(null)
    const [mergeTargetClassId, setMergeTargetClassId] = useState<number | null>(null)
    const [mergeReason, setMergeReason] = useState('')
    const [mergeSubmitting, setMergeSubmitting] = useState(false)
    const [showMultiMergeModal, setShowMultiMergeModal] = useState(false)
    const [multiSourceIds, setMultiSourceIds] = useState<number[]>([])
    const [multiTargetId, setMultiTargetId] = useState<number | null>(null)
    const [multiReason, setMultiReason] = useState('')
    const [multiSubmitting, setMultiSubmitting] = useState(false)
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [historyItems, setHistoryItems] = useState<GhepLopResult[] | any[]>([])
    const [showSuggestionsModal, setShowSuggestionsModal] = useState(false)
    const [suggestions, setSuggestions] = useState<any[]>([])

    useEffect(() => {
        void fetchData()
    }, [])

    useEffect(() => {
        if (selectedClassId) {
            void loadClassDetail(selectedClassId)
        }
    }, [selectedClassId])

    // Keyboard accessibility: Close modals on Esc key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (showMergeModal) closeMergeModal()
                else if (showMultiMergeModal) setShowMultiMergeModal(false)
                else if (showSuggestionsModal) setShowSuggestionsModal(false)
                else if (showHistoryModal) setShowHistoryModal(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showMergeModal, showMultiMergeModal, showSuggestionsModal, showHistoryModal])

    const selectedCourseName = useMemo(() => {
        if (!selectedClassDetail?.idKhoaHoc) return ''
        return courses.find((course) => course.idKhoaHoc === selectedClassDetail.idKhoaHoc)?.tenKhoaHoc ?? ''
    }, [courses, selectedClassDetail])

    const selectedCourseDuration = useMemo(() => {
        if (!formData.idKhoaHoc) return 0
        return courses.find((course) => course.idKhoaHoc === formData.idKhoaHoc)?.thoiLuong ?? 0
    }, [courses, formData.idKhoaHoc])

    useEffect(() => {
        if (!formData.ngayBatDau || !selectedCourseDuration) {
            setFormData((prev) => (prev.ngayKetThuc ? { ...prev, ngayKetThuc: '' } : prev))
            return
        }

        const calculatedEndDate = calculateEndDateFromDuration(formData.ngayBatDau, selectedCourseDuration)
        if (!calculatedEndDate) return

        setFormData((prev) => {
            if (prev.ngayKetThuc === calculatedEndDate) return prev
            return { ...prev, ngayKetThuc: calculatedEndDate }
        })
    }, [formData.ngayBatDau, selectedCourseDuration])

    const mergeTargetOptions = useMemo(() => {
        if (!mergeSourceClass?.idKhoaHoc) return []

        return classes.filter(
            (lop) =>
                lop.idLop !== mergeSourceClass.idLop &&
                lop.idKhoaHoc === mergeSourceClass.idKhoaHoc &&
                lop.trangThai !== 'Closed',
        )
    }, [classes, mergeSourceClass])

    // Calculate total students from multiple source classes
    const calculateTotalSourceStudents = (sourceIds: number[]) => {
        return sourceIds.reduce((sum, id) => {
            const cls = classes.find((c) => c.idLop === id)
            return sum + (cls?.soHocVienDangKy ?? 0)
        }, 0)
    }

    // Smart multi-merge target filter: only classes with enough capacity, not in source list, same course
    const multiMergeTargetOptions = useMemo(() => {
        if (multiSourceIds.length === 0) return classes.filter((c) => c.trangThai !== 'Closed')

        const totalSourceStudents = calculateTotalSourceStudents(multiSourceIds)
        const sourceCoursesSet = new Set<number>()
        multiSourceIds.forEach((id) => {
            const cls = classes.find((c) => c.idLop === id)
            if (cls?.idKhoaHoc) sourceCoursesSet.add(cls.idKhoaHoc)
        })

        // Only show classes that: (1) not in source list, (2) not closed, (3) same course, (4) have enough capacity
        return classes
            .filter(
                (lop) =>
                    !multiSourceIds.includes(lop.idLop) &&
                    lop.trangThai !== 'Closed' &&
                    (sourceCoursesSet.size === 1 && lop.idKhoaHoc === Array.from(sourceCoursesSet)[0]) &&
                    lop.soChoConLai >= totalSourceStudents,
            )
            .sort((a, b) => b.soChoConLai - a.soChoConLai) // Sort by available seats descending
    }, [multiSourceIds, classes])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [classesRes, coursesRes] = await Promise.all([
                axiosClient.get('/lophoc'),
                axiosClient.get('/khoahoc'),
            ])

            setClasses(Array.isArray(classesRes.data) ? classesRes.data : [])
            setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : [])

            const firstClass = Array.isArray(classesRes.data) && classesRes.data.length > 0 ? classesRes.data[0] : null
            if (firstClass) {
                setSelectedClassId(firstClass.idLop)
            } else {
                setSelectedClassId(null)
                setSelectedClassDetail(null)
            }
        } catch (error) {
            console.error('Error loading class management data:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadClassDetail = async (classId: number) => {
        try {
            setDetailLoading(true)
            const res = await axiosClient.get(`/lophoc/${classId}`)
            setSelectedClassDetail(res.data)
        } catch (error) {
            console.error('Error loading class detail:', error)
            setSelectedClassDetail(null)
        } finally {
            setDetailLoading(false)
        }
    }

    const resetForm = () => {
        setShowForm(false)
        setEditingId(null)
        setFormData(defaultForm)
    }

    const openCreateForm = () => {
        setEditingId(null)
        setFormData(defaultForm)
        setShowForm(true)
    }

    const openEditForm = (lop: LopHocDetail) => {
        setEditingId(lop.idLop)
        setFormData({
            tenLop: lop.tenLop ?? '',
            idKhoaHoc: lop.idKhoaHoc ?? 0,
            siSoToiDa: lop.siSoToiDa,
            soTietMotBuoi: 5,
            allowDangKy: lop.allowDangKy,
            ngayBatDau: lop.ngayBatDau ? lop.ngayBatDau.slice(0, 10) : '',
            ngayKetThuc: lop.ngayKetThuc ? lop.ngayKetThuc.slice(0, 10) : '',
            trangThai: lop.trangThai ?? 'Planning',
            ghiChu: lop.ghiChu ?? '',
        })
        setShowForm(true)
    }

    const openMergeModal = (lop: LopHoc) => {
        setMergeSourceClass(lop)
        setMergeTargetClassId(null)
        setMergeReason('')
        setShowMergeModal(true)
    }

    const closeMergeModal = () => {
        setShowMergeModal(false)
        setMergeSourceClass(null)
        setMergeTargetClassId(null)
        setMergeReason('')
        setMergeSubmitting(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.idKhoaHoc) {
            alert('Vui lòng chọn khóa học')
            return
        }

        if (!formData.tenLop.trim()) {
            alert('Tên lớp không được để trống')
            return
        }

        if (formData.siSoToiDa <= 0) {
            alert('Sĩ số tối đa phải lớn hơn 0')
            return
        }

        if (formData.ngayBatDau && formData.ngayKetThuc && formData.ngayBatDau >= formData.ngayKetThuc) {
            alert('Ngày bắt đầu phải trước ngày kết thúc')
            return
        }

        try {
            setSubmitting(true)
            const payload = {
                tenLop: formData.tenLop,
                idKhoaHoc: formData.idKhoaHoc,
                siSoToiDa: formData.siSoToiDa,
                soTietMotBuoi: 5,
                allowDangKy: formData.allowDangKy,
                ngayBatDau: formData.ngayBatDau ? `${formData.ngayBatDau}T00:00:00` : null,
                ngayKetThuc: formData.ngayKetThuc ? `${formData.ngayKetThuc}T00:00:00` : null,
                ghiChu: formData.ghiChu || null,
            }

            if (editingId) {
                await axiosClient.put(`/lophoc/${editingId}`, payload)
            } else {
                await axiosClient.post('/lophoc', payload)
            }

            alert(editingId ? 'Cập nhật lớp học thành công' : 'Tạo lớp học thành công')
            resetForm()
            await fetchData()
        } catch (error: any) {
            console.error('Error saving class:', error)
            alert(error?.response?.data?.message || 'Không thể lưu lớp học')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        const message = window.confirm(
            'Xác nhận xóa lớp học này?\n\nTất cả đăng ký của lớp sẽ bị xóa.\n(Nhấn "OK" để tiếp tục)'
        )
        if (!message) return

        try {
            // Use force delete endpoint that clears registrations and deletes class
            await axiosClient.delete(`/lophoc/${id}/force`)
            alert('Xóa lớp học thành công')
            await fetchData()
            if (selectedClassId === id) {
                setSelectedClassId(null)
                setSelectedClassDetail(null)
            }
        } catch (error: any) {
            console.error('Error deleting class:', error)
            const errorMsg = error?.response?.data?.message || 'Không thể xóa lớp học'
            alert(errorMsg)
        }
    }

    const handleMergeClass = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!mergeSourceClass || !mergeTargetClassId) {
            alert('Vui lòng chọn lớp đích để ghép')
            return
        }

        if (mergeSourceClass.idLop === mergeTargetClassId) {
            alert('Lớp nguồn và lớp đích phải khác nhau')
            return
        }

        try {
            setMergeSubmitting(true)
            const response = await axiosClient.post<GhepLopResult>('/lophoc/merge', {
                sourceClassId: mergeSourceClass.idLop,
                targetClassId: mergeTargetClassId,
                lyDo: mergeReason || null,
            })

            alert(response.data?.message || 'Ghép lớp thành công')
            const nextSelectedId = mergeTargetClassId
            closeMergeModal()
            await fetchData()
            setSelectedClassId(nextSelectedId)
        } catch (error: any) {
            console.error('Error merging classes:', error)
            alert(error?.response?.data?.message || 'Không thể ghép lớp')
        } finally {
            setMergeSubmitting(false)
        }
    }

    const handleMultiMerge = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!multiSourceIds || multiSourceIds.length < 1 || !multiTargetId) {
            alert('Vui lòng chọn ít nhất một lớp nguồn và một lớp đích')
            return
        }
        if (multiSourceIds.includes(multiTargetId)) {
            alert('Danh sách lớp nguồn không được chứa lớp đích')
            return
        }

        try {
            setMultiSubmitting(true)
            const payload = {
                sourceClassIds: multiSourceIds,
                targetClassId: multiTargetId,
                lyDo: multiReason || null,
            }
            const res = await axiosClient.post('/lophoc/merge/multi', payload)
            alert(res.data?.message || 'Ghép nhiều lớp thành công')
            setShowMultiMergeModal(false)
            setMultiSourceIds([])
            setMultiTargetId(null)
            setMultiReason('')
            await fetchData()
        } catch (err: any) {
            console.error('Multi merge error', err)
            alert(err?.response?.data?.message || 'Không thể ghép nhiều lớp')
        } finally {
            setMultiSubmitting(false)
        }
    }

    const getCourseName = (idKhoaHoc: number | null) => {
        if (!idKhoaHoc) return 'Chưa gán khóa học'
        return courses.find((course) => course.idKhoaHoc === idKhoaHoc)?.tenKhoaHoc ?? `ID: ${idKhoaHoc}`
    }

    return (
        <div className="admin-class-management">
            <div className="admin-class-management__header">
                <div className="admin-class-management__title">
                    <h1>🏫 Quản Lý Lớp Học</h1>
                    <p>
                        Danh sách lớp, roster học viên và cấu hình buổi học.
                    </p>
                </div>
                <div className="admin-class-management__actions">
                    <button
                        onClick={fetchData}
                        className="admin-class-management__btn admin-class-management__btn--secondary"
                    >
                        <FiRefreshCw size={16} /> Làm mới
                    </button>
                    <button
                        onClick={openCreateForm}
                        className="admin-class-management__btn admin-class-management__btn--primary"
                    >
                        <FiPlus size={16} /> Thêm lớp
                    </button>
                    <button
                        onClick={() => setShowMultiMergeModal(true)}
                        className="admin-class-management__btn admin-class-management__btn--multi-merge"
                    >
                        Ghép nhiều lớp
                    </button>
                    <button
                        onClick={() => { setShowHistoryModal(true); void axiosClient.get('/lophoc/merge/history').then(r => setHistoryItems(r.data)).catch(() => setHistoryItems([])) }}
                        className="admin-class-management__btn admin-class-management__btn--history"
                    >
                        Lịch sử ghép
                    </button>
                    <button
                        onClick={() => { setShowSuggestionsModal(true); void axiosClient.get('/lophoc/merge/suggestions').then(r => setSuggestions(r.data)).catch(() => setSuggestions([])) }}
                        className="admin-class-management__btn admin-class-management__btn--suggestions"
                    >
                        Gợi ý ghép
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="admin-class-management__form-section">
                    <form onSubmit={handleSubmit}>
                        <div className="admin-class-management__form-grid">
                            <div>
                                <div className="admin-class-management__form-label">Tên lớp</div>
                                <input
                                    type="text"
                                    placeholder="VD: Tin học cơ bản - sáng 2"
                                    value={formData.tenLop}
                                    onChange={(e) => setFormData({ ...formData, tenLop: e.target.value })}
                                    className="admin-class-management__form-input"
                                />
                            </div>
                            <select
                                value={formData.idKhoaHoc}
                                onChange={(e) => setFormData({ ...formData, idKhoaHoc: Number(e.target.value) })}
                                className="admin-class-management__form-select"
                            >
                                <option value={0}>-- Chọn khóa học --</option>
                                {courses.map((course) => (
                                    <option key={course.idKhoaHoc} value={course.idKhoaHoc}>
                                        {course.tenKhoaHoc}
                                    </option>
                                ))}
                            </select>
                            <div>
                                <div className="admin-class-management__form-label">Sĩ số tối đa</div>
                                <input
                                    type="number"
                                    min={1}
                                    placeholder="VD: 30"
                                    value={formData.siSoToiDa}
                                    onChange={(e) => setFormData({ ...formData, siSoToiDa: Number(e.target.value) })}
                                    className="admin-class-management__form-input"
                                />
                            </div>
                            <div>
                                <div className="admin-class-management__form-label">Số tiết mỗi buổi</div>
                                <input
                                    type="number"
                                    min={3}
                                    max={5}
                                    placeholder="VD: 3"
                                    value={formData.soTietMotBuoi}
                                    disabled
                                    className="admin-class-management__form-input"
                                />
                            </div>
                            <select
                                value={formData.trangThai}
                                onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                                className="admin-class-management__form-select"
                            >
                                <option value="Planning">Lên kế hoạch</option>
                                <option value="OnGoing">Đang diễn ra</option>
                                <option value="Closed">Đã kết thúc</option>
                            </select>
                            <select
                                value={formData.allowDangKy ? 'true' : 'false'}
                                onChange={(e) => setFormData({ ...formData, allowDangKy: e.target.value === 'true' })}
                                className="admin-class-management__form-select"
                            >
                                <option value="true">Cho phép đăng ký</option>
                                <option value="false">Khóa đăng ký</option>
                            </select>
                            <input
                                type="date"
                                value={formData.ngayBatDau}
                                onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
                                className="admin-class-management__form-input"
                            />
                            <input
                                type="date"
                                value={formData.ngayKetThuc}
                                disabled
                                className="admin-class-management__form-input"
                            />
                        </div>
                        <textarea
                            placeholder="Ghi chú"
                            value={formData.ghiChu}
                            onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                            rows={3}
                            className="admin-class-management__form-textarea"
                            style={{ marginBottom: 14 }}
                        />
                        <div className="admin-class-management__form-actions">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="admin-class-management__form-btn admin-class-management__form-btn--save"
                            >
                                {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo lớp'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="admin-class-management__form-btn admin-class-management__form-btn--cancel"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="admin-class-management__content">
                <div className="admin-class-management__table-card">
                    {loading ? (
                        <p style={{ padding: 20 }}>Đang tải...</p>
                    ) : (
                        <table className="admin-class-management__table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên lớp</th>
                                    <th>Khóa học</th>
                                    <th>Sĩ số</th>
                                    <th>Đã đăng ký</th>
                                    <th>Còn lại</th>
                                    <th>Trạng thái</th>
                                    <th style={{ textAlign: 'center' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.map((lop) => (
                                    <tr
                                        key={lop.idLop}
                                        onClick={() => setSelectedClassId(lop.idLop)}
                                        className={selectedClassId === lop.idLop ? 'selected' : ''}
                                    >
                                        <td>{lop.idLop}</td>
                                        <td>{lop.tenLop}</td>
                                        <td>{getCourseName(lop.idKhoaHoc)}</td>
                                        <td>{lop.siSoToiDa}</td>
                                        <td>{lop.soHocVienDangKy}</td>
                                        <td style={{ fontWeight: 700, color: lop.soChoConLai > 0 ? '#16a34a' : '#dc2626' }}>
                                            {lop.soChoConLai}
                                        </td>
                                        <td>
                                            <span className={`admin-class-management__status-badge admin-class-management__status-badge--${(lop.trangThai ?? 'unknown').toLowerCase()}`}>
                                                {STATUS_LABELS[lop.trangThai ?? ''] ?? lop.trangThai ?? 'Không xác định'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-class-management__action-buttons">
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation()
                                                        setSelectedClassId(lop.idLop)
                                                        openEditForm({
                                                            ...lop,
                                                            allowDangKy: lop.allowDangKy,
                                                            soTietMotBuoi: lop.soTietMotBuoi,
                                                            hocViensRegistered: selectedClassDetail?.idLop === lop.idLop ? selectedClassDetail.hocViensRegistered : [],
                                                        })
                                                    }}
                                                    className="admin-class-management__action-btn admin-class-management__action-btn--edit"
                                                >
                                                    <FiEdit2 size={12} /> Sửa
                                                </button>
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation()
                                                        void handleDelete(lop.idLop)
                                                    }}
                                                    className="admin-class-management__action-btn admin-class-management__action-btn--delete"
                                                >
                                                    <FiTrash2 size={12} /> Xóa
                                                </button>
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation()
                                                        openMergeModal(lop)
                                                    }}
                                                    className="admin-class-management__action-btn admin-class-management__action-btn--merge"
                                                >
                                                    Ghép lớp
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {selectedClassId !== null && (
                    <div className="admin-class-management__sidebar">
                        <div className="admin-class-management__sidebar-header">
                            <div>
                                <h2 className="admin-class-management__sidebar-title">👨‍🎓 Roster lớp học</h2>
                                <p className="admin-class-management__sidebar-subtitle">
                                    {selectedClassDetail ? `${selectedClassDetail.tenLop} · ${selectedCourseName || selectedClassDetail.tenKhoaHoc || ''}` : 'Chọn một lớp để xem danh sách học viên'}
                                </p>
                            </div>
                            <FiUsers size={20} color="#0D9488" />
                        </div>

                        {detailLoading ? (
                            <p>Đang tải chi tiết lớp...</p>
                        ) : selectedClassDetail ? (
                            <div>
                                <div className="admin-class-management__info-grid">
                                    <InfoCard label="Sĩ số" value={`${selectedClassDetail.soHocVienDangKy}/${selectedClassDetail.siSoToiDa}`} />
                                    <InfoCard label="Số tiết/buổi" value={String(selectedClassDetail.soTietMotBuoi)} />
                                    <InfoCard label="Cho phép đăng ký" value={selectedClassDetail.allowDangKy ? 'Có' : 'Không'} />
                                    <InfoCard label="Còn lại" value={String(selectedClassDetail.soChoConLai)} />
                                </div>

                                <div style={{ marginBottom: 16 }}>
                                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Ghi chú</div>
                                    <div style={{ color: '#475569', background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                        {selectedClassDetail.ghiChu || 'Không có ghi chú'}
                                    </div>
                                </div>

                                <div>
                                    <div style={{ fontWeight: 700, marginBottom: 8 }}>Danh sách học viên</div>
                                    {selectedClassDetail.hocViensRegistered && selectedClassDetail.hocViensRegistered.length > 0 ? (
                                        <div style={{ display: 'grid', gap: 10 }}>
                                            {selectedClassDetail.hocViensRegistered.map((student) => (
                                                <div key={student.idHocVien} style={{ border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, background: '#fff' }}>
                                                    <div style={{ fontWeight: 700 }}>{student.hoTen || `Học viên #${student.idHocVien}`}</div>
                                                    <div style={{ color: '#64748b', fontSize: 14 }}>{student.email || 'Chưa có email'}</div>
                                                    <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                                                        {student.dienThoai || 'Chưa có số điện thoại'}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p style={{ color: '#64748b' }}>Lớp này chưa có học viên đăng ký.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: '#64748b' }}>Không có dữ liệu lớp để hiển thị.</p>
                        )}
                    </div>
                )}
            </div>

            {showMergeModal && mergeSourceClass && (
                <div className="admin-class-management__modal-overlay" onClick={closeMergeModal} role="presentation">
                    <div
                        className="admin-class-management__modal"
                        onClick={(event) => event.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="merge-modal-title"
                    >
                        <div className="admin-class-management__modal-header">
                            <div>
                                <h3 id="merge-modal-title" className="admin-class-management__modal-title">Ghép lớp</h3>
                                <p className="admin-class-management__modal-subtitle">
                                    Chuyển toàn bộ học viên từ lớp nguồn sang lớp đích và đóng lớp nguồn.
                                </p>
                            </div>
                            <button
                                onClick={closeMergeModal}
                                className="admin-class-management__modal-close-btn"
                                type="button"
                                aria-label="Đóng modal ghép lớp"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleMergeClass}>
                            <div className="admin-class-management__info-grid" style={{ marginBottom: 16 }}>
                                <InfoCard label="Lớp nguồn" value={mergeSourceClass.tenLop || `ID: ${mergeSourceClass.idLop}`} />
                                <InfoCard label="Khóa học" value={getCourseName(mergeSourceClass.idKhoaHoc)} />
                                <InfoCard label="Học viên hiện có" value={String(mergeSourceClass.soHocVienDangKy)} />
                                <InfoCard label="Sĩ số còn lại" value={String(mergeSourceClass.soChoConLai)} />
                            </div>

                            <div className="admin-class-management__modal-content" style={{ marginBottom: 14 }}>
                                <div className="admin-class-management__form-label">Lớp đích</div>
                                <select
                                    value={mergeTargetClassId ?? ''}
                                    onChange={(e) => setMergeTargetClassId(Number(e.target.value) || null)}
                                    className="admin-class-management__form-select"
                                    style={{ width: '100%' }}
                                >
                                    <option value="">-- Chọn lớp đích --</option>
                                    {mergeTargetOptions.map((lop) => (
                                        <option key={lop.idLop} value={lop.idLop}>
                                            {lop.tenLop} · {lop.soHocVienDangKy}/{lop.siSoToiDa} · {lop.trangThai}
                                        </option>
                                    ))}
                                </select>
                                {mergeTargetOptions.length === 0 && (
                                    <div style={{ marginTop: 8, color: '#dc2626', fontSize: 13 }}>
                                        Không có lớp đích hợp lệ cùng khóa học.
                                    </div>
                                )}
                            </div>

                            <div className="admin-class-management__modal-content" style={{ marginBottom: 16 }}>
                                <div className="admin-class-management__form-label">Lý do ghép lớp</div>
                                <textarea
                                    value={mergeReason}
                                    onChange={(e) => setMergeReason(e.target.value)}
                                    rows={3}
                                    placeholder="VD: Hai lớp đều dưới sĩ số tối thiểu, ghép để tối ưu số lượng học viên"
                                    className="admin-class-management__form-textarea"
                                    style={{ width: '100%' }}
                                />
                            </div>

                            <div className="admin-class-management__modal-actions">
                                <button type="button" onClick={closeMergeModal} className="admin-class-management__modal-btn--secondary">
                                    Hủy
                                </button>
                                <button type="submit" disabled={mergeSubmitting || mergeTargetOptions.length === 0} className="admin-class-management__modal-btn--primary">
                                    {mergeSubmitting ? 'Đang ghép...' : 'Xác nhận ghép lớp'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showMultiMergeModal && (
                <div className="admin-class-management__modal-overlay" onClick={() => setShowMultiMergeModal(false)} role="presentation">
                    <div
                        className="admin-class-management__modal"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="multi-merge-modal-title"
                    >
                        <div className="admin-class-management__modal-header">
                            <div>
                                <h3 id="multi-merge-modal-title" className="admin-class-management__modal-title">Ghép nhiều lớp</h3>
                                <p className="admin-class-management__modal-subtitle">Chọn nhiều lớp nguồn và lớp đích để ghép.</p>
                            </div>
                            <button
                                onClick={() => setShowMultiMergeModal(false)}
                                className="admin-class-management__modal-close-btn"
                                type="button"
                                aria-label="Đóng modal ghép nhiều lớp"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleMultiMerge}>
                            <div className="admin-class-management__modal-content" style={{ marginBottom: 12 }}>
                                <div className="admin-class-management__form-label">Chọn lớp nguồn (có thể chọn nhiều)</div>
                                <div style={{ maxHeight: 200, overflow: 'auto', border: '1px solid #e2e8f0', borderRadius: 8, padding: 8 }}>
                                    {classes.map((c) => (
                                        <label key={c.idLop} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 4px' }}>
                                            <input type="checkbox" checked={multiSourceIds.includes(c.idLop)} onChange={(e) => {
                                                const next = [...multiSourceIds]
                                                if (e.target.checked) next.push(c.idLop)
                                                else {
                                                    const idx = next.indexOf(c.idLop)
                                                    if (idx >= 0) next.splice(idx, 1)
                                                }
                                                setMultiSourceIds(next)
                                            }} />
                                            <span>{c.tenLop} · {getCourseName(c.idKhoaHoc)} · {c.soHocVienDangKy}/{c.siSoToiDa}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="admin-class-management__modal-content" style={{ marginBottom: 12 }}>
                                <div className="admin-class-management__form-label">
                                    Lớp đích
                                    {multiMergeTargetOptions.length === 0 && multiSourceIds.length > 0 && (
                                        <span style={{ color: '#dc2626', fontSize: 12, marginLeft: 8 }}>
                                            (Không có lớp - cần dung lượng ≥ {calculateTotalSourceStudents(multiSourceIds)})
                                        </span>
                                    )}
                                </div>
                                <select
                                    value={multiTargetId ?? ''}
                                    onChange={(e) => setMultiTargetId(Number(e.target.value) || null)}
                                    className="admin-class-management__form-select"
                                    style={{ width: '100%' }}
                                >
                                    <option value="">-- Chọn lớp đích --</option>
                                    {multiMergeTargetOptions.map((c) => (
                                        <option key={c.idLop} value={c.idLop}>
                                            {c.tenLop} · {getCourseName(c.idKhoaHoc)} · Còn: {c.soChoConLai}/{c.siSoToiDa}
                                        </option>
                                    ))}
                                </select>
                                {multiSourceIds.length > 0 && (
                                    <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>
                                        Tổng HV từ {multiSourceIds.length} lớp: <strong>{calculateTotalSourceStudents(multiSourceIds)}</strong>
                                    </div>
                                )}
                            </div>

                            <div className="admin-class-management__modal-content" style={{ marginBottom: 12 }}>
                                <div className="admin-class-management__form-label">Lý do ghép</div>
                                <textarea value={multiReason} onChange={(e) => setMultiReason(e.target.value)} rows={3} className="admin-class-management__form-textarea" style={{ width: '100%' }} />
                            </div>

                            <div className="admin-class-management__modal-actions">
                                <button type="button" onClick={() => setShowMultiMergeModal(false)} className="admin-class-management__modal-btn--secondary">Hủy</button>
                                <button type="submit" disabled={multiSubmitting} className="admin-class-management__modal-btn--primary">{multiSubmitting ? 'Đang ghép...' : 'Xác nhận ghép nhiều lớp'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showSuggestionsModal && (
                <div className="admin-class-management__modal-overlay" onClick={() => setShowSuggestionsModal(false)} role="presentation">
                    <div
                        className="admin-class-management__modal"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="suggestions-modal-title"
                    >
                        <div className="admin-class-management__modal-header">
                            <h3 id="suggestions-modal-title" className="admin-class-management__modal-title">Gợi ý ghép lớp</h3>
                            <button
                                onClick={() => setShowSuggestionsModal(false)}
                                className="admin-class-management__modal-close-btn"
                                type="button"
                                aria-label="Đóng modal gợi ý ghép lớp"
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ maxHeight: 420, overflow: 'auto' }}>
                            {suggestions && suggestions.length > 0 ? (
                                suggestions.map((s: any, idx: number) => (
                                    <div key={idx} style={{ border: '1px solid #e2e8f0', padding: 12, borderRadius: 10, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>{s.courseName} · {s.combinedCount}/{s.maxTargetCapacity} {(s.fitsIntoOneClass ? '(Fit)' : '')}</div>
                                            <div style={{ color: '#64748b', marginTop: 6 }}>Lớp nguồn: {s.sourceClassNames?.join(', ')}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button onClick={() => {
                                                // apply suggestion to multi-merge modal
                                                const sourceIds = s.sourceClassIds || []
                                                setMultiSourceIds(sourceIds)
                                                // Auto-select best target: find class with highest capacity in same course
                                                const courseId = s.courseId
                                                const validTargets = classes
                                                    .filter(
                                                        (c) =>
                                                            !sourceIds.includes(c.idLop) &&
                                                            c.idKhoaHoc === courseId &&
                                                            c.trangThai !== 'Closed' &&
                                                            c.soChoConLai >= s.combinedCount,
                                                    )
                                                    .sort((a, b) => b.soChoConLai - a.soChoConLai)
                                                setMultiTargetId(validTargets.length > 0 ? validTargets[0].idLop : null)
                                                setShowMultiMergeModal(true)
                                                setShowSuggestionsModal(false)
                                            }} className="admin-class-management__modal-btn--primary">
                                                Áp dụng
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ color: '#64748b' }}>Không tìm thấy gợi ý ghép lớp.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showHistoryModal && (
                <div className="admin-class-management__modal-overlay" onClick={() => setShowHistoryModal(false)} role="presentation">
                    <div
                        className="admin-class-management__modal"
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="history-modal-title"
                    >
                        <div className="admin-class-management__modal-header">
                            <h3 id="history-modal-title" className="admin-class-management__modal-title">Lịch sử ghép lớp</h3>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="admin-class-management__modal-close-btn"
                                type="button"
                                aria-label="Đóng modal lịch sử ghép lớp"
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ maxHeight: 420, overflow: 'auto' }}>
                            {historyItems && historyItems.length > 0 ? (
                                historyItems.map((h: any) => (
                                    <div key={h.idGhep} style={{ border: '1px solid #e2e8f0', padding: 12, borderRadius: 10, marginBottom: 8 }}>
                                        <div style={{ fontWeight: 700 }}>#{h.idGhep} · Lớp đích: {h.targetClassId} · Di chuyển: {h.movedCount}</div>
                                        <div style={{ color: '#64748b', fontSize: 13 }}>Nguời: {h.nguoiThucHien || 'N/A'} · {new Date(h.ngayGhep).toLocaleString()}</div>
                                        <div style={{ marginTop: 8 }}>Nguồn: {h.sourceClassIds ? h.sourceClassIds.join(', ') : ''}</div>
                                        <div style={{ marginTop: 8, color: '#0f172a' }}>{h.lyDo}</div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ color: '#64748b' }}>Không có lịch sử ghép lớp.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="admin-class-management__info-card">
            <div className="admin-class-management__info-label">{label}</div>
            <div className="admin-class-management__info-value">{value}</div>
        </div>
    )
}
