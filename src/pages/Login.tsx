import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { login, forgotPassword } from "../services/authService";
import { type LoginDTO } from "../types/Auth";
import { normalizeUserRole } from "../utils/authHelper";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginDTO>({
    tenDangNhap: "",
    matKhau: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.tenDangNhap.trim()) {
      toast.error("Vui lòng nhập tên đăng nhập");
      return;
    }

    if (!form.matKhau.trim()) {
      toast.error("Vui lòng nhập mật khẩu");
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(form);
      console.log("Login response:", res);

      localStorage.setItem("token", res.token);
      localStorage.setItem("username", form.tenDangNhap);

      try {
        const decoded: any = jwtDecode(res.token);
        console.log("Decoded JWT:", decoded);
        console.log("All JWT properties:", Object.keys(decoded));

        localStorage.setItem("userId", String(decoded.UserId || decoded.userId || ""));

        const roleClaim = decoded.role || decoded.Role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";
        const selectedRole = Array.isArray(roleClaim)
          ? roleClaim.find((value: string) => normalizeUserRole(value)) || roleClaim[0] || ""
          : roleClaim;
        const role = normalizeUserRole(String(selectedRole)) || String(selectedRole);

        console.log("User role:", role);
        localStorage.setItem("userRole", String(role));
      } catch (decodeError) {
        console.error("Error decoding JWT:", decodeError);
      }

      toast.success("Đăng nhập thành công!");
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Sai tài khoản hoặc mật khẩu!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const username = window.prompt("Vui lòng nhập Tên đăng nhập hoặc Email của bạn:");
    if (!username || !username.trim()) return;

    try {
      const res = await forgotPassword(username.trim());
      toast.success(res.message || "Đặt lại mật khẩu thành công");
      alert(res.message || "Mật khẩu của bạn đã được đặt lại.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể yêu cầu đặt lại mật khẩu!");
    }
  };

  return (
    <div className="page-shell" style={{ minHeight: 'calc(100vh - 120px)', display: 'grid', alignItems: 'center' }}>
      <div className="surface-card" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.9fr)', overflow: 'hidden' }}>
        <div style={{
          padding: '42px',
          backgroundImage: "linear-gradient(135deg, rgba(15,76,129,0.85) 0%, rgba(11,120,179,0.85) 100%), url('/images/login.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: '#fff'
        }}>
          <div className="muted-pill" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>Đăng nhập hệ thống</div>
          <h1 style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', margin: '14px 0 12px', lineHeight: 1.05 }}>Chào mừng bạn quay lại</h1>
          <p style={{ maxWidth: 540, lineHeight: 1.8, color: 'rgba(255,255,255,0.9)' }}>
            Truy cập tài khoản để đăng ký lớp học, theo dõi thanh toán, xem lịch học và nhận thông báo từ hệ thống.
          </p>
          <div style={{ display: 'grid', gap: 12, marginTop: 26 }}>
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.10)' }}>Quản lý tài khoản học viên và giảng viên</div>
            <div style={{ padding: 16, borderRadius: 16, background: 'rgba(255,255,255,0.10)' }}>Đăng ký khóa học, thanh toán, chứng chỉ</div>
          </div>
        </div>

        <div style={{ padding: '42px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px', color: '#0f172a' }}>Đăng nhập</h2>
          <p style={{ color: '#64748b', marginBottom: '28px' }}>Nhập thông tin đăng nhập để tiếp tục.</p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14 }}>
            <input className="auth-input" type="text" name="tenDangNhap" placeholder="Tên đăng nhập" value={form.tenDangNhap} onChange={handleChange} required disabled={isLoading} />
            <input className="auth-input" type="password" name="matKhau" placeholder="Mật khẩu" value={form.matKhau} onChange={handleChange} required disabled={isLoading} />

            <div style={{ textAlign: 'right', marginTop: '-4px', marginBottom: '8px' }}>
              <span 
                onClick={handleForgotPassword} 
                style={{ color: '#0b78b3', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 600 }}
              >
                Quên mật khẩu?
              </span>
            </div>

            <button type="submit" disabled={isLoading} className="auth-button">
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '18px', color: '#64748b' }}>
            Chưa có tài khoản? <a href="/dang-ky" style={{ color: '#0b78b3', fontWeight: 700 }}>Đăng ký ngay</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;