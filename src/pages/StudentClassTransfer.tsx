import { useEffect, useState, type CSSProperties, type ChangeEvent, type FormEvent } from 'react'
import axiosClient from '../services/axiosClient'
import { normalizeUserRole } from '../utils/authHelper'

interface LopHoc {
    idLop: number
    tenLop: string
}

interface TransferItem {
    idChuyenLop: number
    idHocVien: number
    hoTenHocVien?: string
    idLopCu: number
    tenLopCu?: string
    idLopMoi: number
    tenLopMoi?: string
    ngayChuyenLop: string
    lyDo?: string
    nguoiPheDuyet?: string
    trangThai: string
}

type StudentForm = {
    idHocVien: string
    idLopCu: string
    idLopMoi: string
    lyDo: string
}

export default function StudentClassTransfer() {
    const userRole = normalizeUserRole(localStorage.getItem('userRole'))
    const currentUserId = Number(localStorage.getItem('userId') || 0)
    const currentUsername = localStorage.getItem('username') || 'HocVien'

    const [classes, setClasses] = useState<LopHoc[]>([])
    const [transfers, setTransfers] = useState<TransferItem[]>([])
    const [loading, setLoading] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [activeClassName, setActiveClassName] = useState('')
    const [form, setForm] = useState<StudentForm>({
        idHocVien: String(currentUserId || ''),
        idLopCu: '',
        idLopMoi: '',
        lyDo: '',
    })

    useEffect(() => {
        void loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [classesRes, transfersRes] = await Promise.all([
                axiosClient.get('/lophoc'),
                axiosClient.get('/chuyenlop/mine'),
            ])

            setClasses(Array.isArray(classesRes.data) ? classesRes.data : [])
            setTransfers(Array.isArray(transfersRes.data) ? transfersRes.data : [])

            try {
                const regRes = await axiosClient.get(`/dangky/by-student/${currentUserId}`)
                const regs = Array.isArray(regRes.data) ? regRes.data : []
                if (regs.length > 0) {
                    const first = regs[0]
                    const lopHocInfo = first.lopHocInfo ?? first.LopHocInfo
                    const hocVienInfo = first.hocVienInfo ?? first.HocVienInfo
                    const lopId = lopHocInfo?.idLop ?? lopHocInfo?.IdLop
                    const lopTen = lopHocInfo?.tenLop ?? lopHocInfo?.TenLop ?? ''
                    const hocVienId = hocVienInfo?.idHocVien ?? hocVienInfo?.IdHocVien ?? currentUserId

                    if (lopId) {
                        setForm((prev) => ({
                            ...prev,
                            idHocVien: String(hocVienId),
                            idLopCu: String(lopId),
                        }))
                        setActiveClassName(lopTen)
                    }
                }
            } catch (err) {
                console.debug('Could not load active registration for current student', err)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = event.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()

        if (!form.idLopCu || !form.idLopMoi) {
            alert('Vui lòng chọn lớp cũ và lớp mới')
            return
        }

        if (form.idLopCu === form.idLopMoi) {
            alert('Lớp cũ và lớp mới phải khác nhau')
            return
        }

        try {
            setSubmitting(true)
            await axiosClient.post('/chuyenlop', {
                idHocVien: Number(form.idHocVien || currentUserId),
                idLopCu: Number(form.idLopCu),
                idLopMoi: Number(form.idLopMoi),
                lyDo: form.lyDo,
            })

            alert('Tạo đơn chuyển lớp thành công')
            setForm((prev) => ({
                ...prev,
                idLopMoi: '',
                lyDo: '',
            }))
            await loadData()
        } catch (error: any) {
            alert(error?.response?.data?.message || error?.message || 'Không thể tạo đơn chuyển lớp')
        } finally {
            setSubmitting(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return '#16a34a'
            case 'Rejected':
                return '#dc2626'
            case 'TeacherRequested':
                return '#2563eb'
            default:
                return '#ca8a04'
        }
    }

    return (
        <div style={styles.page}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <div>
                        <p style={styles.kicker}>Học viên / Chuyển lớp</p>
                        <h1 style={styles.title}>Đơn chuyển lớp của tôi</h1>
                        <p style={styles.subtitle}>
                            Tạo yêu cầu chuyển lớp, giảng viên xác nhận trước và admin duyệt cuối cùng.
                        </p>
                    </div>
                    <div style={styles.userPill}>{currentUsername}</div>
                </div>

                <div style={styles.heroCard}>
                    <div>
                        <div style={styles.heroLabel}>Phiếu chuyển lớp</div>
                        <div style={styles.heroText}>
                            Giao diện được đồng bộ với website: bố cục rõ ràng, thẻ nội dung, trạng thái minh bạch và theo dõi lịch sử ngay bên dưới.
                        </div>
                    </div>
                    <div style={styles.heroStats}>
                        <div style={styles.heroStatBox}>
                            <div style={styles.heroStatValue}>{transfers.length}</div>
                            <div style={styles.heroStatLabel}>Tổng đơn</div>
                        </div>
                        <div style={styles.heroStatBox}>
                            <div style={styles.heroStatValue}>{transfers.filter((item) => item.trangThai === 'Pending').length}</div>
                            <div style={styles.heroStatLabel}>Đang chờ</div>
                        </div>
                        <div style={styles.heroStatBox}>
                            <div style={styles.heroStatValue}>{transfers.filter((item) => item.trangThai === 'Approved').length}</div>
                            <div style={styles.heroStatLabel}>Đã duyệt</div>
                        </div>
                    </div>
                </div>

                <div style={styles.gridLayout}>
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div>
                                <h2 style={styles.cardTitle}>Tạo đơn mới</h2>
                                <p style={styles.cardDesc}>
                                    Lớp hiện tại của bạn: <strong>{activeClassName || 'Đang tải...'}</strong>
                                </p>
                            </div>
                            <button type="button" style={styles.secondaryButton} onClick={loadData}>
                                Làm mới
                            </button>
                        </div>

                        {userRole !== 'HocVien' && (
                            <div style={styles.notice}>Trang này dành cho học viên. Nếu bạn là Admin hoặc Giảng viên, hãy dùng khu vực quản trị tương ứng.</div>
                        )}

                        <form onSubmit={handleSubmit} style={styles.form}>
                            <div style={styles.grid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Lớp cũ *</label>
                                    <select name="idLopCu" value={form.idLopCu} onChange={handleChange} style={styles.control} required>
                                        <option value="">-- Chọn lớp cũ --</option>
                                        {activeClassName ? <option value={form.idLopCu}>{activeClassName}</option> : null}
                                    </select>
                                </div>

                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Lớp mới *</label>
                                    <select name="idLopMoi" value={form.idLopMoi} onChange={handleChange} style={styles.control} required>
                                        <option value="">-- Chọn lớp mới --</option>
                                        {classes.map((lop) => (
                                            <option key={lop.idLop} value={lop.idLop}>
                                                {lop.tenLop}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                                    <label style={styles.label}>Lý do</label>
                                    <textarea
                                        name="lyDo"
                                        value={form.lyDo}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Ví dụ: Xung đột giờ học, chuyển sang ca phù hợp hơn..."
                                        style={{ ...styles.control, ...styles.textarea }}
                                    />
                                </div>
                            </div>

                            <div style={styles.actions}>
                                <button type="submit" style={styles.primaryButton} disabled={submitting}>
                                    {submitting ? 'Đang gửi...' : 'Gửi đơn chuyển lớp'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div style={styles.sidebarCard}>
                        <h3 style={styles.sidebarTitle}>Quy trình</h3>
                        <div style={styles.stepList}>
                            <div style={styles.stepItem}>
                                <span style={styles.stepNumber}>1</span>
                                <div>
                                    <div style={styles.stepTitle}>Học viên tạo đơn</div>
                                    <div style={styles.stepText}>Chọn lớp cũ, lớp mới và ghi rõ lý do.</div>
                                </div>
                            </div>
                            <div style={styles.stepItem}>
                                <span style={styles.stepNumber}>2</span>
                                <div>
                                    <div style={styles.stepTitle}>Giảng viên xem xét</div>
                                    <div style={styles.stepText}>Giảng viên nhận và gửi yêu cầu xác nhận.</div>
                                </div>
                            </div>
                            <div style={styles.stepItem}>
                                <span style={styles.stepNumber}>3</span>
                                <div>
                                    <div style={styles.stepTitle}>Admin duyệt cuối cùng</div>
                                    <div style={styles.stepText}>Đơn chỉ hoàn tất sau khi được admin phê duyệt.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={styles.sectionHeader}>
                    <div>
                        <h2 style={styles.sectionTitle}>Đơn đã gửi</h2>
                        <p style={styles.sectionSubtitle}>Theo dõi trạng thái xử lý của từng yêu cầu.</p>
                    </div>
                </div>

                {loading ? (
                    <div style={styles.emptyState}>Đang tải...</div>
                ) : transfers.length === 0 ? (
                    <div style={styles.emptyState}>Bạn chưa tạo đơn chuyển lớp nào.</div>
                ) : (
                    <div style={styles.tableCard}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Lớp cũ</th>
                                    <th>Lớp mới</th>
                                    <th>Ngày chuyển</th>
                                    <th>Trạng thái</th>
                                    <th>Lý do</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transfers.map((transfer) => (
                                    <tr key={transfer.idChuyenLop}>
                                        <td>{transfer.idChuyenLop}</td>
                                        <td>{transfer.tenLopCu}</td>
                                        <td>{transfer.tenLopMoi}</td>
                                        <td>{new Date(transfer.ngayChuyenLop).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <span style={{ ...styles.statusBadge, color: getStatusColor(transfer.trangThai), backgroundColor: `${getStatusColor(transfer.trangThai)}15` }}>
                                                {transfer.trangThai}
                                            </span>
                                        </td>
                                        <td>{transfer.lyDo || '--'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

const styles: Record<string, CSSProperties> = {
    page: {
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f8fbff 0%, #f3f7fc 100%)',
        paddingBottom: '32px',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '28px 20px 0',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap',
    },
    heroCard: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.5fr) minmax(280px, 0.9fr)',
        gap: '18px',
        padding: '22px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #0f4c81 0%, #0b78b3 100%)',
        color: '#fff',
        boxShadow: '0 16px 40px rgba(14, 92, 143, 0.22)',
        marginBottom: '24px',
    },
    heroLabel: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: '999px',
        background: 'rgba(255,255,255,0.15)',
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        marginBottom: '12px',
    },
    heroText: {
        fontSize: '15px',
        lineHeight: 1.7,
        maxWidth: '760px',
        color: 'rgba(255,255,255,0.92)',
    },
    heroStats: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '10px',
        alignSelf: 'stretch',
    },
    heroStatBox: {
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.16)',
        borderRadius: '16px',
        padding: '16px 14px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '110px',
    },
    heroStatValue: {
        fontSize: '28px',
        fontWeight: 800,
        lineHeight: 1,
    },
    heroStatLabel: {
        marginTop: '8px',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.8)',
    },
    gridLayout: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 0.7fr)',
        gap: '20px',
        alignItems: 'start',
        marginBottom: '24px',
    },
    kicker: {
        margin: 0,
        fontSize: '12px',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#64748b',
    },
    title: {
        margin: '6px 0 0',
        fontSize: '32px',
        lineHeight: 1.15,
        color: '#0f172a',
    },
    subtitle: {
        margin: '8px 0 0',
        color: '#64748b',
        maxWidth: '760px',
    },
    userPill: {
        padding: '10px 14px',
        borderRadius: '999px',
        background: '#e8eef8',
        color: '#12325c',
        fontWeight: 700,
    },
    card: {
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
        marginBottom: '24px',
    },
    sidebarCard: {
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
    },
    sidebarTitle: {
        margin: 0,
        fontSize: '18px',
        color: '#0f172a',
    },
    stepList: {
        display: 'grid',
        gap: '14px',
        marginTop: '14px',
    },
    stepItem: {
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
    },
    stepNumber: {
        width: '28px',
        height: '28px',
        borderRadius: '999px',
        background: '#e0f2fe',
        color: '#0369a1',
        fontWeight: 800,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    stepTitle: {
        fontWeight: 700,
        color: '#0f172a',
        marginBottom: '2px',
    },
    stepText: {
        color: '#64748b',
        fontSize: '13px',
        lineHeight: 1.6,
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
    },
    cardTitle: {
        margin: 0,
        fontSize: '20px',
        color: '#0f172a',
    },
    cardDesc: {
        margin: '6px 0 0',
        color: '#475569',
    },
    notice: {
        padding: '12px 14px',
        borderRadius: '12px',
        background: '#fef3c7',
        color: '#92400e',
        marginBottom: '16px',
    },
    form: { margin: 0 },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '16px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '14px',
        fontWeight: 700,
        color: '#334155',
    },
    control: {
        width: '100%',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        padding: '12px 14px',
        background: '#fff',
        color: '#0f172a',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
    },
    textarea: {
        minHeight: '120px',
        resize: 'vertical',
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '18px',
    },
    primaryButton: {
        padding: '12px 18px',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        fontWeight: 700,
    },
    secondaryButton: {
        padding: '10px 14px',
        border: '1px solid #cbd5e1',
        borderRadius: '12px',
        background: '#fff',
        color: '#334155',
        cursor: 'pointer',
        fontWeight: 700,
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        gap: '12px',
        marginBottom: '12px',
        flexWrap: 'wrap',
    },
    sectionTitle: {
        margin: 0,
        fontSize: '22px',
        color: '#0f172a',
    },
    sectionSubtitle: {
        margin: '6px 0 0',
        color: '#64748b',
    },
    emptyState: {
        padding: '18px',
        border: '1px dashed #cbd5e1',
        borderRadius: '14px',
        background: '#fff',
        color: '#64748b',
    },
    tableCard: {
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflowX: 'auto',
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.05)',
    },
    table: {
        width: '100%',
        borderCollapse: 'separate',
        borderSpacing: 0,
    },
    statusBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: '999px',
        fontSize: '13px',
        fontWeight: 700,
    },
}
