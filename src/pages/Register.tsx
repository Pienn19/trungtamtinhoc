import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '../services/authService'
import { type RegisterDTO } from '../types/Auth'
import { toast } from 'react-toastify'

const Register = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState<RegisterDTO>({
    tenDangNhap: '',
    matKhau: '',
    hoTen: '',
    email: '',
    dienThoai: '',
  })

  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const validateForm = () => {
    if (!form.tenDangNhap.trim()) {
      toast.error('Vui lòng nhập tên đăng nhập')
      return false
    }
    if (!form.matKhau || form.matKhau.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return false
    }
    if (form.matKhau !== confirmPassword) {
      toast.error('Xác nhận mật khẩu không khớp')
      return false
    }
    if (!form.hoTen?.trim()) {
      toast.error('Vui lòng nhập họ tên')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)

    try {
      await register(form)
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      setTimeout(() => {
        navigate('/dang-nhap')
      }, 2000)
    } catch (err: any) {
      console.error('Register error:', err)
      toast.error(err.response?.data?.message || 'Đăng ký thất bại! Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-shell" style={{ minHeight: 'calc(100vh - 120px)', display: 'grid', alignItems: 'center' }}>
      <div className="surface-card" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.9fr)', overflow: 'hidden' }}>
        <div style={{
          padding: '42px',
          backgroundImage: "linear-gradient(135deg, rgba(15,76,129,0.85) 0%, rgba(11,120,179,0.85) 100%), url('/images/register.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: '#fff'
        }}>
          <div className="muted-pill" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>Tạo tài khoản</div>
          <h1 style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', margin: '14px 0 12px', lineHeight: 1.05 }}>Tham gia hệ thống học tập ngay hôm nay</h1>
          <p style={{ maxWidth: 540, lineHeight: 1.8, color: 'rgba(255,255,255,0.9)' }}>
            Đăng ký để quản lý lớp học, theo dõi học phí, nhận thông báo và sử dụng toàn bộ tính năng của trung tâm.
          </p>
          <div style={{ display: 'grid', gap: 12, marginTop: 26 }}>
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.10)' }}>Hồ sơ học viên rõ ràng và an toàn</div>
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.10)' }}>Đăng ký lớp, thanh toán và chứng chỉ online</div>
          </div>
        </div>

        <div style={{ padding: '42px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', color: '#0f172a' }}>Đăng ký</h2>
          <p style={{ color: '#64748b', marginBottom: '28px' }}>Tạo tài khoản mới chỉ trong vài bước.</p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            <input className="auth-input" type="text" name="tenDangNhap" placeholder="Tên đăng nhập" value={form.tenDangNhap} onChange={handleChange} required disabled={isLoading} />
            <input className="auth-input" type="text" name="hoTen" placeholder="Họ tên" value={form.hoTen || ''} onChange={handleChange} required disabled={isLoading} />
            <input className="auth-input" type="email" name="email" placeholder="Email" value={form.email || ''} onChange={handleChange} disabled={isLoading} />
            <input
              className="auth-input"
              type="tel"
              name="dienThoai"
              placeholder="Số điện thoại"
              value={form.dienThoai || ''}
              onChange={handleChange}
              disabled={isLoading}
              style={{ padding: '13px 14px', border: '1.5px solid #cfe0ee', borderRadius: 12, width: '100%', boxSizing: 'border-box' }}
            />
            <input className="auth-input" type="password" name="matKhau" placeholder="Mật khẩu" value={form.matKhau} onChange={handleChange} required disabled={isLoading} />
            <input className="auth-input" type="password" placeholder="Xác nhận mật khẩu" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={isLoading} />

            <button type="submit" disabled={isLoading} className="auth-button">
              {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '18px', color: '#64748b' }}>
            Đã có tài khoản? <a href="/dang-nhap" style={{ color: '#0b78b3', fontWeight: 700 }}>Đăng nhập ngay</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register