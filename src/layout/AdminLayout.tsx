import { Outlet, Link } from "react-router-dom";

const AdminLayout = () => {

  return (

    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Sidebar */}

      <div style={{
        width: 240,
        background: "#1e293b",
        color: "white",
        padding: 20
      }}>

        <h2>Admin</h2>

        <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/khoa-hoc">Khóa học</Link>
          <Link to="/admin/dang-ky">Đăng ký</Link>
          <Link to="/admin/thanh-toan">Thanh toán</Link>

        </nav>

      </div>

      {/* Content */}

      <div style={{ flex: 1, padding: 30 }}>

        <Outlet />

      </div>

    </div>

  );
};

export default AdminLayout;