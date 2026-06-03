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
    void loadPaymentInfo()
  }, [id])

  const loadPaymentInfo = async () => {
    try {
      setLoading(true)
      setError(null)
      if (!id) throw new Error('Không tìm thấy ID thanh toán')

      const data = await getPaymentInfo(parseInt(id))
      setPaymentInfo(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định'
      setError(errorMsg)
      setPaymentInfo(null)
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
    return <div className="page-shell"><div className="course-status">Đang tải thông tin thanh toán...</div></div>
  }

  if (!paymentInfo) {
    return (
      <div className="page-shell">
        <div className="course-error">{error || 'Không tìm thấy thông tin thanh toán'}</div>
        <button className="course-action" style={{ maxWidth: 240 }} onClick={() => navigate('/lop-cua-toi')}>
          ← Quay lại lớp của tôi
        </button>
      </div>
    )
  }

  if (receipt) {
    return (
      <div className="page-shell payment-page">
        <section className="hero-banner payment-hero">
          <div>
            <div className="muted-pill" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>Thanh toán thành công</div>
            <h1 className="payment-title">Đơn hàng đã được xác nhận</h1>
            <p className="payment-subtitle">Biên lai của bạn đã được ghi nhận trong hệ thống.</p>
          </div>
        </section>

        <div className="payment-success-grid">
          <div className="surface-card payment-receipt">
            <h3>Biên lai #{receipt.soBienLai}</h3>
            <div className="payment-detail-row">
              <span>Số tiền</span>
              <strong>{formatVND(receipt.soTien)}</strong>
            </div>
            <div className="payment-detail-row">
              <span>Ngày lập</span>
              <strong>{new Date(receipt.ngayLap).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</strong>
            </div>
            <div className="payment-detail-row">
              <span>Trạng thái</span>
              <strong className="payment-badge success">{receipt.trangThai}</strong>
            </div>
          </div>

          <div className="payment-actions">
            <button className="course-action" onClick={() => window.print()}>In biên lai</button>
            <button className="payment-secondary-btn" onClick={() => navigate('/lop-cua-toi')}>Đến lớp của tôi</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell payment-page">
      <section className="hero-banner payment-hero">
        <div>
          <button className="payment-back" onClick={() => navigate('/khoa-hoc')}>
            ← Quay lại khóa học
          </button>
          <div className="muted-pill" style={{ background: 'rgba(255,255,255,0.14)', color: '#fff' }}>Thanh toán học phí</div>
          <h1 className="payment-title">Hoàn tất đăng ký khóa học</h1>
          <p className="payment-subtitle">Chọn phương thức và xác nhận để hoàn thiện giao dịch của bạn.</p>
        </div>
      </section>

      <div className="payment-grid">
        <aside className="surface-card payment-summary-card">
          <h3>Thông tin thanh toán</h3>
          <div className="payment-summary-block">
            <span>Số tiền cần thanh toán</span>
            <strong>{formatVND(paymentInfo.soTien)}</strong>
          </div>
          <div className="payment-summary-block">
            <span>Trạng thái</span>
            <strong className={`payment-badge ${paymentInfo.trangThaiThanhToan === 'Chưa' ? 'pending' : 'success'}`}>
              {getPaymentStatusLabel(paymentInfo.trangThaiThanhToan)}
            </strong>
          </div>
          <div className="payment-note">Giao dịch sẽ được lưu thành biên lai sau khi xác nhận.</div>
        </aside>

        <form className="surface-card payment-form-card" onSubmit={handleConfirmPayment}>
          {paymentInfo.trangThaiThanhToan === 'Chưa' ? (
            <>
              <h3>Chọn phương thức</h3>

              <label className="payment-label">
                Hình thức thanh toán
                <select className="auth-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} disabled={confirming}>
                  <option value="">-- Chọn phương thức thanh toán --</option>
                  <option value="Manual">Thanh toán trực tiếp</option>
                  <option value="Transfer">Chuyển khoản ngân hàng</option>
                  <option value="Online">Thanh toán online</option>
                </select>
              </label>

              <label className="payment-label">
                Ghi chú (tùy chọn)
                <textarea className="auth-input payment-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Thêm ghi chú nếu cần..." disabled={confirming} />
              </label>

              {error && <div className="course-error">⚠ {error}</div>}

              <button className="auth-button" type="submit" disabled={confirming || !paymentMethod}>
                {confirming ? 'Đang xử lý thanh toán...' : 'Xác nhận thanh toán'}
              </button>
            </>
          ) : (
            <div className="payment-done-box">
              <div className="payment-done-icon">✅</div>
              <h3>Thanh toán đã được xác nhận</h3>
              <p>Bạn có thể tiếp tục đến lớp của mình.</p>
              <button className="course-action" type="button" onClick={() => navigate('/lop-cua-toi')}>
                Đến lớp của tôi
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default PaymentPage