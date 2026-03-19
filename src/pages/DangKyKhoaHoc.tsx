import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const DangKyKhoaHoc = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [lopHoc, setLopHoc] = useState<any[]>([]);
  const [selectedLop, setSelectedLop] = useState<number>();

  useEffect(() => {

    axios
      .get(`http://localhost:5025/api/LopHoc/khoaHoc/${id}`)
      .then(res => setLopHoc(res.data));

  }, [id]);

  const handleDangKy = async () => {

    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://localhost:5025/api/DangKy",
      { idLop: selectedLop },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const paymentId = res.data.paymentId;

    navigate(`/payment/${paymentId}`);
  };

  return (

    <div style={{ maxWidth: 600, margin: "auto" }}>

      <h2>Chọn lớp học</h2>

      {lopHoc.map(lop => (

        <div key={lop.idLop} style={{ border: "1px solid #ddd", padding: 10 }}>

          <p><b>{lop.tenLop}</b></p>

          <p>
            {lop.ngayBatDau} - {lop.ngayKetThuc}
          </p>

          <button onClick={() => setSelectedLop(lop.idLop)}>
            Chọn lớp
          </button>

        </div>

      ))}

      <br />

      <button
        disabled={!selectedLop}
        onClick={handleDangKy}
      >
        Xác nhận đăng ký
      </button>

    </div>
  );
};

export default DangKyKhoaHoc;