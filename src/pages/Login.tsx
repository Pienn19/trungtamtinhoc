import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { type LoginDTO } from "../types/Auth";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<LoginDTO>({
    tenDangNhap: "",
    matKhau: "",
  });

  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(form);
      console.log("Login response:", res);

      localStorage.setItem("token", res.token);
      localStorage.setItem("username", form.tenDangNhap);

      // Decode JWT để lấy userId và role
      try {
        const decoded: any = jwtDecode(res.token);
        console.log("Decoded JWT:", decoded);
        console.log("All JWT properties:", Object.keys(decoded));

        localStorage.setItem("userId", decoded.UserId || decoded.userId || "");

        // JWT role claim có thể là "role" hoặc từ tên vai trò
        const role = decoded.role || decoded.Role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || "";
        console.log("User role:", role);
        localStorage.setItem("userRole", role);
      } catch (decodeError) {
        console.error("Error decoding JWT:", decodeError);
      }

      alert("Đăng nhập thành công!");
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      console.error("Error response:", err.response?.data);
      setError("Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ maxWidth: "450px", width: "100%", background: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "12px", color: "#1e293b", textAlign: "center" }}>Đăng nhập</h1>
        <p style={{ color: "#64748b", marginBottom: "32px", textAlign: "center" }}>Chào mừng bạn quay lại!</p>

        {error && <div style={{ color: "#ef4444", background: "#fee2e2", padding: "12px", borderRadius: "6px", marginBottom: "16px" }}>{error}</div>}

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
            style={{ width: "100%", padding: "12px", marginBottom: "20px", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "1rem", boxSizing: "border-box" }}
            type="password"
            name="matKhau"
            placeholder="Mật khẩu"
            value={form.matKhau}
            onChange={handleChange}
            required
          />

          <button type="submit" style={{ width: "100%", padding: "12px", background: "#2563eb", color: "white", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: "600", cursor: "pointer" }}>
            Đăng nhập
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#64748b" }}>
          Chưa có tài khoản? <a href="/dang-ky" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "600" }}>Đăng ký ngay</a>
        </p>
      </div>
    </div>
  );
};

export default Login;