import { useState, useEffect } from 'react'
import type { UserDTO, CreateUserDTO, UpdateUserDTO } from '../../types/Auth'
import { getAllUsers, getUserById, createUser, updateUser, toggleUserStatus, resetUserPassword } from '../../services/adminUserService'
import '../../styles/AdminUserManagement.css'

type FormMode = 'list' | 'create' | 'edit'

export default function AdminUserManagement() {
    const [users, setUsers] = useState<UserDTO[]>([])
    const [loading, setLoading] = useState(false)
    const [formMode, setFormMode] = useState<FormMode>('list')
    const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    // Form state
    const [formData, setFormData] = useState<CreateUserDTO & UpdateUserDTO>({
        tenDangNhap: '',
        matKhau: '',
        hoTen: '',
        email: '',
        dienThoai: '',
        idVaiTro: 2
    })

    const [resetPasswordModal, setResetPasswordModal] = useState(false)
    const [resetPasswordUser, setResetPasswordUser] = useState<UserDTO | null>(null)
    const [newPassword, setNewPassword] = useState('')

    const loadUsers = async () => {
        try {
            setLoading(true)
            const data = await getAllUsers()
            setUsers(data)
            setError('')
        } catch (err) {
            setError('Không thể tải danh sách người dùng')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadUsers()
    }, [])

    const handleCreateClick = () => {
        setFormData({
            tenDangNhap: '',
            matKhau: '',
            hoTen: '',
            email: '',
            dienThoai: '',
            idVaiTro: 2
        })
        setSelectedUser(null)
        setFormMode('create')
        setMessage('')
        setError('')
    }

    const handleEditClick = async (user: UserDTO) => {
        try {
            const fullData = await getUserById(user.idTaiKhoan)
            setSelectedUser(fullData)
            setFormData({
                tenDangNhap: fullData.tenDangNhap,
                matKhau: '',
                hoTen: fullData.hoTen,
                email: fullData.email,
                dienThoai: fullData.dienThoai,
                idVaiTro: 2
            })
            setFormMode('edit')
            setMessage('')
            setError('')
        } catch (err) {
            setError('Không thể tải thông tin người dùng')
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData((prev: CreateUserDTO & UpdateUserDTO) => ({
            ...prev,
            [name]: name === 'idVaiTro' ? parseInt(value) : value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')

        try {
            if (formMode === 'create') {
                if (!formData.tenDangNhap || !formData.matKhau || !formData.hoTen) {
                    setError('Vui lòng điền đủ thông tin bắt buộc')
                    return
                }
                if (formData.matKhau.length < 6) {
                    setError('Mật khẩu phải có ít nhất 6 ký tự')
                    return
                }
                await createUser(formData as CreateUserDTO)
                setMessage('Tạo người dùng thành công!')
            } else if (formMode === 'edit' && selectedUser) {
                const updateData: UpdateUserDTO = {
                    hoTen: formData.hoTen,
                    email: formData.email,
                    dienThoai: formData.dienThoai,
                    idVaiTro: formData.idVaiTro
                }
                await updateUser(selectedUser.idTaiKhoan, updateData)
                setMessage('Cập nhật người dùng thành công!')
            }

            setTimeout(() => {
                setFormMode('list')
                loadUsers()
            }, 1500)
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra')
        }
    }

    const handleToggleStatus = async (user: UserDTO) => {
        const newStatus = !user.trangThai
        const statusText = newStatus ? 'kích hoạt' : 'khóa'
        const confirmText = `Bạn chắc chắn muốn ${statusText} người dùng ${user.tenDangNhap}?`

        if (!window.confirm(confirmText)) return

        try {
            await toggleUserStatus(user.idTaiKhoan, newStatus)
            setMessage(`Người dùng đã được ${statusText} thành công`)
            loadUsers()
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra')
        }
    }

    const handleResetPassword = async () => {
        if (!resetPasswordUser || !newPassword) {
            setError('Vui lòng nhập mật khẩu mới')
            return
        }
        if (newPassword.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }

        try {
            await resetUserPassword(resetPasswordUser.idTaiKhoan, newPassword)
            setMessage('Đặt lại mật khẩu thành công!')
            setResetPasswordModal(false)
            setResetPasswordUser(null)
            setNewPassword('')
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra')
        }
    }

    if (loading && formMode === 'list') {
        return <div className="admin-container"><p>Đang tải...</p></div>
    }

    return (
        <div className="admin-container">
            {error && <div className="alert alert-error">{error}</div>}
            {message && <div className="alert alert-success">{message}</div>}

            {formMode === 'list' ? (
                <>
                    <div className="admin-header">
                        <h1>Quản Lý Người Dùng</h1>
                        <button className="btn btn-primary" onClick={handleCreateClick}>
                            + Tạo Người Dùng Mới
                        </button>
                    </div>

                    <div className="table-responsive">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Tên Đăng Nhập</th>
                                    <th>Họ Tên</th>
                                    <th>Email</th>
                                    <th>Điện Thoại</th>
                                    <th>Vai Trò</th>
                                    <th>Trạng Thái</th>
                                    <th>Hành Động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.idTaiKhoan}>
                                        <td>{user.idTaiKhoan}</td>
                                        <td>{user.tenDangNhap}</td>
                                        <td>{user.hoTen}</td>
                                        <td>{user.email}</td>
                                        <td>{user.dienThoai}</td>
                                        <td><span className="badge">{user.tenVaiTro}</span></td>
                                        <td>
                                            <span className={`status-badge ${user.trangThai ? 'active' : 'inactive'}`}>
                                                {user.trangThai ? 'Hoạt động' : 'Khóa'}
                                            </span>
                                        </td>
                                        <td className="actions">
                                            <button
                                                className="btn btn-sm btn-edit"
                                                onClick={() => handleEditClick(user)}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                className={`btn btn-sm ${user.trangThai ? 'btn-lock' : 'btn-unlock'}`}
                                                onClick={() => handleToggleStatus(user)}
                                            >
                                                {user.trangThai ? 'Khóa' : 'Mở Khóa'}
                                            </button>
                                            <button
                                                className="btn btn-sm btn-reset"
                                                onClick={() => {
                                                    setResetPasswordUser(user)
                                                    setResetPasswordModal(true)
                                                    setNewPassword('')
                                                    setError('')
                                                }}
                                            >
                                                Reset MK
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            ) : (
                <>
                    <div className="form-header">
                        <h2>{formMode === 'create' ? 'Tạo Người Dùng Mới' : 'Chỉnh Sửa Người Dùng'}</h2>
                        <button className="btn btn-secondary" onClick={() => setFormMode('list')}>
                            ← Quay Lại
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="admin-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Tên Đăng Nhập *</label>
                                <input
                                    type="text"
                                    name="tenDangNhap"
                                    value={formData.tenDangNhap}
                                    onChange={handleInputChange}
                                    disabled={formMode === 'edit'}
                                    required
                                />
                            </div>

                            {formMode === 'create' && (
                                <div className="form-group">
                                    <label>Mật Khẩu *</label>
                                    <input
                                        type="password"
                                        name="matKhau"
                                        value={formData.matKhau}
                                        onChange={handleInputChange}
                                        placeholder="Ít nhất 6 ký tự"
                                        required
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Họ Tên *</label>
                                <input
                                    type="text"
                                    name="hoTen"
                                    value={formData.hoTen}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Điện Thoại</label>
                                <input
                                    type="tel"
                                    name="dienThoai"
                                    value={formData.dienThoai}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Vai Trò</label>
                                <select
                                    name="idVaiTro"
                                    value={formData.idVaiTro}
                                    onChange={handleInputChange}
                                >
                                    <option value={2}>Học viên</option>
                                    <option value={1}>Quản trị viên</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => setFormMode('list')}>
                                Hủy
                            </button>
                            <button type="submit" className="btn btn-primary">
                                {formMode === 'create' ? 'Tạo' : 'Cập Nhật'}
                            </button>
                        </div>
                    </form>
                </>
            )}

            {/* Reset Password Modal */}
            {resetPasswordModal && resetPasswordUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Đặt Lại Mật Khẩu</h3>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setResetPasswordModal(false)
                                    setResetPasswordUser(null)
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="modal-body">
                            <p>Người dùng: <strong>{resetPasswordUser.tenDangNhap}</strong></p>
                            <div className="form-group">
                                <label>Mật Khẩu Mới *</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Ít nhất 6 ký tự"
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setResetPasswordModal(false)
                                    setResetPasswordUser(null)
                                    setNewPassword('')
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleResetPassword}
                            >
                                Đặt Lại Mật Khẩu
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
