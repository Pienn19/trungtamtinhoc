import { useEffect, useState } from "react";
import { getKhoaHoc } from "../services/api";
import { type KhoaHoc } from "../types/KhoaHoc";
import KhoaHocCard from "../components/KhoaHocCard";

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
    banner: {
      width: "100%",
      padding: "120px 20px",
      background: "linear-gradient(135deg, #1e3a8a, #2563eb)",
      color: "white",
    },
    bannerContent: {
      maxWidth: "1200px",
      margin: "0 auto",
      textAlign: "center" as const,
    },
    container: {
      maxWidth: "1200px",
      margin: "60px auto",
      padding: "0 20px",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      gap: "28px",
    },
    button: {
      marginTop: "30px",
      padding: "14px 36px",
      border: "none",
      borderRadius: "8px",
      background: "#facc15",
      color: "#1e293b",
      cursor: "pointer",
      fontWeight: "bold",
      fontSize: "1.1rem",
      boxShadow: "0 6px 20px rgba(250, 204, 21, 0.3)",
    }
  };

  return (
    <>
      {/* Banner FULL WIDTH */}
      <section style={styles.banner}>
        <div style={styles.bannerContent}>
          <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>Khóa học tin học Online</h1>
          <p style={{ fontSize: "1.25rem", maxWidth: "700px", margin: "0 auto 30px" }}>
            Khám phá các khóa học chất lượng cao từ cơ bản đến chuyên sâu
          </p>
          <button style={styles.button}>Xem khóa học</button>
        </div>
      </section>

      {/* CONTENT có container */}
      <div style={styles.container}>
        <h2 style={{ marginBottom: "40px", fontSize: "2rem", textAlign: "center" }}>Danh sách khóa học</h2>

        <div style={styles.grid}>
          {courses.map(course => (
            <KhoaHocCard key={course.idKhoaHoc} khoaHoc={course} />
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;