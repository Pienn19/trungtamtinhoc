import { useEffect, useState } from "react";
import { getKhoaHoc } from "../services/api";
import { type KhoaHoc } from "../types/KhoaHoc";
import KhoaHocCard from "../components/KhoaHocCard";
import { getCourseImageSrc } from "../utils/imageHelper";
import BannerSlider from "../components/BannerSlider";

const Home = () => {
  const [courses, setCourses] = useState<KhoaHoc[]>([]);

  useEffect(() => {
    getKhoaHoc()
      .then(data => {
        setCourses(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Error fetching courses:", err);
        setCourses([]);
      });
  }, []);

  const styles = {
    hero: {
      padding: "28px 20px 0",
    },
    heroInner: {
      maxWidth: "1240px",
      margin: "0 auto",
      padding: "54px 26px",
      display: "grid",
      gridTemplateColumns: "minmax(0, 1.3fr) minmax(280px, 0.7fr)",
      gap: "24px",
      alignItems: "center",
    },
    heroCopy: {
      maxWidth: "760px",
    },
    heroTitle: {
      margin: "12px 0 14px",
      fontSize: "clamp(2.4rem, 5vw, 4.4rem)",
      lineHeight: 1.02,
      letterSpacing: "-0.04em",
      color: "#fff",
    },
    heroText: {
      fontSize: "1.08rem",
      lineHeight: 1.8,
      color: "rgba(255,255,255,0.9)",
      maxWidth: "680px",
    },
    heroActions: {
      display: "flex",
      gap: "14px",
      flexWrap: "wrap" as const,
      marginTop: "26px",
    },
    primaryButton: {
      padding: "14px 22px",
      border: "none",
      borderRadius: "999px",
      background: "#f59e0b",
      color: "#1f2937",
      cursor: "pointer",
      fontWeight: 800,
      boxShadow: "0 12px 26px rgba(245, 158, 11, 0.28)",
    },
    secondaryButton: {
      padding: "14px 22px",
      borderRadius: "999px",
      border: "1px solid rgba(255,255,255,0.32)",
      background: "rgba(255,255,255,0.08)",
      color: "#fff",
      cursor: "pointer",
      fontWeight: 700,
    },
    heroPanel: {
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.18)",
      borderRadius: "22px",
      padding: "22px",
      display: "grid",
      gap: "14px",
    },
    heroPanelItem: {
      padding: "16px",
      borderRadius: "16px",
      background: "rgba(255,255,255,0.11)",
      color: "#fff",
    },
    heroPanelLabel: {
      fontSize: "12px",
      letterSpacing: "0.08em",
      textTransform: "uppercase" as const,
      color: "rgba(255,255,255,0.72)",
      marginBottom: "6px",
      fontWeight: 700,
    },
    heroPanelValue: {
      fontSize: "1.45rem",
      fontWeight: 800,
    },
    container: {
      maxWidth: "1240px",
      margin: "0 auto",
      padding: "28px 20px 0",
    },
    sectionHead: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "end",
      gap: "14px",
      marginBottom: "18px",
      flexWrap: "wrap" as const,
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
      gap: "22px",
    },
  };

  return (
    <>
      <BannerSlider />

      <div style={{ background: 'linear-gradient(90deg,#0098d4 0%, #0085ba 100%)', padding: '34px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24, alignItems: 'center' }}>
            <div>
              <h1 style={{ color: '#fff', fontSize: '2.6rem', margin: 0, fontWeight: 800 }}>Học tập linh hoạt — Chứng chỉ tin học uy tín</h1>
              <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: 12, lineHeight: 1.6 }}>Tham gia khóa học phù hợp, học trực tuyến hoặc ở trung tâm, nhận chứng chỉ sau khi hoàn thành.</p>
              <div style={{ marginTop: 18, display: 'flex', gap: 12 }}>
                <button style={{ background: '#fff', color: '#073642', padding: '12px 18px', borderRadius: 10, fontWeight: 700 }}>Khóa học hôm nay</button>
                <button style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.28)', padding: '12px 18px', borderRadius: 10 }}>Tìm hiểu thêm</button>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', padding: 16, borderRadius: 12 }}>
              <h4 style={{ color: '#fff', margin: '0 0 8px', fontWeight: 800 }}>Khóa nổi bật</h4>
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingTop: 8 }}>
                {courses.slice(0, 3).map(c => (
                  <div key={c.idKhoaHoc} style={{ minWidth: 160 }}>
                    <img src={getCourseImageSrc(c.anhDaiDien)} alt={c.tenKhoaHoc} style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 8 }} />
                    <div style={{ color: '#fff', fontWeight: 700, marginTop: 8, fontSize: 13 }}>{c.tenKhoaHoc}</div>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>{c.thoiLuong} giờ</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-shell">
        <div style={styles.sectionHead}>
          <div>
            <div className="muted-pill">Danh mục khóa học</div>
            <h2 className="section-title" style={{ marginTop: 10 }}>Chọn chương trình phù hợp với mục tiêu của bạn</h2>
            <p className="section-subtitle">Từ ứng dụng tin học văn phòng đến khóa chuyên sâu, tất cả đều có lịch khai giảng rõ ràng.</p>
          </div>
        </div>

        <div style={styles.grid}>
          {courses.map(course => (
            <KhoaHocCard key={course.idKhoaHoc} khoaHoc={course} />
          ))}
        </div>

        <section style={{ marginTop: 36 }}>
          <h3 style={{ marginBottom: 12 }}>Danh mục phổ biến</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['Tin học văn phòng', 'Lập trình cơ bản', 'Phân tích dữ liệu'].map(cat => (
              <div key={cat} style={{ background: '#f1f5f9', padding: '10px 14px', borderRadius: 8, fontWeight: 700 }}>{cat}</div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export default Home;