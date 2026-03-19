import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import { type LoginDTO } from "../types/Auth";

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
      localStorage.setItem("token", res.token);
      localStorage.setItem("username", form.tenDangNhap);
      alert("Đăng nhập thành công!");
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    } catch (err) {
      setError("Sai tài khoản hoặc mật khẩu!");
    }
  };

  const handleGoogleLogin = () => {
    // Sau này gắn logic Google OAuth ở đây
    alert("Chức năng đăng nhập Google đang được phát triển!");
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
    },
    leftPanel: {
      flex: 1,
      background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
      color: "white",
      padding: "60px 40px",
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center" as const,
      position: "relative" as const,
    },
    illustration: {
      width: "80%",
      maxWidth: "420px",
      borderRadius: "16px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
      background: "#334155",
      height: "320px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.2rem",
      color: "#94a3b8",
    },
    rightPanel: {
      flex: 1,
      padding: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "white",
    },
    formBox: {
      width: "100%",
      maxWidth: "420px",
    },
    title: {
      fontSize: "2.25rem",
      fontWeight: "bold",
      marginBottom: "12px",
      color: "#1e293b",
    },
    subtitle: {
      color: "#64748b",
      marginBottom: "32px",
    },
    input: {
      width: "100%",
      padding: "14px 16px",
      marginBottom: "16px",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontSize: "1rem",
      outline: "none",
      transition: "border-color 0.2s",
      background: "#f8fafc",
    },
    button: {
      width: "100%",
      padding: "14px",
      background: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: "8px",
      fontSize: "1.05rem",
      fontWeight: "600",
      cursor: "pointer",
      marginTop: "12px",
      transition: "background 0.2s",
    },
    googleButton: {
      width: "100%",
      padding: "14px",
      background: "#ffffff",
      color: "#1e293b",
      border: "1px solid #cbd5e1",
      borderRadius: "8px",
      fontSize: "1.05rem",
      fontWeight: "500",
      cursor: "pointer",
      marginTop: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
    },
    error: {
      color: "#ef4444",
      marginBottom: "16px",
      textAlign: "center" as const,
    },
  };

  return (
    <div style={styles.container}>
      {/* Bên trái - Illustration */}
      <div style={styles.leftPanel}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "24px" }}>
          Trung Tâm Tin Học
        </h1>
        <p style={{ fontSize: "1.2rem", maxWidth: "380px", marginBottom: "40px" }}>
          Nơi bắt đầu hành trình học lập trình và tin học chuyên sâu của bạn
        </p>
        <div style={styles.illustration}>
          {/* Bạn có thể thay bằng <img src="..." /> sau */}
          <img
            src="/images/login.jpg" 
            style={{
              width: "100%",
              maxWidth: "auto",
              height: "100%",
              borderRadius: "16px",
              boxShadow: "0 20px 40px rgba(35, 76, 207, 0.3)",
            }}
          />
        </div>
      </div>

      {/* Bên phải - Form */}
      <div style={styles.rightPanel}>
        <div style={styles.formBox}>
          <h2 style={styles.title}>Đăng nhập</h2>
          <p style={styles.subtitle}>Chào mừng bạn quay lại!</p>

          {error && <p style={styles.error}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <input
              style={styles.input}
              type="text"
              name="tenDangNhap"
              placeholder="Tên đăng nhập hoặc email"
              value={form.tenDangNhap}
              onChange={handleChange}
              required
            />

            <input
              style={styles.input}
              type="password"
              name="matKhau"
              placeholder="Mật khẩu"
              value={form.matKhau}
              onChange={handleChange}
              required
            />

            <button type="submit" style={styles.button}>
              Đăng nhập
            </button>
          </form>

          <button style={styles.googleButton} onClick={handleGoogleLogin}>
            <span style={{ fontSize: "1.3rem" }}>G</span> Đăng nhập với Google
          </button>

          <p style={{ textAlign: "center", marginTop: "24px", color: "#64748b" }}>
            Chưa có tài khoản?{" "}
            <a href="/dang-ky" style={{ color: "#2563eb", fontWeight: "600" }}>
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;