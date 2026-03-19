import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layout/MainLayout";
import Home from "./pages/Home";
import KhoaHocDetail from "./pages/KhoaHocDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PaymentPage from "./pages/PaymentPage";
import DangKyKhoaHoc from "./pages/DangKyKhoaHoc";
import AdminRoute from "./routes/AdminRoute";
import AdminLayout from "./layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDangKy from "./pages/admin/AdminDangKy";
import AdminThanhToan from "./pages/admin/AdminThanhToan";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dang-ky" element={<AdminDangKy />} />
          <Route path="thanh-toan" element={<AdminThanhToan />} />
        </Route>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/khoa-hoc" element={<Home />} />
          <Route path="/khoa-hoc/:id" element={<KhoaHocDetail />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="dang-ky/:id" element={<DangKyKhoaHoc />} />
          <Route path="/payment/:id" element={<PaymentPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
