import { useState, useEffect } from 'react'
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi'

interface KhoaHoc {
    idKhoaHoc: number
    tenKhoaHoc: string
    thoiLuong: number
    hocPhi: number
    moTa: string
    anhDaiDien: string
    trangThai: string
}

const AdminCourseManagement = () => {
    const [courses, setCourses] = useState<KhoaHoc[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [formData, setFormData] = useState({
        tenKhoaHoc: '',
        thoiLuong: 0,
        hocPhi: 0,
        moTa: '',
        anhDaiDien: '',
        trangThai: 'Active'
    })

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        try {
            const response = await fetch('http://localhost:5025/api/khoahoc')
            const data = await response.json()
            setCourses(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Xác nhận xóa khóa học này?')) return
        try {
            const token = localStorage.getItem('token')
            await fetch(`http://localhost:5025/api/khoahoc/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            fetchCourses()
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const token = localStorage.getItem('token')
            const method = editingId ? 'PUT' : 'POST'
            const url = editingId
                ? `http://localhost:5025/api/khoahoc/${editingId}`
                : 'http://localhost:5025/api/khoahoc'

            await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            })

            setShowForm(false)
            setEditingId(null)
            setFormData({
                tenKhoaHoc: '',
                thoiLuong: 0,
                hocPhi: 0,
                moTa: '',
                anhDaiDien: '',
                trangThai: 'Active'
            })
            fetchCourses()
        } catch (error) {
            console.error('Error:', error)
        }
    }

    const handleEdit = (course: KhoaHoc) => {
        setFormData({
            tenKhoaHoc: course.tenKhoaHoc,
            thoiLuong: course.thoiLuong,
            hocPhi: course.hocPhi,
            moTa: course.moTa,
            anhDaiDien: course.anhDaiDien,
            trangThai: course.trangThai
        })
        setEditingId(course.idKhoaHoc)
        setShowForm(true)
    }

    const handleCancel = () => {
        setShowForm(false)
        setEditingId(null)
        setFormData({
            tenKhoaHoc: '',
            thoiLuong: 0,
            hocPhi: 0,
            moTa: '',
            anhDaiDien: '',
            trangThai: 'Active'
        })
    }

    return (
        <div style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>📚 Quản Lý Khóa Học</h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 16px',
                        background: '#0366d6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '14px'
                    }}
                >
                    <FiPlus size={18} /> Thêm Khóa Học
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    marginBottom: '30px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <input
                                type="text"
                                placeholder="Tên khóa học"
                                value={formData.tenKhoaHoc}
                                onChange={(e) => setFormData({ ...formData, tenKhoaHoc: e.target.value })}
                                required
                                style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px' }}
                            />
                            <input
                                type="number"
                                placeholder="Thời lượng (giờ)"
                                value={formData.thoiLuong}
                                onChange={(e) => setFormData({ ...formData, thoiLuong: parseInt(e.target.value) })}
                                required
                                style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px' }}
                            />
                            <input
                                type="number"
                                placeholder="Học phí (VND)"
                                value={formData.hocPhi}
                                onChange={(e) => setFormData({ ...formData, hocPhi: parseInt(e.target.value) })}
                                required
                                style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px' }}
                            />
                            <select
                                value={formData.trangThai}
                                onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                                style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px' }}
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <textarea
                            placeholder="Mô tả khóa học"
                            value={formData.moTa}
                            onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                            required
                            style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px', marginBottom: '16px', minHeight: '80px' }}
                        />
                        <input
                            type="text"
                            placeholder="Tên ảnh đại diện (vd: flutter_basic.png)"
                            value={formData.anhDaiDien}
                            onChange={(e) => setFormData({ ...formData, anhDaiDien: e.target.value })}
                            style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px', marginBottom: '16px' }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                type="submit"
                                style={{
                                    padding: '10px 16px',
                                    background: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px'
                                }}
                            >
                                {editingId ? 'Cập Nhật' : 'Thêm'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                style={{
                                    padding: '10px 16px',
                                    background: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px'
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Table */}
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#64748b' }}>ID</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#64748b' }}>Tên Khóa Học</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#64748b' }}>Thời Lượng</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#64748b' }}>Học Phí</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#64748b' }}>Trạng Thái</th>
                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', fontSize: '14px', color: '#64748b' }}>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(course => (
                                <tr key={course.idKhoaHoc} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{course.idKhoaHoc}</td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{course.tenKhoaHoc}</td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{course.thoiLuong} giờ</td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{course.hocPhi.toLocaleString()} VND</td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            background: course.trangThai === 'Active' ? '#d4edda' : '#f8d7da',
                                            color: course.trangThai === 'Active' ? '#155724' : '#721c24',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {course.trangThai}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => handleEdit(course)}
                                            style={{
                                                padding: '6px 10px',
                                                background: '#0366d6',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '12px'
                                            }}
                                        >
                                            <FiEdit2 size={14} /> Sửa
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course.idKhoaHoc)}
                                            style={{
                                                padding: '6px 10px',
                                                background: '#dc3545',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                fontSize: '12px'
                                            }}
                                        >
                                            <FiTrash2 size={14} /> Xóa
                                        </button>
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
