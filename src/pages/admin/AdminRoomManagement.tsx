import { useEffect, useState } from 'react'
import { FiEdit2, FiTrash2, FiPlus, FiRefreshCw } from 'react-icons/fi'
import axiosClient from '../../services/axiosClient'
import '../../styles/admin-class-management.css'

type PhongThi = {
    idPhong: number
    tenPhong: string
    soLuong: number
}

const defaultForm = {
    tenPhong: '',
    soLuong: 0,
}

export default function AdminRoomManagement() {
    const [rooms, setRooms] = useState<PhongThi[]>([])
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
            const res = await axiosClient.get('/phongthi')
            setRooms(Array.isArray(res.data) ? res.data : [])
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

    const openEditForm = (room: PhongThi) => {
        setEditingId(room.idPhong)
        setFormData({
            tenPhong: room.tenPhong,
            soLuong: room.soLuong || 0,
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

        if (!formData.tenPhong.trim()) {
            alert('Vui lòng nhập tên phòng thi')
            return
        }
        if (formData.soLuong <= 0) {
            alert('Vui lòng nhập số chỗ ngồi')
            return
        }

        try {
            setSubmitting(true)
            const payload = {
                tenPhong: formData.tenPhong,
                soLuong: formData.soLuong,
            }

            if (editingId) {
                await axiosClient.put(`/phongthi/${editingId}`, payload)
            } else {
                await axiosClient.post('/phongthi', payload)
            }

            alert(editingId ? 'Cập nhật phòng thi thành công' : 'Tạo phòng thi thành công')
            resetForm()
            await fetchData()
        } catch (err: any) {
            console.error(err)
            alert(err?.response?.data?.message || 'Lỗi khi lưu phòng thi')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Xác nhận xóa phòng thi này?')) return

        try {
            await axiosClient.delete(`/phongthi/${id}`)
            alert('Xóa phòng thi thành công')
            await fetchData()
        } catch (err: any) {
            console.error(err)
            alert(err?.response?.data?.message || 'Không thể xóa phòng thi')
        }
    }

    return (
        <div className="admin-class-management">
            <div className="admin-class-management__header">
                <div className="admin-class-management__title">
                    <h1>🏛️ Quản Lý Phòng Thi</h1>
                    <p>Tạo, sửa, xóa phòng thi cho các kỳ thi</p>
                </div>
                <div className="admin-class-management__actions">
                    <button onClick={fetchData} className="admin-class-management__btn admin-class-management__btn--secondary">
                        <FiRefreshCw size={16} /> Làm mới
                    </button>
                    <button onClick={openCreateForm} className="admin-class-management__btn admin-class-management__btn--primary">
                        <FiPlus size={16} /> Thêm phòng thi
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="admin-class-management__form-section">
                    <form onSubmit={handleSubmit}>
                        <div className="admin-class-management__form-grid">
                            <input
                                type="text"
                                placeholder="Tên phòng thi (vd: Phòng A1, Phòng B2)"
                                value={formData.tenPhong}
                                onChange={(e) => setFormData({ ...formData, tenPhong: e.target.value })}
                                className="admin-class-management__form-input"
                            />

                            <input
                                type="number"
                                placeholder="Số chỗ ngồi"
                                min="1"
                                value={formData.soLuong}
                                onChange={(e) => setFormData({ ...formData, soLuong: Number(e.target.value) })}
                                className="admin-class-management__form-input"
                            />
                        </div>

                        <div className="admin-class-management__form-actions">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="admin-class-management__form-btn admin-class-management__form-btn--save"
                            >
                                {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo phòng'}
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
                                    <th>Tên Phòng</th>
                                    <th>Số Chỗ Ngồi</th>
                                    <th style={{ textAlign: 'center' }}>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>
                                            Chưa có phòng thi nào
                                        </td>
                                    </tr>
                                )}
                                {rooms.map((room) => (
                                    <tr key={room.idPhong}>
                                        <td>{room.idPhong}</td>
                                        <td>{room.tenPhong}</td>
                                        <td>{room.soLuong}</td>
                                        <td>
                                            <div className="admin-class-management__action-buttons">
                                                <button
                                                    onClick={() => openEditForm(room)}
                                                    className="admin-class-management__action-btn admin-class-management__action-btn--edit"
                                                >
                                                    <FiEdit2 size={14} /> Sửa
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(room.idPhong)}
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
