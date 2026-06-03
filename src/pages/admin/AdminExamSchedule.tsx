import { useEffect, useState } from 'react'
import { FiEdit2, FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi'
import { getExamSchedules, createExamSchedule, updateExamSchedule, deleteExamSchedule } from '../../services/examService'
import axiosClient from '../../services/axiosClient'
import '../../styles/admin-class-management.css'

type LichThiItem = {
    idLichThi: number
    idLop: number
    tenLop: string
    idPhong: number
    tenPhong: string
    ngayThi: string
}

type LopOption = { idLop: number; tenLop: string }
type PhongOption = { idPhong: number; tenPhong: string }

const defaultForm = {
    idLop: 0,
    idPhong: 0,
    ngayThi: '',
}

export default function AdminExamSchedule() {
    const [schedules, setSchedules] = useState<LichThiItem[]>([])
    const [classes, setClasses] = useState<LopOption[]>([])
    const [rooms, setRooms] = useState<PhongOption[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState(defaultForm)

    useEffect(() => {
        void fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [schedRes, classRes, roomRes] = await Promise.all([
                getExamSchedules(),
                axiosClient.get('/lophoc'),
                axiosClient.get('/phongthi'),
            ])
            setSchedules(Array.isArray(schedRes) ? schedRes : [])
            setClasses(Array.isArray(classRes.data) ? classRes.data : [])
            setRooms(Array.isArray(roomRes.data) ? roomRes.data : [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const openCreateForm = () => {
        setEditingId(null)
        setFormData(defaultForm)
        setShowForm(true)
    }

    const openEditForm = (sch: LichThiItem) => {
        setEditingId(sch.idLichThi)
        setFormData({
            idLop: sch.idLop,
            idPhong: sch.idPhong,
            ngayThi: sch.ngayThi ? sch.ngayThi.slice(0, 10) : '',
        })
        setShowForm(true)
    }

    const resetForm = () => {
        setShowForm(false)
        setEditingId(null)
        setFormData(defaultForm)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.idLop) {
            alert('Vui lòng chọn lớp')
            return
        }
        if (!formData.idPhong) {
            alert('Vui lòng chọn phòng thi')
            return
        }
        if (!formData.ngayThi) {
            alert('Vui lòng chọn ngày thi')
            return
        }

        try {
            setSubmitting(true)
            const payload = {
                idLop: formData.idLop,
                idPhong: formData.idPhong,
                ngayThi: `${formData.ngayThi}T00:00:00`,
            }

            if (editingId) {
                await updateExamSchedule(editingId, payload)
            } else {
                await createExamSchedule(payload)
            }

            alert(editingId ? 'Cập nhật lịch thi thành công' : 'Tạo lịch thi thành công')
            resetForm()
            await fetchData()
        } catch (err: any) {
            console.error(err)
            alert(err?.response?.data?.message || 'Lỗi khi lưu lịch thi')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Xác nhận xóa lịch thi này?')) return

        try {
            await deleteExamSchedule(id)
            alert('Xóa lịch thi thành công')
            await fetchData()
        } catch (err: any) {
            console.error(err)
            alert(err?.response?.data?.message || 'Không thể xóa lịch thi')
        }
    }

    const getClassName = (idLop: number) => classes.find(c => c.idLop === idLop)?.tenLop ?? `ID: ${idLop}`
    const getRoomName = (idPhong: number) => rooms.find(r => r.idPhong === idPhong)?.tenPhong ?? `ID: ${idPhong}`

    return (
        <div className="admin-class-management">
            <div className="admin-class-management__header">
                <div className="admin-class-management__title">
                    <h1>📋 Quản Lý Lịch Thi</h1>
                    <p>Tạo, sửa, xóa lịch thi cho các lớp học</p>
                </div>
                <div className="admin-class-management__actions">
                    <button onClick={fetchData} className="admin-class-management__btn admin-class-management__btn--secondary">
                        <FiRefreshCw size={16} /> Làm mới
                    </button>
                    <button onClick={openCreateForm} className="admin-class-management__btn admin-class-management__btn--primary">
                        <FiPlus size={16} /> Thêm lịch thi
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="admin-class-management__form-section">
                    <form onSubmit={handleSubmit}>
                        <div className="admin-class-management__form-grid">
                            <select
                                value={formData.idLop}
                                onChange={(e) => setFormData({ ...formData, idLop: Number(e.target.value) })}
                                className="admin-class-management__form-select"
                            >
                                <option value={0}>-- Chọn lớp --</option>
                                {classes.map((c) => (
                                    <option key={c.idLop} value={c.idLop}>
                                        {c.tenLop}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={formData.idPhong}
                                onChange={(e) => setFormData({ ...formData, idPhong: Number(e.target.value) })}
                                className="admin-class-management__form-select"
                            >
                                <option value={0}>-- Chọn phòng thi --</option>
                                {rooms.map((r) => (
                                    <option key={r.idPhong} value={r.idPhong}>
                                        {r.tenPhong}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="date"
                                value={formData.ngayThi}
                                onChange={(e) => setFormData({ ...formData, ngayThi: e.target.value })}
                                className="admin-class-management__form-input"
                            />
                        </div>

                        <div className="admin-class-management__form-actions">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="admin-class-management__form-btn admin-class-management__form-btn--save"
                            >
                                {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo lịch'}
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
                                    <th>Lớp</th>
                                    <th>Phòng</th>
                                    <th>Ngày thi</th>
                                    <th style={{ textAlign: 'center' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedules.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
                                            Chưa có lịch thi nào
                                        </td>
                                    </tr>
                                )}
                                {schedules.map((s) => (
                                    <tr key={s.idLichThi}>
                                        <td>{s.idLichThi}</td>
                                        <td>{getClassName(s.idLop)}</td>
                                        <td>{getRoomName(s.idPhong)}</td>
                                        <td>{s.ngayThi ? new Date(s.ngayThi).toLocaleDateString('vi-VN') : 'N/A'}</td>
                                        <td>
                                            <div className="admin-class-management__action-buttons">
                                                <button
                                                    onClick={() => openEditForm(s)}
                                                    className="admin-class-management__action-btn admin-class-management__action-btn--edit"
                                                >
                                                    <FiEdit2 size={14} /> Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(s.idLichThi)}
                                                    className="admin-class-management__action-btn admin-class-management__action-btn--delete"
                                                >
                                                    <FiTrash2 size={14} /> Xóa
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
