import { Outlet, Link, useLocation } from "react-router-dom";

const AdminLayout = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div style={{
        width: 260,
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        color: "white",
        padding: "20px",
        borderRight: "1px solid #334155",
        boxShadow: "2px 0 10px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ margin: "0 0 30px 0", fontSize: "24px", fontWeight: "700" }}>⚙️ Admin</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <MenuItem to="/admin" label="📊 Dashboard" active={isActive("/admin") && location.pathname === "/admin"} />
          <MenuItem to="/admin/users" label="👥 Người dùng" active={isActive("/admin/users")} />
          <MenuItem to="/admin/khoa-hoc" label="📚 Quản lý khóa học" active={isActive("/admin/khoa-hoc")} />
          <MenuItem to="/admin/lop-hoc" label="🏫 Quản lý lớp học" active={isActive("/admin/lop-hoc")} />
          <MenuItem to="/admin/dang-ky" label="📝 Đăng ký khóa học" active={isActive("/admin/dang-ky")} />
          <MenuItem to="/admin/thanh-toan" label="💳 Thanh toán" active={isActive("/admin/thanh-toan")} />
          <MenuItem to="/admin/giangvien" label="👨‍🏫 Giảng viên" active={isActive("/admin/giangvien")} />
          <MenuItem to="/admin/diem-so" label="📊 Kết quả học tập" active={isActive("/admin/diem-so")} />
          <MenuItem to="/admin/chuyen-lop" label="🔄 Chuyển lớp" active={isActive("/admin/chuyen-lop")} />
          <MenuItem to="/admin/bao-cao" label="📈 Báo cáo & Thống kê" active={isActive("/admin/bao-cao")} />
        </nav>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "30px", background: "#f8fafc", overflowY: "auto" }}>
        <Outlet />
      </div>
    </div>
  );
};

const MenuItem = ({ to, label, active }: { to: string; label: string; active: boolean }) => (
  <Link
    to={to}
    style={{
      display: "block",
      padding: "12px 16px",
      textDecoration: "none",
      color: active ? "white" : "#cbd5e1",
      background: active ? "rgba(3, 102, 214, 0.8)" : "transparent",
      borderRadius: "6px",
      fontWeight: active ? "600" : "500",
      fontSize: "14px",
      transition: "all 0.3s ease",
      borderLeft: active ? "3px solid #0366d6" : "3px solid transparent",
      paddingLeft: active ? "13px" : "16px"
    }}
    onMouseEnter={(e) => {
      if (!active) {
        (e.target as HTMLElement).style.background = "rgba(71, 85, 105, 0.4)";
        (e.target as HTMLElement).style.color = "#f1f5f9";
      }
    }}
    onMouseLeave={(e) => {
      if (!active) {
        (e.target as HTMLElement).style.background = "transparent";
        (e.target as HTMLElement).style.color = "#cbd5e1";
      }
    }}
  >
    {label}
  </Link>
);

export default AdminLayout;