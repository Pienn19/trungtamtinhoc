import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
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
import AdminClassSettings from "./pages/admin/AdminClassSettings";
import AdminDangKy from "./pages/admin/AdminDangKy";
import AdminThanhToan from "./pages/admin/AdminThanhToan";
import InstructorManagement from "./pages/admin/InstructorManagement";
import AdminCertificateManagement from "./pages/admin/AdminCertificateManagement";
import AdminClassTransfer from "./pages/admin/AdminClassTransfer";
import AdminReporting from "./pages/admin/AdminReporting";
import AdminExamSchedule from "./pages/admin/AdminExamSchedule";
import AdminRoomManagement from "./pages/admin/AdminRoomManagement";
import StudentClassTransfer from "./pages/StudentClassTransfer";
import InstructorClassTransferReview from "./pages/instructor/InstructorClassTransferReview";
// Feature #2 imports
import CourseList from "./pages/CourseList";
import CourseDetail from "./pages/CourseDetail";
import MyRegistrations from "./pages/MyRegistrations";
import WeeklyTimetable from "./pages/WeeklyTimetable";
import StudentGrades from "./pages/StudentGrades";

import InstructorDashboard from "./pages/instructor/InstructorDashboard";
import InstructorTimetable from "./pages/instructor/InstructorTimetable";
import InstructorGradesManagement from "./pages/instructor/InstructorGradesManagement";
import InstructorRoute from "./routes/InstructorRoute";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
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
          <Route path="class-settings" element={<AdminClassSettings />} />
          <Route path="dang-ky" element={<AdminDangKy />} />
          <Route path="thanh-toan" element={<AdminThanhToan />} />
          <Route path="giangvien" element={<InstructorManagement />} />
          <Route path="diem-so" element={<AdminCertificateManagement />} />
          <Route path="chung-chi" element={<AdminCertificateManagement />} />
          <Route path="chuyen-lop" element={<AdminClassTransfer />} />
          <Route path="bao-cao" element={<AdminReporting />} />
          <Route path="phong-thi" element={<AdminRoomManagement />} />
          <Route path="lich-thi" element={<AdminExamSchedule />} />
        </Route>

        {/* Main Routes with Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />
          <Route path="/dang-ky-khoa-hoc" element={<DangKyKhoaHoc />} />
          <Route path="/dang-ky-khoa-hoc/:id" element={<DangKyKhoaHoc />} />
          <Route path="/payment/:id" element={<PaymentPage />} />

          {/* Feature #2: Course & Registration Routes */}
          <Route path="/khoa-hoc" element={<CourseList />} />
          <Route path="/khoa-hoc/:id" element={<CourseDetail />} />
          <Route path="/lop-cua-toi" element={<MyRegistrations />} />
          <Route path="/my-registrations" element={<MyRegistrations />} />
          <Route path="/thoi-khoa-bieu" element={<WeeklyTimetable />} />
          <Route path="/diem" element={<StudentGrades />} />
          <Route path="/chuyen-lop" element={<StudentClassTransfer />} />

          {/* Instructor Route */}
          <Route path="/giang-vien" element={<InstructorRoute><InstructorDashboard /></InstructorRoute>} />
          <Route path="/lich-giang-day" element={<InstructorRoute><InstructorTimetable /></InstructorRoute>} />
          <Route path="/giang-vien/diem-so" element={<InstructorRoute><InstructorGradesManagement /></InstructorRoute>} />
          <Route path="/giang-vien/chuyen-lop" element={<InstructorRoute><InstructorClassTransferReview /></InstructorRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
