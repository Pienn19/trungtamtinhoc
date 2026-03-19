const AdminDashboard = () => {

    return (
  
      <div>
  
        <h1>Dashboard</h1>
  
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 20
        }}>
  
          <div style={card}>Khóa học</div>
          <div style={card}>Học viên</div>
          <div style={card}>Đăng ký</div>
          <div style={card}>Thanh toán</div>
  
        </div>
  
      </div>
  
    );
  
  };
  
  const card = {
    background: "white",
    padding: 30,
    borderRadius: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
  };
  
  export default AdminDashboard;