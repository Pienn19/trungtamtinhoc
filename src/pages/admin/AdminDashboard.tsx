import { Link } from "react-router-dom"
import '../../styles/admin-dashboard.css'

const AdminDashboard = () => {
  const dashboardItems = [
    {
      to: "/admin/users",
      icon: "👥",
      title: "Quản Lý Người Dùng",
      description: "Tạo, chỉnh sửa, khóa/mở khóa tài khoản"
    },
    {
      to: "/admin/giangvien",
      icon: "👨‍🏫",
      title: "Quản Lý Giảng Viên",
      description: "Quản lý giảng viên, phân công dạy, tính thù lao"
    },
    {
      to: "/admin/dang-ky",
      icon: "📝",
      title: "Đăng Ký Khóa Học",
      description: "Xem và quản lý đơn đăng ký"
    },
    {
      to: "/admin/thanh-toan",
      icon: "💳",
      title: "Thanh Toán",
      description: "Xác nhận và quản lý thanh toán"
    },
    {
      to: "/admin/chung-chi",
      icon: "🎓",
      title: "Chứng Chỉ",
      description: "Duyệt cấp và thu hồi chứng chỉ"
    },
    {
      icon: "📚",
      title: "Khóa Học",
      description: "Tạo và chỉnh sửa khóa học",
      disabled: true
    },
    {
      icon: "👨‍🎓",
      title: "Học Viên",
      description: "Xem thông tin và tiến độ học viên",
      disabled: true
    }
  ]

  return (
    <div className="admin-dashboard__container">
      <h1 className="admin-dashboard__title">Bảng Điều Khiển Quản Trị</h1>

      <div className="admin-dashboard__grid">
        {dashboardItems.map((item, idx) =>
          item.disabled || !item.to ? (
            <div key={idx} className="admin-dashboard__card">
              <h3 className="admin-dashboard__card-title">
                <span className="admin-dashboard__card-icon">{item.icon}</span>
                {item.title}
              </h3>
              <p className="admin-dashboard__card-description">{item.description}</p>
            </div>
          ) : (
            <Link key={idx} to={item.to} className="admin-dashboard__card-link">
              <div className="admin-dashboard__card">
                <h3 className="admin-dashboard__card-title">
                  <span className="admin-dashboard__card-icon">{item.icon}</span>
                  {item.title}
                </h3>
                <p className="admin-dashboard__card-description">{item.description}</p>
              </div>
            </Link>
          )
        )}
      </div>
    </div>
  )
}

export default AdminDashboard