import { Link } from "react-router-dom"

const AdminDashboard = () => {

  return (

    <div>

      <h1>Bảng Điều Khiển Quản Trị</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: 20,
        marginTop: 30
      }}>

        <Link to="/admin/users" style={cardLink}>
          <div style={card}>
            <h3>👥 Quản Lý Người Dùng</h3>
            <p>Tạo, chỉnh sửa, khóa/mở khóa tài khoản</p>
          </div>
        </Link>

        <Link to="/admin/giangvien" style={cardLink}>
          <div style={card}>
            <h3>👨‍🏫 Quản Lý Giảng Viên</h3>
            <p>Quản lý giảng viên, phân công dạy, tính thù lao</p>
          </div>
        </Link>

        <Link to="/admin/dang-ky" style={cardLink}>
          <div style={card}>
            <h3>📝 Đăng Ký Khóa Học</h3>
            <p>Xem và quản lý đơn đăng ký</p>
          </div>
        </Link>

        <Link to="/admin/thanh-toan" style={cardLink}>
          <div style={card}>
            <h3>💳 Thanh Toán</h3>
            <p>Xác nhận và quản lý thanh toán</p>
          </div>
        </Link>

        <div style={card}>
          <h3>📚 Khóa Học</h3>
          <p>Tạo và chỉnh sửa khóa học</p>
        </div>

        <div style={card}>
          <h3>👨‍🎓 Học Viên</h3>
          <p>Xem thông tin và tiến độ học viên</p>
        </div>

      </div>

    </div>

  );

};

const card = {
  background: "white",
  padding: 30,
  borderRadius: 10,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  transition: "all 0.3s ease",
  cursor: "pointer"
};

const cardLink = {
  textDecoration: "none",
  color: "inherit"
};

export default AdminDashboard;