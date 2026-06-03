const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.brand}>
            <h3 style={styles.brandName}>Trung Tâm Tin Học PyTech</h3>
            <p style={styles.brandDesc}>Đào tạo tin học ứng dụng, chứng chỉ và kỹ năng công nghệ cho học viên.</p>
          </div>
          <div style={styles.divider}></div>
          <div style={styles.copy}>
            <p>© 2025 Trung Tâm Công Nghệ Thông Tin PyTech</p>
            <p style={styles.tagline}>Nâng cao kỹ năng, mở rộng cơ hội</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    marginTop: "60px",
    padding: "48px 20px 32px",
    background: "linear-gradient(135deg, #0098d4 0%, #0085ba 100%)",
    color: "white",
  },
  container: {
    maxWidth: "1240px",
    margin: "0 auto",
  },
  content: {
    textAlign: "center" as const,
  },
  brand: {
    marginBottom: "24px",
  },
  brandName: {
    fontSize: "1.3rem",
    fontWeight: 900,
    marginBottom: "10px",
    letterSpacing: "-0.01em",
  },
  brandDesc: {
    margin: "0",
    color: "rgba(255,255,255,0.9)",
    lineHeight: 1.7,
    fontSize: "15px",
    fontWeight: 500,
  },
  divider: {
    width: "60px",
    height: "3px",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
    margin: "24px auto",
  },
  copy: {
    marginTop: "24px",
  },
  tagline: {
    margin: "8px 0 0",
    color: "rgba(255,255,255,0.8)",
    fontSize: "13px",
    fontWeight: 600,
    fontStyle: "italic" as const,
  },
};

export default Footer;
