import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const Header = () => {
  const [hovered, setHovered] = useState<string | null>(null);

  const [username, setUsername] = useState<string | null>(localStorage.getItem("username"));

  useEffect(() => {

    const handleStorageChange = () => {
      const user = localStorage.getItem("username");
      setUsername(user);
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };

  }, []);

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("username");

    setUsername(null);

    window.location.href = "/";
  };

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <div style={styles.headerContent}>
          <h2 style={styles.logo}>Trung Tâm Tin Học PyTech </h2>

          <nav style={styles.nav}>
            <Link
              to="/"
              style={styles.link}
              onMouseEnter={() => setHovered("/")}
              onMouseLeave={() => setHovered(null)}
            >
              Trang chủ
            </Link>

            <Link
              to="/khoa-hoc"
              style={styles.link}
              onMouseEnter={() => setHovered("/khoa-hoc")}
              onMouseLeave={() => setHovered(null)}
            >
              Khóa học
            </Link>

            <Link to="/register" style={styles.link}>
              Đăng ký
            </Link>
            
            {username ? (
              <>
                <span style={styles.user}> Xin chao {username}</span>
                <button style={styles.logoutBtn} onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link
                to="/login"
                style={styles.link}
                onMouseEnter={() => setHovered("/login")}
                onMouseLeave={() => setHovered(null)}
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </div>
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
  user: {
    fontWeight: 600,
  },
  logoutBtn: {
    padding: "8px 16px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
  },
};

export default Header;
