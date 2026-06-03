import { useEffect, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../../services/axiosClient'
import { normalizeUserRole } from '../../utils/authHelper'

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

export default function InstructorClassTransferReview() {
    const navigate = useNavigate()
    const userRole = normalizeUserRole(localStorage.getItem('userRole'))
    const username = localStorage.getItem('username') || 'GiangVien'

    const [transfers, setTransfers] = useState<TransferItem[]>([])
    const [loading, setLoading] = useState(false)
    const [requestingId, setRequestingId] = useState<number | null>(null)

    useEffect(() => {
        void loadTransfers()
    }, [])

    const loadTransfers = async () => {
        try {
            setLoading(true)
            const res = await axiosClient.get('/chuyenlop')
            setTransfers(Array.isArray(res.data) ? res.data : [])
        } catch (error) {
            console.error('Error loading transfer reviews:', error)
            setTransfers([])
        } finally {
            setLoading(false)
        }
    }

    const handleRequestConfirmation = async (id: number) => {
        try {
            setRequestingId(id)
            await axiosClient.put(`/chuyenlop/${id}/request-confirmation`, {
                nguoiPheDuyet: username,
            })
            alert('Đã gửi yêu cầu xác nhận cho Admin')
            await loadTransfers()
        } catch (error: any) {
            alert(error?.response?.data?.message || error?.message || 'Không thể gửi yêu cầu xác nhận')
        } finally {
            setRequestingId(null)
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
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#2563eb',
                            cursor: 'pointer',
                            fontSize: '14px',
                            marginBottom: '8px',
                            padding: 0,
                            textDecoration: 'underline',
                        }}
                    >
                        ← Về trang chủ
                    </button>
                    <p style={styles.kicker}>Giảng viên / Chuyển lớp</p>
                    <h1 style={styles.title}>Xem và xác nhận đơn chuyển lớp</h1>
                    <p style={styles.subtitle}>
                        Giảng viên xem các đơn chờ xử lý và gửi yêu cầu xác nhận để Admin duyệt cuối cùng.
                    </p>
                </div>
                <div style={styles.userPill}>{username}</div>
            </div>

            {userRole !== 'GiangVien' && userRole !== 'Admin' && (
                <div style={styles.notice}>Trang này chỉ dành cho giảng viên hoặc admin.</div>
            )}

            {loading ? (
                <div style={styles.emptyState}>Đang tải...</div>
            ) : transfers.length === 0 ? (
                <div style={styles.emptyState}>Chưa có đơn chuyển lớp nào.</div>
            ) : (
                <div style={styles.tableCard}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Học viên</th>
                                <th>Lớp cũ</th>
                                <th>Lớp mới</th>
                                <th>Ngày chuyển</th>
                                <th>Trạng thái</th>
                                <th>Lý do</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.map((transfer) => (
                                <tr key={transfer.idChuyenLop}>
                                    <td>{transfer.idChuyenLop}</td>
                                    <td>
                                        <div style={styles.primaryCell}>{transfer.hoTenHocVien || `Học viên #${transfer.idHocVien}`}</div>
                                        <div style={styles.secondaryCell}>ID HV: {transfer.idHocVien}</div>
                                    </td>
                                    <td>{transfer.tenLopCu}</td>
                                    <td>{transfer.tenLopMoi}</td>
                                    <td>{new Date(transfer.ngayChuyenLop).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <span style={{ ...styles.statusBadge, color: getStatusColor(transfer.trangThai), backgroundColor: `${getStatusColor(transfer.trangThai)}15` }}>
                                            {transfer.trangThai}
                                        </span>
                                    </td>
                                    <td>{transfer.lyDo || '--'}</td>
                                    <td>
                                        {transfer.trangThai === 'Pending' ? (
                                            <button
                                                type="button"
                                                style={styles.primaryButton}
                                                onClick={() => handleRequestConfirmation(transfer.idChuyenLop)}
                                                disabled={requestingId === transfer.idChuyenLop}
                                            >
                                                {requestingId === transfer.idChuyenLop ? 'Đang gửi...' : 'Yêu cầu xác nhận'}
                                            </button>
                                        ) : (
                                            <span style={styles.mutedText}>--</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

const styles: Record<string, CSSProperties> = {
    container: {
        padding: '24px',
        maxWidth: '1280px',
        margin: '0 auto',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap',
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
        maxWidth: '780px',
    },
    userPill: {
        padding: '10px 14px',
        borderRadius: '999px',
        background: '#e2e8f0',
        color: '#0f172a',
        fontWeight: 700,
    },
    notice: {
        padding: '12px 14px',
        borderRadius: '12px',
        background: '#fef3c7',
        color: '#92400e',
        marginBottom: '16px',
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
    primaryCell: {
        fontWeight: 700,
        color: '#0f172a',
    },
    secondaryCell: {
        marginTop: 4,
        fontSize: 12,
        color: '#64748b',
    },
    statusBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '6px 10px',
        borderRadius: '999px',
        fontSize: '13px',
        fontWeight: 700,
    },
    primaryButton: {
        padding: '8px 12px',
        background: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: 700,
    },
    mutedText: {
        color: '#94a3b8',
    },
}
