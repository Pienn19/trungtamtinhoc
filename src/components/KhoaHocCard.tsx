import { type KhoaHoc } from "../types/KhoaHoc";
import { useNavigate } from "react-router-dom";
import { getCourseImageSrc } from "../utils/imageHelper";

interface Props {
  khoaHoc: KhoaHoc;
}

const KhoaHocCard = ({ khoaHoc }: Props) => {
  const navigate = useNavigate();
  const originalPrice = khoaHoc.hocPhi;
  const discountedPrice = Math.floor(originalPrice * 0.85); // 15% discount

  return (
    <div style={styles.card}>
      <div style={styles.imageContainer}>
        <img
          src={getCourseImageSrc(khoaHoc.anhDaiDien)}
          alt={khoaHoc.tenKhoaHoc}
          style={styles.image}
        />
        <div style={styles.categoryPill}>Khóa học chuyên đề</div>
      </div>

      <div style={styles.content}>
        <h3 style={styles.title}>{khoaHoc.tenKhoaHoc}</h3>
        <p style={styles.description}>{khoaHoc.moTa}</p>

        <div style={styles.footer}>
          <div style={styles.metaInfo}>
            <span style={styles.metaItem}>⏱ {khoaHoc.thoiLuong} giờ</span>
            <span style={styles.metaItem}>💵 {discountedPrice.toLocaleString()} đ</span>
          </div>
          <button
            style={styles.primaryButton}
            className="course-button"
            onClick={() => navigate('/dang-ky-khoa-hoc')}
          >
            Chi tiết khóa học
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    overflow: 'hidden' as const,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column" as const,
  },
  imageContainer: {
    position: "relative" as const,
    width: "100%",
    height: "220px",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    transition: "transform 0.35s ease",
  },
  categoryPill: {
    position: "absolute" as const,
    top: "12px",
    right: "12px",
    background: "#cbff00",
    color: "#1a1a1a",
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: 700,
    boxShadow: "0 4px 12px rgba(203, 255, 0, 0.3)",
  },
  content: {
    padding: "18px 18px 16px",
    display: "flex",
    flexDirection: "column" as const,
    flex: 1,
  },
  title: {
    fontSize: "1.15rem",
    lineHeight: 1.35,
    color: "#0f172a",
    margin: 0,
    fontWeight: 800,
    marginBottom: "8px",
  },
  description: {
    color: "#475569",
    lineHeight: 1.65,
    fontSize: "0.93rem",
    margin: "0 0 12px 0",
    flex: 1,
  },
  footer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    marginTop: "8px",
    paddingTop: "12px",
    borderTop: "1px solid #f0f0f0",
  },
  metaInfo: {
    display: "flex",
    gap: "16px",
    fontSize: "0.92rem",
  },
  metaItem: {
    color: "#64748b",
    fontWeight: 600,
  },
  primaryButton: {
    padding: "11px 16px",
    width: "100%",
    borderRadius: "6px",
    border: "none",
    background: "#0055ff",
    color: "white",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(0, 85, 255, 0.25)",
  },
};

export default KhoaHocCard;
