import { type KhoaHoc } from "../types/KhoaHoc";
import { useNavigate } from "react-router-dom"; 

interface Props {
  khoaHoc: KhoaHoc;
}

const KhoaHocCard = ({ khoaHoc }: Props) => {
  const navigate = useNavigate(); // Sử dụng useNavigate

  return (
    <div style={styles.card}>
      <img
        src={`/images/${khoaHoc.anhDaiDien}`}
        alt={khoaHoc.tenKhoaHoc}
        style={styles.image}
      />

      <h3>{khoaHoc.tenKhoaHoc}</h3>
      <p>Thời lượng: {khoaHoc.thoiLuong} giờ</p>
      <p>Học phí: {khoaHoc.hocPhi.toLocaleString()} VND</p>
      <p>{khoaHoc.moTa}</p>

      <button
        style={styles.button}
        className="course-button"
        onClick={() => navigate(`/khoa-hoc/${khoaHoc.idKhoaHoc}`)} 
      >
        Xem chi tiết
      </button>    
    </div>
  );
};

const styles = {
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    transition: "0.3s"
  },
  image: {
    width: "100%",
    height: "200px",
    objectFit: "cover" as const,
    borderRadius: "10px",
    marginBottom: "15px"
  },
  button: {
    marginTop: "10px",
    padding: "10px",
    width: "100%",
    borderRadius: "8px",
    border: "none",
    background: "#FFC125",
    color: "white",
    cursor: "pointer"
  }
};

export default KhoaHocCard;
