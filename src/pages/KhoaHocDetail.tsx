import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getKhoaHocById } from "../services/api";
import { type KhoaHoc } from "../types/KhoaHoc";
import { useNavigate } from "react-router-dom";

const KhoaHocDetail = () => {
  const navigate = useNavigate();

  const { id } = useParams();
  const [khoaHoc, setKhoaHoc] = useState<KhoaHoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const data = await getKhoaHocById(Number(id));
          setKhoaHoc(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p>Đang tải...</p>;
  if (!khoaHoc) return <p>Không tìm thấy khóa học</p>;

  return (
    <div className="khoahoc-detail-wrapper">

    <div className="khoahoc-banner">
        <img src={`/images/${khoaHoc.anhDaiDien}`} />
    </div>

    <h1 className="khoahoc-title">
        {khoaHoc.tenKhoaHoc}
    </h1>

    <div className="khoahoc-meta">
         Thời lượng: {khoaHoc.thoiLuong} giờ |
         Học phí: {khoaHoc.hocPhi.toLocaleString()} VND |
         Khai giảng: Liên hệ trung tâm
    </div>

    <div className="khoahoc-section">
        <h2>Giới thiệu khóa học</h2>
        <p>{khoaHoc.moTa}</p>
    </div>

    <div className="khoahoc-section">
        <h2>Mô tả chi tiết</h2>
        <p>{khoaHoc.moTaChiTiet}</p>
    </div>

    <div className="khoahoc-section">
        <h2>Nội dung chương trình học</h2>
        <p>{khoaHoc.loTrinh || "Nội dung chi tiết sẽ được cập nhật..."}</p>
    </div>

    <div className="khoahoc-section">
        <h2>Đối tượng tham gia</h2>
        <p>{khoaHoc.doiTuong || "Sinh viên, người đi làm..."}</p>
    </div>

    <div className="khoahoc-section">
        <h2>Cam kết sau khóa học</h2>
        <p>{khoaHoc.camKet || "Thành thạo kỹ năng thực hành..."}</p>
    </div>

    <div className="khoahoc-section">
        <h2>Giảng viên phụ trách</h2>
        <p>Đội ngũ giảng viên nhiều năm kinh nghiệm thực tế.</p>
    </div>

    <div className="khoahoc-enroll-wrapper">
      <button
        className="khoahoc-enroll-btn"
        onClick={() => navigate(`/dang-ky/${khoaHoc.idKhoaHoc}`)}
         > Đăng ký khóa học
     </button>
    </div>

    </div>
  );
};

export default KhoaHocDetail;
