import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"

interface Payment {
  idThanhToan: number
  soTien: number
  trangThai: string
}

const PaymentPage = () => {

  const { id } = useParams()

  const [payment, setPayment] = useState<Payment | null>(null)

  const bankCode = "mbbank"
  const bankAccount = "123456789"

  useEffect(() => {

    axios.get(`http://localhost:5025/api/ThanhToan/${id}`)
      .then(res => {
        setPayment(res.data)
      })

  }, [id])

  if (!payment) {
    return <div>Đang tải...</div>
  }

  const qrUrl =
    `https://img.vietqr.io/image/${bankCode}-${bankAccount}-print.png?amount=${payment.soTien}&addInfo=ThanhToanKhoaHoc${payment.idThanhToan}`

  return (

    <div style={{ maxWidth: 600, margin: "auto", textAlign: "center" }}>

      <h2>Thanh toán khóa học</h2>

      <p>Số tiền cần thanh toán:</p>

      <h1 style={{ color: "red" }}>
        {payment.soTien.toLocaleString()} VND
      </h1>

      <h3>Quét QR bằng app ngân hàng</h3>

      <img
        src={qrUrl}
        width={300}
      />

      <p style={{ marginTop: 20 }}>
        Nội dung chuyển khoản:
      </p>

      <b>
        ThanhToanKhoaHoc{payment.idThanhToan}
      </b>

      <hr style={{ margin: 30 }} />

      <h3>Phương thức thanh toán</h3>

      <div style={{ display: "flex", gap: 20, justifyContent: "center" }}>

        <button>
          QR Ngân hàng
        </button>

        <button>
          MoMo
        </button>

        <button>
          VNPay
        </button>

      </div>

      <p style={{ marginTop: 20 }}>
        Sau khi chuyển khoản, admin sẽ xác nhận thanh toán.
      </p>

    </div>
  )

}

export default PaymentPage