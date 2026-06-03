import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { logout } from "../services/authService";
import { toast } from "react-toastify";
import { normalizeUserRole } from "../utils/authHelper";

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

  const normalizedUserRole = normalizeUserRole(userRole);

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

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      const { changePassword } = await import("../services/authService");
      await changePassword(
        passwordForm.oldPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword
      );
      toast.success("Thay đổi mật khẩu thành công!");
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => {
        setShowChangePassword(false);
      }, 1000);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Thay đổi mật khẩu thất bại"
      );
    }
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.headerContent}>
          <div style={styles.brandBlock}>
            <img
              src="/images/logoweb.png"
              alt="PyTech Logo"
              style={styles.logoImg}
            />
            <div>
              <h2 style={styles.logo}>Trung Tâm Tin Học PyTech</h2>
              <p style={styles.brandSubtitle}>Đào tạo tin học ứng dụng và kỹ năng số</p>
            </div>
          </div>

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

            {username && normalizedUserRole !== "GiangVien" && normalizedUserRole !== "Admin" && (
              <Link
                to="/lop-cua-toi"
                style={styles.link}
              >
                Lớp Của Tôi
              </Link>
            )}

            {username && normalizedUserRole !== "GiangVien" && normalizedUserRole !== "Admin" && (
              <Link
                to="/thoi-khoa-bieu"
                style={styles.link}
              >
                Thời khóa biểu
              </Link>
            )}

            {username && normalizedUserRole === "GiangVien" && (
              <Link
                to="/lich-giang-day"
                style={styles.link}
              >
                Lịch giảng dạy
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
                    {normalizedUserRole === "Admin" && (
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
                    {normalizedUserRole === "GiangVien" && (
                      <>
                        <Link
                          to="/giang-vien"
                          style={{
                            ...styles.dropdownItem,
                            color: "#16a34a",
                            textDecoration: "none",
                            display: "block",
                          }}
                          onClick={() => setShowDropdown(false)}
                        >
                          👨‍🏫 Khu Vực Giảng Viên
                        </Link>
                        <Link
                          to="/giang-vien/chuyen-lop"
                          style={{
                            ...styles.dropdownItem,
                            color: "#2563eb",
                            textDecoration: "none",
                            display: "block",
                          }}
                          onClick={() => setShowDropdown(false)}
                        >
                          🔄 Xem đơn chuyển lớp
                        </Link>
                      </>
                    )}
                    {normalizedUserRole === "HocVien" && (
                      <>
                        <Link
                          to="/chuyen-lop"
                          style={{
                            ...styles.dropdownItem,
                            color: "#2563eb",
                            textDecoration: "none",
                            display: "block",
                          }}
                          onClick={() => setShowDropdown(false)}
                        >
                          🔄 Chuyển lớp của tôi
                        </Link>
                        <Link
                          to="/diem"
                          style={{
                            ...styles.dropdownItem,
                            color: "#2563eb",
                            textDecoration: "none",
                            display: "block",
                          }}
                          onClick={() => setShowDropdown(false)}
                        >
                          📊 Xem điểm
                        </Link>
                      </>
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
    background: "linear-gradient(135deg, #0098d4 0%, #0085ba 100%)",
    backdropFilter: "blur(14px)",
    color: "white",
    padding: "16px 0",
    borderBottom: "3px solid #007aa8",
    boxShadow: "0 6px 24px rgba(0, 152, 212, 0.18)",
    position: "sticky" as const,
    top: 0,
    zIndex: 1000,
  },
  container: {
    maxWidth: "1240px",
    margin: "0 auto",
    padding: "0 20px",
  },
  headerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "30px",
    flexWrap: "wrap" as const,
  },
  brandBlock: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  logoImg: {
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    objectFit: "contain" as const,
    boxShadow: "0 6px 16px rgba(11, 120, 179, 0.18)",
  },
  logo: {
    fontSize: "1.25rem",
    fontWeight: 900,
    margin: 0,
    color: "white",
    lineHeight: 1.1,
    letterSpacing: "-0.01em",
  },
  brandSubtitle: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "rgba(255,255,255,0.85)",
    fontWeight: 600,
  },
  nav: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap" as const,
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: 700,
    padding: "10px 16px",
    borderRadius: "6px",
    transition: "all 0.3s ease",
    cursor: "pointer",
    whiteSpace: "nowrap" as const,
  },
  userBtn: {
    color: "white",
    border: "1.5px solid rgba(255,255,255,0.4)",
    background: "rgba(255,255,255,0.1)",
    fontSize: "0.92rem",
    padding: "10px 18px",
    cursor: "pointer",
    borderRadius: "6px",
    transition: "all 0.3s ease",
    fontWeight: 700,
  },
  dropdown: {
    position: "absolute" as const,
    top: "100%",
    right: 0,
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    boxShadow: "0 20px 50px rgba(15, 76, 129, 0.15)",
    minWidth: "220px",
    marginTop: "12px",
    zIndex: 1001,
    overflow: "hidden",
  },
  dropdownItem: {
    width: "100%",
    padding: "14px 18px",
    border: "none",
    background: "transparent",
    color: "#334155",
    textAlign: "left" as const,
    cursor: "pointer",
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    fontWeight: 600,
  },
  modal: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    backdropFilter: "blur(4px)",
  },
  modalContent: {
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
    maxWidth: "420px",
    width: "90%",
    padding: "32px",
    animation: "slideUp 0.3s ease",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1.8rem",
    cursor: "pointer",
    color: "#94a3b8",
    transition: "color 0.2s ease",
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "14px",
  },
  input: {
    padding: "12px 16px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "0.95rem",
    outline: "none",
    transition: "all 0.3s ease",
    fontFamily: "inherit",
  },
  error: {
    color: "#be123c",
    background: "#ffe4e6",
    padding: "12px 14px",
    borderRadius: "8px",
    marginBottom: "12px",
    fontWeight: 600,
  },
  success: {
    color: "#166534",
    background: "#dcfce7",
    padding: "12px 14px",
    borderRadius: "8px",
    marginBottom: "12px",
    fontWeight: 600,
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    marginTop: "28px",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px 16px",
    border: "1.5px solid #e2e8f0",
    background: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#475569",
    transition: "all 0.2s ease",
  },
  submitBtn: {
    flex: 1,
    padding: "12px 16px",
    background: "linear-gradient(135deg, #0f4c81 0%, #0b78b3 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 700,
    transition: "all 0.2s ease",
  },
};

export default Header;
