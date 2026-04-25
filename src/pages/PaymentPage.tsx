import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { ThanhToanDTO, BienLaiDTO } from '../types/KhoaHoc'
import { confirmPayment, getPaymentInfo, getPaymentStatusLabel } from '../services/paymentService'
import { formatVND } from '../services/courseService'
import '../styles/PaymentPage.css'

const PaymentPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [paymentInfo, setPaymentInfo] = useState<ThanhToanDTO | null>(null)
  const [receipt, setReceipt] = useState<BienLaiDTO | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    loadPaymentInfo()
  }, [id])

  const loadPaymentInfo = async () => {
    try {
      setLoading(true)
      if (!id) throw new Error('Không tìm thấy ID thanh toán')
      const data = await getPaymentInfo(parseInt(id))
      setPaymentInfo(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentMethod) {
      alert('Vui lòng chọn hình thức thanh toán')
      return
    }
    try {
      setConfirming(true)
      if (!paymentInfo?.idDangKy) throw new Error('Không tìm thấy thông tin thanh toán')
      const result = await confirmPayment(paymentInfo.idDangKy, paymentMethod, notes)
      setReceipt(result.receipt)
      setPaymentInfo(result.payment)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi xác nhận thanh toán')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return <div className="payment-container"><p>Đang tải...</p></div>
  }

  if (!paymentInfo) {
    return (
      <div className="payment-container">
        <h1>Thanh Toán Học Phí</h1>
        <p className="error">{error || 'Không tìm thấy thông tin thanh toán'}</p>
        <button onClick={() => navigate('/my-registrations')}>Quay Lại</button>
      </div>
    )
  }

  if (receipt) {
    return (
      <div className="payment-container">
        <div className="payment-success">
          <div className="success-icon">✓</div>
          <h2>Thanh Toán Thành Công!</h2>
          <div className="receipt-card">
            <h3>Biên Lai #{receipt.soBienLai}</h3>
            <div className="receipt-details">
              <div className="detail-row">
                <span className="label">Số tiền:</span>
                <span className="value price">{formatVND(receipt.soTien)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Ngày lập:</span>
                <span className="value">{new Date(receipt.ngayLap).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="detail-row">
                <span className="label">Trạng thái:</span>
                <span className={`value status ${receipt.trangThai.toLowerCase()}`}>{receipt.trangThai}</span>
              </div>
            </div>
            <div className="receipt-actions">
              <button className="btn-print" onClick={() => window.print()}>In Biên Lai</button>
              <button className="btn-continue" onClick={() => navigate('/my-registrations')}>Quay Lại</button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-container">
      <h1>Thanh Toán Học Phí</h1>
      <form className="payment-form" onSubmit={handleConfirmPayment}>
        <div className="payment-info">
          <h3>Thông Tin Thanh Toán</h3>
          <div className="info-row">
            <span className="label">Số tiền:</span>
            <span className="value price">{formatVND(paymentInfo.soTien)}</span>
          </div>
          <div className="info-row">
            <span className="label">Trạng thái:</span>
            <span className={`value status ${paymentInfo.trangThaiThanhToan.toLowerCase()}`}>
              {getPaymentStatusLabel(paymentInfo.trangThaiThanhToan)}
            </span>
          </div>
        </div>
        {paymentInfo.trangThaiThanhToan === 'Chưa' && (
          <>
            <div className="form-group">
              <label>Hình Thức Thanh Toán *</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} disabled={confirming}>
                <option value="">-- Chọn hình thức --</option>
                <option value="Manual">Thanh toán trực tiếp</option>
                <option value="Online">Thanh toán online</option>
                <option value="Transfer">Chuyển khoản</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ghi Chú (Tùy Chọn)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Nhập ghi chú..." disabled={confirming} />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn-submit" disabled={confirming || !paymentMethod}>
              {confirming ? 'Đang xử lý...' : 'Xác Nhận Thanh Toán'}
            </button>
          </>
        )}
        {paymentInfo.trangThaiThanhToan !== 'Chưa' && (
          <div className="payment-completed">
            <p>✓ Thanh toán đã được xác nhận</p>
            <button type="button" onClick={() => navigate('/my-registrations')}>Quay Lại</button>
          </div>
        )}
      </form>
    </div>
  )
}

export default PaymentPage