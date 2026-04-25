import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { logout } from "../services/authService";

const Header = () => {
  const [username, setUsername] = useState<string | null>(localStorage.getItem("username"));
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem("userRole"));
  const [showDropdown, setShowDropdown] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const handleStorageChange = () => {
      const user = localStorage.getItem("username");
      const role = localStorage.getItem("userRole");
      setUsername(user);
      setUserRole(role);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUsername(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn logout ở frontend ngay cả khi backend gặp lỗi
      setUsername(null);
      window.location.href = "/";
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Mật khẩu mới không khớp");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      const { changePassword } = await import("../services/authService");
      await changePassword(
        passwordForm.oldPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      setPasswordSuccess("Thay đổi mật khẩu thành công!");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        setShowChangePassword(false);
      }, 2000);
    } catch (error: any) {
      setPasswordError(
        error.response?.data?.message || "Thay đổi mật khẩu thất bại"
      );
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.headerContent}>
          <h2 style={styles.logo}>Trung Tâm Tin Học PyTech</h2>

          <nav style={styles.nav}>
            <Link
              to="/"
              style={styles.link}
            >
              Trang chủ
            </Link>

            <Link
              to="/khoa-hoc"
              style={styles.link}
            >
              Khóa Học
            </Link>

            {username && (
              <Link
                to="/my-registrations"
                style={styles.link}
              >
                Lớp Của Tôi
              </Link>
            )}

            {username ? (
              <div style={{ position: "relative" }}>
                <button
                  style={{
                    ...styles.userBtn,
                    background: showDropdown ? "#334155" : "transparent",
                  }}
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  👤 {username} ▼
                </button>

                {showDropdown && (
                  <div style={styles.dropdown}>
                    {userRole === "Admin" && (
                      <a
                        href="/admin"
                        style={{
                          ...styles.dropdownItem,
                          color: "#0066cc",
                          textDecoration: "none",
                          display: "block",
                        }}
                      >
                        ⚙️ Admin Panel
                      </a>
                    )}
                    <button
                      style={styles.dropdownItem}
                      onClick={() => {
                        setShowChangePassword(true);
                        setShowDropdown(false);
                      }}
                    >
                      Đổi mật khẩu
                    </button>
                    <button
                      style={{
                        ...styles.dropdownItem,
                        color: "#ef4444",
                        borderTop: "1px solid #475569",
                      }}
                      onClick={handleLogout}
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/dang-ky" style={styles.link}>
                  Đăng ký
                </Link>
                <Link
                  to="/dang-nhap"
                  style={styles.link}
                >
                  Đăng nhập
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Modal Đổi Mật Khẩu */}
      {showChangePassword && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3>Đổi mật khẩu</h3>
              <button
                style={styles.closeBtn}
                onClick={() => setShowChangePassword(false)}
              >
                ✕
              </button>
            </div>

            {passwordError && (
              <p style={styles.error}>{passwordError}</p>
            )}
            {passwordSuccess && (
              <p style={styles.success}>{passwordSuccess}</p>
            )}

            <form onSubmit={handleChangePassword} style={styles.form}>
              <input
                type="password"
                placeholder="Mật khẩu cũ"
                value={passwordForm.oldPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    oldPassword: e.target.value,
                  })
                }
                style={styles.input}
                required
              />
              <input
                type="password"
                placeholder="Mật khẩu mới"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                style={styles.input}
                required
              />
              <input
                type="password"
                placeholder="Xác nhận mật khẩu mới"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                style={styles.input}
                required
              />

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  style={styles.cancelBtn}
                >
                  Hủy
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

const styles = {
  header: {
    background: "#1e293b",
    color: "white",
    padding: "16px 0",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
    position: "sticky" as const,
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: "1.75rem",
    fontWeight: "700",
    margin: 0,
  },
  nav: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  link: {
    color: "#e2e8f0",
    textDecoration: "none",
    fontSize: "1.05rem",
    padding: "10px 20px",
  },
  userBtn: {
    color: "#e2e8f0",
    border: "none",
    background: "transparent",
    fontSize: "1.05rem",
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: "6px",
    transition: "all 0.2s",
  },
  dropdown: {
    position: "absolute" as const,
    top: "100%",
    right: 0,
    background: "#0f172a",
    border: "1px solid #475569",
    borderRadius: "8px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    minWidth: "200px",
    marginTop: "4px",
    zIndex: 1001,
  },
  dropdownItem: {
    width: "100%",
    padding: "12px 16px",
    border: "none",
    background: "transparent",
    color: "#e2e8f0",
    textAlign: "left" as const,
    cursor: "pointer",
    fontSize: "1rem",
    transition: "all 0.2s",
  },
  modal: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  modalContent: {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    maxWidth: "400px",
    width: "90%",
    padding: "24px",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: "#64748b",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "12px",
  },
  input: {
    padding: "12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "1rem",
    outline: "none",
  },
  error: {
    color: "#ef4444",
    background: "#fee2e2",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "12px",
  },
  success: {
    color: "#16a34a",
    background: "#dcfce7",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "12px",
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    marginTop: "20px",
  },
  cancelBtn: {
    flex: 1,
    padding: "10px",
    border: "1px solid #cbd5e1",
    background: "white",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
  },
  submitBtn: {
    flex: 1,
    padding: "10px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "1rem",
  },
};

export default Header;
