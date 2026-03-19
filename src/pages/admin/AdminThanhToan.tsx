import { useEffect, useState } from "react";
import axios from "axios";

const AdminThanhToan = () => {

  const [data, setData] = useState<any[]>([]);

  useEffect(() => {

    axios
      .get("http://localhost:5025/api/admin/thanhtoan")
      .then(res => setData(res.data));

  }, []);

  const confirmPayment = async (id:number) => {

    await axios.put(
      `http://localhost:5025/api/admin/thanhtoan/${id}/confirm`
    );

    alert("Thanh toán thành công");

  };

  return (

    <div>

      <h2>Thanh toán</h2>

      <table border={1} cellPadding={10}>

        <thead>
          <tr>
            <th>ID</th>
            <th>Số tiền</th>
            <th>Phương thức</th>
            <th>Trạng thái</th>
            <th></th>
          </tr>
        </thead>

        <tbody>

          {data.map(x => (

            <tr key={x.idThanhToan}>

              <td>{x.idThanhToan}</td>
              <td>{x.soTien}</td>
              <td>{x.phuongThuc}</td>
              <td>{x.trangThai}</td>

              <td>

                <button
                  onClick={() => confirmPayment(x.idThanhToan)}
                >
                  Xác nhận
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

};

export default AdminThanhToan;