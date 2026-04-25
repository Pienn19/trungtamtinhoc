import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import { type RegisterDTO } from "../types/Auth";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterDTO>({
    tenDangNhap: "",
    matKhau: "",
    hoTen: "",
    email: "",
    dienThoai: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!form.tenDangNhap.trim()) {
      setError("Vui lòng nhập tên đăng nhập");
      return false;
    }
    if (!form.matKhau || form.matKhau.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    if (form.matKhau !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp");
      return false;
    }
    if (!form.hoTen?.trim()) {
      setError("Vui lòng nhập họ tên");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    try {
      await register(form);
      setSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
      setTimeout(() => {
        navigate("/dang-nhap");
      }, 2000);
    } catch (err: any) {
      console.error("Register error:", err);
      setError(err.response?.data?.message || "Đăng ký thất bại! Vui lòng thử lại.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: "450px", width: "100%", background: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "12px", color: "#1e293b", textAlign: "center" }}>Đăng ký</h1>
        <p style={{ color: "#64748b", marginBottom: "32px", textAlign: "center" }}>Tạo tài khoản miễn phí</p>

        {error && <div style={{ color: "#ef4444", background: "#fee2e2", padding: "12px", borderRadius: "6px", marginBottom: "16px" }}>{error}</div>}
        {success && <div style={{ color: "#16a34a", background: "#dcfce7", padding: "12px", borderRadius: "6px", marginBottom: "16px" }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <input
            style={{ width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "1rem", boxSizing: "border-box" }}
            type="text"
            name="tenDangNhap"
            placeholder="Tên đăng nhập"
            value={form.tenDangNhap}
            onChange={handleChange}
            required
          />

          <input
            style={{ width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "1rem", boxSizing: "border-box" }}
            type="text"
            name="hoTen"
            placeholder="Họ tên"
            value={form.hoTen || ""}
            onChange={handleChange}
            required
          />

          <input
            style={{ width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "1rem", boxSizing: "border-box" }}
            type="email"
            name="email"
            placeholder="Email"
            value={form.email || ""}
            onChange={handleChange}
          />

          <input
            style={{ width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "1rem", boxSizing: "border-box" }}
            type="tel"
            name="dienThoai"
            placeholder="Số điện thoại"
            value={form.dienThoai || ""}
            onChange={handleChange}
          />

          <input
            style={{ width: "100%", padding: "12px", marginBottom: "12px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "1rem", boxSizing: "border-box" }}
            type="password"
            name="matKhau"
            placeholder="Mật khẩu"
            value={form.matKhau}
            onChange={handleChange}
            required
          />

          <input
            style={{ width: "100%", padding: "12px", marginBottom: "20px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "1rem", boxSizing: "border-box" }}
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" style={{ width: "100%", padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: "600", cursor: "pointer" }}>
            Tạo tài khoản
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#64748b" }}>
          Đã có tài khoản? <a href="/dang-nhap" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "600" }}>Đăng nhập</a>
        </p>
      </div>
    </div>
  );
};

export default Register;