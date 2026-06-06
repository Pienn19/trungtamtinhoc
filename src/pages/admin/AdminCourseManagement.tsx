import { useEffect, useState } from 'react'
import axiosClient from '../../services/axiosClient'
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi'
import { getCourseImageSrc } from '../../utils/imageHelper'
import '../../styles/admin-course-management.css'

interface KhoaHoc {
    idKhoaHoc: number
    tenKhoaHoc: string
    thoiLuong: number
    hocPhi: number
    moTa: string
    anhDaiDien: string
}

const emptyForm = {
    tenKhoaHoc: '',
    thoiLuong: '' as number | '',
    hocPhi: '' as number | '',
    moTa: '',
    anhDaiDien: '',
}

const AdminCourseManagement = () => {
    const [courses, setCourses] = useState<KhoaHoc[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [imagePreview, setImagePreview] = useState('')
    const [imageUploading, setImageUploading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [formError, setFormError] = useState('')
    const [formData, setFormData] = useState(emptyForm)

    useEffect(() => {
        void fetchCourses()
    }, [])

    const fetchCourses = async () => {
        try {
            setLoading(true)
            const response = await axiosClient.get('/khoahoc')
            const data = Array.isArray(response.data) ? response.data : []
            setCourses(data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setShowForm(false)
        setEditingId(null)
        setImageUploading(false)
        setFormData(emptyForm)
        setImagePreview('')
        setFormError('')
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Xác nhận xóa khóa học này?')) return

        try {
            await axiosClient.delete(`/khoahoc/${id}`)
            alert('Xóa khóa học thành công')
            await fetchCourses()
        } catch (error: any) {
            console.error('Error:', error)
            const errorMessage = error?.response?.data?.message || 'Không thể xóa khóa học. Vui lòng thử lại.'
            alert(errorMessage)
        }
    }

    const handleImageChange = async (file: File | null) => {
        if (!file) {
            setImagePreview('')
            setFormData((current) => ({ ...current, anhDaiDien: '' }))
            return
        }

        setImageUploading(true)
        setFormError('')

        try {
            const uploadFormData = new FormData()
            uploadFormData.append('file', file)

            const response = await axiosClient.post('/khoahoc/upload-image', uploadFormData)
            const fileUrl = response.data?.fileUrl || ''
            const fileName = response.data?.fileName || ''

            setImagePreview(fileUrl)
            setFormData((current) => ({ ...current, anhDaiDien: fileName }))
        } catch (error) {
            console.error('Upload error:', error)
            const message = (error as any)?.response?.data?.message || 'Không thể tải ảnh lên. Vui lòng thử file khác.'
            setFormError(message)
            setImagePreview('')
            setFormData((current) => ({ ...current, anhDaiDien: '' }))
        } finally {
            setImageUploading(false)
        }
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setSubmitting(true)
        setFormError('')

        // Explicit validation
        if (!formData.tenKhoaHoc.trim()) {
            setFormError('Vui lòng nhập tên khóa học.')
            setSubmitting(false)
            return
        }
        if (!formData.thoiLuong || Number(formData.thoiLuong) <= 0) {
            setFormError('Vui lòng nhập thời lượng hợp lệ (lớn hơn 0).')
            setSubmitting(false)
            return
        }
        if (!formData.hocPhi || Number(formData.hocPhi) <= 0) {
            setFormError('Vui lòng nhập học phí hợp lệ (lớn hơn 0).')
            setSubmitting(false)
            return
        }
        if (!formData.moTa.trim()) {
            setFormError('Vui lòng nhập mô tả khóa học.')
            setSubmitting(false)
            return
        }

        try {
            const url = editingId ? `/khoahoc/${editingId}` : '/khoahoc'

            if (editingId) {
                await axiosClient.put(url, formData)
            } else {
                await axiosClient.post(url, formData)
            }

            resetForm()
            await fetchCourses()
        } catch (error) {
            console.error('Error:', error)
            const message = (error as any)?.response?.data?.message || 'Không thể lưu khóa học. Vui lòng thử lại.'
            setFormError(message)
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (course: KhoaHoc) => {
        setFormData({
            tenKhoaHoc: course.tenKhoaHoc,
            thoiLuong: course.thoiLuong,
            hocPhi: course.hocPhi,
            moTa: course.moTa,
            anhDaiDien: course.anhDaiDien,
        })
        setImagePreview(getCourseImageSrc(course.anhDaiDien))
        setEditingId(course.idKhoaHoc)
        setFormError('')
        setShowForm(true)
    }

    return (
        <div className="admin-course-management">
            <div className="admin-course-management__header">
                <h1 className="admin-course-management__title">📚 Quản Lý Khóa Học</h1>
                <div className="admin-course-management__actions">
                    <button
                        onClick={() => setShowForm((current) => !current)}
                        className="admin-course-management__btn admin-course-management__btn--primary"
                        type="button"
                    >
                        <FiPlus size={18} /> Thêm Khóa Học
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="admin-course-management__panel">
                    <form onSubmit={handleSubmit}>
                        <div className="admin-course-management__form-grid">
                            <div className="admin-course-management__field">
                                <label className="admin-course-management__label">Tên khóa học</label>
                                <input
                                    type="text"
                                    placeholder="Tên khóa học"
                                    value={formData.tenKhoaHoc}
                                    onChange={(event) => setFormData({ ...formData, tenKhoaHoc: event.target.value })}
                                    required
                                    className="admin-course-management__input"
                                />
                            </div>
                            <div className="admin-course-management__field">
                                <label className="admin-course-management__label">Thời lượng (tiết)</label>
                                <input
                                    type="number"
                                    placeholder="Thời lượng (VD: 45 tiết)"
                                    value={formData.thoiLuong}
                                    onChange={(event) => setFormData({ ...formData, thoiLuong: event.target.value === '' ? '' : Number(event.target.value) })}
                                    required
                                    min="1"
                                    className="admin-course-management__input"
                                />
                            </div>
                            <div className="admin-course-management__field">
                                <label className="admin-course-management__label">Học phí (VND)</label>
                                <input
                                    type="number"
                                    placeholder="Học phí (VND)"
                                    value={formData.hocPhi}
                                    onChange={(event) => setFormData({ ...formData, hocPhi: event.target.value === '' ? '' : Number(event.target.value) })}
                                    required
                                    min="1"
                                    className="admin-course-management__input"
                                />
                            </div>
                        </div>

                        <div className="admin-course-management__field admin-course-management__field--full">
                            <label className="admin-course-management__label">Mô tả khóa học</label>
                            <textarea
                                placeholder="Mô tả khóa học"
                                value={formData.moTa}
                                onChange={(event) => setFormData({ ...formData, moTa: event.target.value })}
                                required
                                className="admin-course-management__textarea"
                            />
                        </div>

                        <div className="admin-course-management__field">
                            <label className="admin-course-management__label">Ảnh đại diện từ máy</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => void handleImageChange(event.target.files?.[0] ?? null)}
                                disabled={imageUploading}
                                className="admin-course-management__input"
                            />
                            <div className="admin-course-management__note">
                                Chọn ảnh từ máy tính, hệ thống sẽ lưu file lên server và chỉ giữ tên file ngắn trong cơ sở dữ liệu.
                            </div>
                        </div>

                        {imageUploading && (
                            <div className="admin-course-management__alert admin-course-management__alert--info">
                                Đang tải ảnh lên hệ thống...
                            </div>
                        )}

                        {imagePreview && (
                            <div className="admin-course-management__image-row">
                                <img
                                    src={imagePreview}
                                    alt="Xem trước ảnh đại diện"
                                    className="admin-course-management__image-preview"
                                />
                                <div className="admin-course-management__image-caption">
                                    <div className="admin-course-management__image-caption-title">Đã chọn ảnh</div>
                                    <div>Ảnh sẽ được lưu cùng khóa học sau khi bấm lưu.</div>
                                </div>
                            </div>
                        )}

                        {!imagePreview && (
                            <div className="admin-course-management__field admin-course-management__field--full">
                                <input
                                    type="text"
                                    placeholder="Hoặc nhập tên ảnh / đường dẫn cũ nếu muốn dùng file có sẵn"
                                    value={formData.anhDaiDien}
                                    onChange={(event) => {
                                        setFormData({ ...formData, anhDaiDien: event.target.value })
                                        setImagePreview(getCourseImageSrc(event.target.value))
                                    }}
                                    className="admin-course-management__input"
                                />
                            </div>
                        )}

                        {imagePreview && formData.anhDaiDien && (
                            <div className="admin-course-management__alert admin-course-management__alert--neutral">
                                Ảnh đã lưu: <strong>{formData.anhDaiDien}</strong>
                            </div>
                        )}

                        {formError && (
                            <div className="admin-course-management__alert admin-course-management__alert--error">
                                {formError}
                            </div>
                        )}

                        <div className="admin-course-management__form-actions">
                            <button
                                type="submit"
                                disabled={submitting || imageUploading}
                                className="admin-course-management__form-btn admin-course-management__form-btn--save"
                            >
                                {imageUploading ? 'Đang tải ảnh...' : submitting ? 'Đang lưu...' : editingId ? 'Cập Nhật' : 'Thêm'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="admin-course-management__form-btn admin-course-management__form-btn--cancel"
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="admin-course-management__empty">Đang tải...</div>
            ) : (
                <div className="admin-course-management__table-card">
                    <table className="admin-course-management__table">
                        <thead className="admin-course-management__table-head">
                            <tr className="admin-course-management__table-row">
                                <th className="admin-course-management__table-header">ID</th>
                                <th className="admin-course-management__table-header">Tên Khóa Học</th>
                                <th className="admin-course-management__table-header">Thời Lượng</th>
                                <th className="admin-course-management__table-header">Học Phí</th>
                                <th className="admin-course-management__table-header admin-course-management__table-actions">Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((course) => (
                                <tr key={course.idKhoaHoc} className="admin-course-management__table-row">
                                    <td className="admin-course-management__table-cell">{course.idKhoaHoc}</td>
                                    <td className="admin-course-management__table-cell">{course.tenKhoaHoc}</td>
                                    <td className="admin-course-management__table-cell">{course.thoiLuong} tiết</td>
                                    <td className="admin-course-management__table-cell">{course.hocPhi.toLocaleString()} VND</td>
                                    <td className="admin-course-management__table-cell admin-course-management__table-actions">
                                        <div className="admin-course-management__row-actions">
                                            <button
                                                onClick={() => handleEdit(course)}
                                                className="admin-course-management__row-btn admin-course-management__row-btn--edit"
                                                type="button"
                                            >
                                                <FiEdit2 size={14} /> Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(course.idKhoaHoc)}
                                                className="admin-course-management__row-btn admin-course-management__row-btn--delete"
                                                type="button"
                                            >
                                                <FiTrash2 size={14} /> Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default AdminCourseManagement
