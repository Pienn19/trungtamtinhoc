const Footer = () => {
    return (
      <footer style={styles.footer}>
        <p>© 2025 Trung Tam Cong Nghe Thong Tin</p>
      </footer>
    );
  };
  
  const styles = {
    footer: {
      marginTop: "50px",
      padding: "20px",
      background: "#0f172a",
      color: "white",
      textAlign: "center" as const
    }
  };
  
  export default Footer;
  