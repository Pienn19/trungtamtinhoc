import { useEffect, useState } from "react";
import axios from "axios";

const AdminDangKy = () => {

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {

    axios
      .get("http://localhost:5025/api/admin/dangky")
      .then(res => setData(res.data));

  }, []);

  const handleApprove = async (id:number) => {

    await axios.put(
      `http://localhost:5025/api/admin/dangky/${id}/approve`
    );

    alert("Đã duyệt đăng ký");

  };

  return (

    <div>

      <h2>Danh sách đăng ký</h2>

      <table border={1} cellPadding={10}>

        <thead>

          <tr>
            <th>ID</th>
            <th>Học viên</th>
            <th>Lớp</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>

        </thead>

        <tbody>

          {data.map(x => (

            <tr key={x.idDangKy}>

              <td>{x.idDangKy}</td>
              <td>{x.tenHocVien}</td>
              <td>{x.tenLop}</td>
              <td>{x.trangThai}</td>

              <td>

                <button
                  onClick={() => handleApprove(x.idDangKy)}
                >
                  Duyệt
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