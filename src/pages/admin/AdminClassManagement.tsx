import { useState, useEffect } from 'react'
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi'

interface LopHoc {
    idLop: number
    tenLop: string
    idKhoaHoc: number
    siSoToiDa: number
    soHocVienDangKy: number
    soChoConLai: number
    ngayBatDau: string
    ngayKetThuc: string
    trangThai: string
}

interface KhoaHoc {
    idKhoaHoc: number
    tenKhoaHoc: string
}

const AdminClassManagement = () => {
    const [classes, setClasses] = useState<LopHoc[]>([])
    const [courses, setCourses] = useState<KhoaHoc[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [formData, setFormData] = useState({
        tenLop: '',
        idKhoaHoc: 0,
        siSoToiDa: 30,
        ngayBatDau: '',
        ngayKetThuc: '',
        trangThai: 'Planning'
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [classesRes, coursesRes] = await Promise.all([
                fetch('http://localhost:5025/api/lophoc'),
                fetch('http://localhost:5025/api/khoahoc')
            ])
            const classesData = await classesRes.json()
            const coursesData = await coursesRes.json()

            setClasses(Array.isArray(classesData) ? classesData : [])
            setCourses(Array.isArray(coursesData) ? coursesData : [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const getCourseName = (idKhoaHoc: number) => {
        const course = courses.find(c => c.idKhoaHoc === idKhoaHoc)
        return course ? course.tenKhoaHoc : `ID: ${idKhoaHoc}`
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Xác nhận xóa lớp học này?')) return
        try {
            const token = localStorage.getItem('token')
            await fetch(`http://localhost:5025/api/lophoc/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            fetchData()
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
                ? `http://localhost:5025/api/lophoc/${editingId}`
                : 'http://localhost:5025/api/lophoc'

            await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    idKhoaHoc: parseInt(formData.idKhoaHoc.toString())
                })
            })

            setShowForm(false)
            setEditingId(null)
            setFormData({
                tenLop: '',
                idKhoaHoc: 0,
                siSoToiDa: 30,
                ngayBatDau: '',
                ngayKetThuc: '',
                trangThai: 'Planning'
            })
            fetchData()
        } catch (error) {
            console.error('Error:', error)
            alert('Lỗi: ' + (error instanceof Error ? error.message : 'Unknown error'))
        }
    }

    const handleEdit = (lop: LopHoc) => {
        setFormData({
            tenLop: lop.tenLop,
            idKhoaHoc: lop.idKhoaHoc,
            siSoToiDa: lop.siSoToiDa,
            ngayBatDau: lop.ngayBatDau.split('T')[0],
            ngayKetThuc: lop.ngayKetThuc.split('T')[0],
            trangThai: lop.trangThai
        })
        setEditingId(lop.idLop)
        setShowForm(true)
    }

    const handleCancel = () => {
        setShowForm(false)
        setEditingId(null)
        setFormData({
            tenLop: '',
            idKhoaHoc: 0,
            siSoToiDa: 30,
            ngayBatDau: '',
            ngayKetThuc: '',
            trangThai: 'Planning'
        })
    }

    return (
        <div style={{ maxWidth: '1200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>🏫 Quản Lý Lớp Học</h1>
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
                    <FiPlus size={18} /> Thêm Lớp Học
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
                                placeholder="Tên lớp học"
                                value={formData.tenLop}
                                onChange={(e) => setFormData({ ...formData, tenLop: e.target.value })}
                                required
                                style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px' }}
                            />
                            <select
                                value={formData.idKhoaHoc}
                                onChange={(e) => setFormData({ ...formData, idKhoaHoc: parseInt(e.target.value) })}
                                required
                                style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px' }}
                            >
                                <option value={0}>-- Chọn Khóa Học --</option>
                                {courses.map(course => (
                                    <option key={course.idKhoaHoc} value={course.idKhoaHoc}>
                                        {course.tenKhoaHoc}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                placeholder="Sỹ số tối đa"
                                value={formData.siSoToiDa}
                                onChange={(e) => setFormData({ ...formData, siSoToiDa: parseInt(e.target.value) })}
                                required
                                style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px' }}
                            />
                            <select
                                value={formData.trangThai}
                                onChange={(e) => setFormData({ ...formData, trangThai: e.target.value })}
                                style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px' }}
                            >
                                <option value="Planning">Planning</option>
                                <option value="InProgress">InProgress</option>
                                <option value="Completed">Completed</option>
                            </select>
                            <input
                                type="date"
                                placeholder="Ngày bắt đầu"
                                value={formData.ngayBatDau}
                                onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
                                required
                                style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px' }}
                            />
                            <input
                                type="date"
                                placeholder="Ngày kết thúc"
                                value={formData.ngayKetThuc}
                                onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
                                required
                                style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '14px' }}
                            />
                        </div>
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
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#64748b' }}>Tên Lớp</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#64748b' }}>Khóa Học</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#64748b' }}>Sỹ Số</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#64748b' }}>Đã Đăng Ký</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#64748b' }}>Còn Lại</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', fontSize: '14px', color: '#64748b' }}>Trạng Thái</th>
                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', fontSize: '14px', color: '#64748b' }}>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {classes.map(lop => (
                                <tr key={lop.idLop} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{lop.idLop}</td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{lop.tenLop}</td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{getCourseName(lop.idKhoaHoc)}</td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{lop.siSoToiDa}</td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{lop.soHocVienDangKy}</td>
                                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600', color: lop.soChoConLai > 0 ? '#28a745' : '#dc3545' }}>
                                        {lop.soChoConLai}
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            background: lop.trangThai === 'Planning' ? '#fff3cd' : lop.trangThai === 'InProgress' ? '#d1ecf1' : '#d4edda',
                                            color: lop.trangThai === 'Planning' ? '#856404' : lop.trangThai === 'InProgress' ? '#0c5460' : '#155724',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {lop.trangThai}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button
                                            onClick={() => handleEdit(lop)}
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
                                            onClick={() => handleDelete(lop.idLop)}
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

export default AdminClassManagement
