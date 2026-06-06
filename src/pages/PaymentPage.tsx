import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { ThanhToanDTO, BienLaiDTO } from '../types/KhoaHoc'
import { confirmPayment, getPaymentInfo, getPaymentStatusLabel, getReceiptByRegistrationId } from '../services/paymentService'
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
      
      // If already paid, try fetching the receipt right away
      if (data.trangThaiThanhToan !== 'Chưa') {
          try {
              const receiptData = await getReceiptByRegistrationId(parseInt(id));
              setReceipt(receiptData);
          } catch (e) {
              console.error("Could not fetch receipt", e);
          }
      }
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', marginTop: '20px' }}>
          <div className="surface-card payment-receipt" style={{ padding: '40px', width: '100%', maxWidth: '600px', backgroundColor: '#fff' }}>
            <div className="receipt-header" style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px dashed #eee', paddingBottom: '20px' }}>
                <h2 style={{ color: '#1E3C72', margin: 0, fontSize: '24px' }}>TRUNG TÂM TIN HỌC PYTECH</h2>
                <p style={{ margin: '5px 0 0', color: '#666' }}>123 Đường Công Nghệ, Quận IT, TP.HCM</p>
                <p style={{ margin: '0 0 10px', color: '#666' }}>Hotline: 1900 1234 - Email: contact@pytech.edu.vn</p>
                <h3 style={{ margin: '20px 0 0', color: '#333', fontSize: '20px', textTransform: 'uppercase' }}>Hóa Đơn Thanh Toán Học Phí</h3>
                <p style={{ margin: '5px 0 0', color: '#888', fontSize: '14px' }}>Mã số: {receipt.soBienLai}</p>
            </div>
            
            <div className="receipt-body" style={{ marginBottom: '30px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px', color: '#1E3C72', fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Thông tin học viên</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '14px' }}>
                        <span style={{ color: '#666' }}>Họ tên:</span><strong>{receipt.hocVienInfo?.hoTen || 'Không rõ'}</strong>
                        <span style={{ color: '#666' }}>Email:</span><strong>{receipt.hocVienInfo?.email || 'Không rõ'}</strong>
                        <span style={{ color: '#666' }}>Điện thoại:</span><strong>{receipt.hocVienInfo?.dienThoai || 'Không rõ'}</strong>
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 10px', color: '#1E3C72', fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Thông tin khóa học</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '14px' }}>
                        <span style={{ color: '#666' }}>Khóa học:</span><strong>{receipt.khoaHocInfo?.tenKhoaHoc || 'Không rõ'}</strong>
                        <span style={{ color: '#666' }}>Lớp học:</span><strong>{receipt.lopHocInfo?.tenLop || 'Không rõ'}</strong>
                    </div>
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <h4 style={{ margin: '0 0 10px', color: '#1E3C72', fontSize: '16px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Chi tiết thanh toán</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '14px' }}>
                        <span style={{ color: '#666' }}>Ngày lập:</span><strong>{new Date(receipt.ngayLap).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</strong>
                        <span style={{ color: '#666' }}>Trạng thái:</span><strong style={{ color: '#2e7d32' }}>{receipt.trangThai === 'Active' || receipt.trangThai === 'Đã' ? 'Thành công' : receipt.trangThai}</strong>
                        <span style={{ color: '#666' }}>Số tiền:</span><strong style={{ fontSize: '18px', color: '#d32f2f' }}>{formatVND(receipt.soTien)}</strong>
                    </div>
                </div>
            </div>
            
            <div className="receipt-footer" style={{ textAlign: 'center', marginTop: '30px', borderTop: '2px dashed #eee', paddingTop: '20px' }}>
                <p style={{ margin: '0 0 5px', fontSize: '14px', fontStyle: 'italic', color: '#666' }}>Cảm ơn bạn đã đăng ký khóa học tại PyTech!</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>Đây là hóa đơn điện tử hợp lệ, không cần chữ ký đóng dấu.</p>
            </div>
          </div>

          <div className="payment-actions" style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button className="course-action" style={{ padding: '12px 24px', minWidth: '160px' }} onClick={() => window.print()}>In biên lai</button>
            <button className="payment-secondary-btn" style={{ padding: '12px 24px', minWidth: '160px' }} onClick={() => navigate('/lop-cua-toi')}>Đến lớp của tôi</button>
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
              <div className="payment-actions" style={{ justifyContent: 'center', marginTop: '20px' }}>
                <button className="course-action" type="button" onClick={() => navigate('/lop-cua-toi')}>
                  Đến lớp của tôi
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default PaymentPage