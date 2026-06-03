import { useEffect, useState } from 'react'
import axiosClient from '../../services/axiosClient'

type PaymentRow = {
  idThanhToan: number
  soTien: number
  hinhThucThanhToan?: string
  trangThaiThanhToan?: string
  ngayThanhToan?: string | null
}

const AdminThanhToan = () => {
  const [data, setData] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submittingId, setSubmittingId] = useState<number | null>(null)

  useEffect(() => {
    void loadPayments()
  }, [])

  const loadPayments = async () => {
    try {
      setLoading(true)
      const res = await axiosClient.get(`/admin/thanhtoan`)
      setData(res.data)
      setError(null)
    } catch {
      setError('Không tải được danh sách thanh toán')
    } finally {
      setLoading(false)
    }
  }

  const confirmPayment = async (id: number) => {
    try {
      setSubmittingId(id)
      await axiosClient.put(`/admin/thanhtoan/${id}/confirm`)
      alert('Xác nhận thanh toán thành công')
      await loadPayments()
    } catch {
      alert('Không thể xác nhận thanh toán')
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <div>
      <h2>Thanh toán</h2>

      {loading ? (
        <p>Đang tải danh sách thanh toán...</p>
      ) : error ? (
        <p style={{ color: 'crimson' }}>{error}</p>
      ) : data.length === 0 ? (
        <p>Chưa có giao dịch thanh toán nào.</p>
      ) : (
        <table border={1} cellPadding={10}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Số tiền</th>
              <th>Phương thức</th>
              <th>Trạng thái</th>
              <th>Ngày thanh toán</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {data.map((x) => (
              <tr key={x.idThanhToan}>
                <td>{x.idThanhToan}</td>
                <td>{x.soTien.toLocaleString('vi-VN')} VNĐ</td>
                <td>{x.hinhThucThanhToan || '-'}</td>
                <td>{x.trangThaiThanhToan || '-'}</td>
                <td>{x.ngayThanhToan ? new Date(x.ngayThanhToan).toLocaleString('vi-VN') : '-'}</td>
                <td>
                  <button
                    onClick={() => confirmPayment(x.idThanhToan)}
                    disabled={submittingId === x.idThanhToan || x.trangThaiThanhToan === 'Đã'}
                  >
                    {submittingId === x.idThanhToan ? 'Đang xử lý...' : 'Xác nhận'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default AdminThanhToan