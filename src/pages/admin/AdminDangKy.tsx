import { useEffect, useState } from "react";
import axiosClient from "../../services/axiosClient";

type AdminRegistrationRow = {
  idDangKy: number;
  tenHocVien: string;
  tenLop: string;
  tenKhoaHoc?: string | null;
  ngayDangKy?: string | null;
  trangThai?: string | null;
  thanhToan?: { idThanhToan: number; soTien: number; trangThaiThanhToan: string } | null;
};

const AdminDangKy = () => {
  const [data, setData] = useState<AdminRegistrationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get<AdminRegistrationRow[]>("/admin/dangky");
      setData(res.data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Không thể tải danh sách đăng ký");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id: number) => {
    await axiosClient.put(`/admin/dangky/${id}/approve`);
    await load();
    alert("Đã duyệt đăng ký");
  };

  const handleDrop = async (id: number) => {
    if (!confirm("Bạn chắc chắn muốn hủy đăng ký này?")) return;
    await axiosClient.put(`/admin/dangky/${id}/drop`);
    await load();
    alert("Đã hủy đăng ký");
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div style={{ color: "crimson" }}>{error}</div>;

  return (
    <div>
      <h2>Quản lý đăng ký lớp</h2>

      <table border={1} cellPadding={10} style={{ width: "100%", background: "white" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Học viên</th>
            <th>Khóa</th>
            <th>Lớp</th>
            <th>Trạng thái</th>
            <th>Thanh toán</th>
            <th>Hành động</th>
          </tr>
        </thead>

        <tbody>
          {data.map((x) => (
            <tr key={x.idDangKy}>
              <td>{x.idDangKy}</td>
              <td>{x.tenHocVien}</td>
              <td>{x.tenKhoaHoc ?? "-"}</td>
              <td>{x.tenLop}</td>
              <td>{x.trangThai ?? "-"}</td>
              <td>{x.thanhToan ? `${x.thanhToan.trangThaiThanhToan} (${x.thanhToan.soTien.toLocaleString()}đ)` : "-"}</td>
              <td style={{ display: "flex", gap: 8 }}>
                <button onClick={() => handleApprove(x.idDangKy)} disabled={x.trangThai === "Active"}>
                  Duyệt
                </button>
                <button onClick={() => handleDrop(x.idDangKy)} disabled={x.trangThai === "Dropped"}>
                  Hủy
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDangKy;