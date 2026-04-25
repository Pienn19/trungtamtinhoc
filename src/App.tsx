import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PaymentPage from "./pages/PaymentPage";
import DangKyKhoaHoc from "./pages/DangKyKhoaHoc";
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminCourseManagement from "./pages/admin/AdminCourseManagement";
import AdminClassManagement from "./pages/admin/AdminClassManagement";
import AdminDangKy from "./pages/admin/AdminDangKy";
import AdminThanhToan from "./pages/admin/AdminThanhToan";
import InstructorManagement from "./pages/admin/InstructorManagement";
import StudentGradesManagement from "./pages/admin/StudentGradesManagement";
import AdminClassTransfer from "./pages/admin/AdminClassTransfer";
import AdminReporting from "./pages/admin/AdminReporting";
// Feature #2 imports
import CourseList from "./pages/CourseList";
import CourseDetail from "./pages/CourseDetail";
import MyRegistrations from "./pages/MyRegistrations";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Routes */}
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="khoa-hoc" element={<AdminCourseManagement />} />
          <Route path="lop-hoc" element={<AdminClassManagement />} />
          <Route path="dang-ky" element={<AdminDangKy />} />
          <Route path="thanh-toan" element={<AdminThanhToan />} />
          <Route path="giangvien" element={<InstructorManagement />} />
          <Route path="diem-so" element={<StudentGradesManagement />} />
          <Route path="chuyen-lop" element={<AdminClassTransfer />} />
          <Route path="bao-cao" element={<AdminReporting />} />
        </Route>

        {/* Main Routes with Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />
          <Route path="/dang-ky-khoa-hoc/:id" element={<DangKyKhoaHoc />} />
          <Route path="/payment/:id" element={<PaymentPage />} />

          {/* Feature #2: Course & Registration Routes */}
          <Route path="/khoa-hoc" element={<CourseList />} />
          <Route path="/khoa-hoc/:id" element={<CourseDetail />} />
          <Route path="/my-registrations" element={<MyRegistrations />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
