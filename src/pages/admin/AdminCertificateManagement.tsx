import { useEffect, useState, useMemo } from 'react'
import { ketQuaHocTapService } from '../../services/ketQuaHocTapService'
import type { CertificateCandidateDTO } from '../../types/KetQuaHocTap'

interface LopHoc {
    idLop: number
    tenLop: string
    idKhoaHoc: number
    tenKhoaHoc: string
}

export default function AdminCertificateManagement() {
    const [candidates, setCandidates] = useState<CertificateCandidateDTO[]>([])
    const [classes, setClasses] = useState<LopHoc[]>([])
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Filter candidates by selected class
    const filteredCandidates = useMemo(() => {
        if (!selectedClassId) return []
        return candidates.filter((c) => c.idLop === selectedClassId)
    }, [candidates, selectedClassId])

    const notEligibleCount = filteredCandidates.filter((item) => item.trangThaiChungChi === 'Không đủ điều kiện').length
    const pendingCount = filteredCandidates.filter((item) => item.trangThaiChungChi === 'Chưa cấp').length
    const issuedCount = filteredCandidates.filter((item) => item.trangThaiChungChi === 'Đã cấp').length

    useEffect(() => {
        void loadData()
    }, [])

    async function loadData() {
        try {
            setLoading(true)
            // Load candidates
            const candidatesRes = await ketQuaHocTapService.getCertificateCandidates()
            setCandidates(Array.isArray(candidatesRes.data) ? candidatesRes.data : [])

            // Load classes from candidates (get unique classes with certificate courses)
            if (Array.isArray(candidatesRes.data)) {
                const uniqueClasses = Array.from(
                    new Map(
                        candidatesRes.data.map((c: CertificateCandidateDTO) => [
                            c.idLop,
                            {
                                idLop: c.idLop,
                                tenLop: c.tenLop,
                                idKhoaHoc: c.idKhoaHoc,
                                tenKhoaHoc: c.tenKhoaHoc,
                            } as LopHoc,
                        ]),
                    ).values(),
                )
                setClasses(uniqueClasses)
                // Auto-select first class if exists
                if (uniqueClasses.length > 0) {
                    setSelectedClassId(uniqueClasses[0].idLop)
                }
            }
            setError(null)
        } catch (err) {
            console.error('Lỗi tải dữ liệu:', err)
            setError('Không thể tải dữ liệu')
        } finally {
            setLoading(false)
        }
    }


    const handleApprove = async (idKetQua: number) => {
        try {
            setProcessingId(idKetQua)
            await ketQuaHocTapService.approveCertificate(idKetQua)
            alert('Đã duyệt cấp chứng chỉ')
            await loadData()
        } catch (err: any) {
            console.error('Lỗi duyệt chứng chỉ:', err)
            alert(err?.response?.data?.message || 'Không thể duyệt chứng chỉ')
        } finally {
            setProcessingId(null)
        }
    }

    const handleRevoke = async (idChungChi: number) => {
        if (!confirm('Bạn chắc chắn muốn thu hồi chứng chỉ này?')) return

        try {
            setProcessingId(idChungChi)
            await ketQuaHocTapService.revokeCertificate(idChungChi)
            alert('Đã thu hồi chứng chỉ')
            await loadData()
        } catch (err: any) {
            console.error('Lỗi thu hồi chứng chỉ:', err)
            alert(err?.response?.data?.message || 'Không thể thu hồi chứng chỉ')
        } finally {
            setProcessingId(null)
        }
    }

    const handleBulkApprove = async () => {
        const toApprove = filteredCandidates.filter((c) => c.trangThaiChungChi === 'Chưa cấp')
        if (toApprove.length === 0) {
            alert('Không có học viên nào cần duyệt')
            return
        }

        if (!confirm(`Duyệt cấp ${toApprove.length} chứng chỉ?`)) return

        try {
            for (const candidate of toApprove) {
                setProcessingId(candidate.idKetQua)
                await ketQuaHocTapService.approveCertificate(candidate.idKetQua)
            }
            alert(`Đã duyệt cấp ${toApprove.length} chứng chỉ`)
            await loadData()
        } catch (err: any) {
            console.error('Lỗi duyệt chứng chỉ:', err)
            alert(err?.response?.data?.message || 'Lỗi khi duyệt')
        } finally {
            setProcessingId(null)
        }
    }


    if (loading) {
        return <div>Đang tải dữ liệu...</div>
    }

    return (
        <div>
            <h2>Quản Lý Chứng Chỉ</h2>
            <p style={{ color: '#64748b', marginTop: 0 }}>
                Chọn lớp để xem danh sách học viên và duyệt cấp chứng chỉ (điểm TB ≥ 5.0).
            </p>

            {error && <div style={{ color: 'crimson', marginBottom: 16 }}>{error}</div>}

            {/* Class Selection */}
            <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Chọn lớp:</label>
                <select
                    value={selectedClassId ?? ''}
                    onChange={(e) => setSelectedClassId(Number(e.target.value) || null)}
                    style={{
                        width: '100%',
                        maxWidth: 400,
                        padding: '8px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: 6,
                        fontSize: 14,
                    }}
                >
                    <option value="">-- Chọn lớp --</option>
                    {classes.map((cls) => (
                        <option key={cls.idLop} value={cls.idLop}>
                            {cls.tenLop} · {cls.tenKhoaHoc}
                        </option>
                    ))}
                </select>
            </div>

            {/* Display Selected Course Info */}
            {selectedClassId && (
                <div style={{ marginBottom: 20, padding: '16px 20px', background: '#f0f9ff', borderLeft: '4px solid #0ea5e9', borderRadius: '0 8px 8px 0' }}>
                    <h3 style={{ margin: '0 0 4px 0', color: '#0369a1', fontSize: 18 }}>
                        Khóa học: {classes.find(c => c.idLop === selectedClassId)?.tenKhoaHoc}
                    </h3>
                    <div style={{ color: '#0c4a6e', fontSize: 14 }}>
                        Lớp: <strong>{classes.find(c => c.idLop === selectedClassId)?.tenLop}</strong>
                    </div>
                </div>
            )}

            {/* Stats for selected class */}
            {selectedClassId && (
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: 20 }}>
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
                        <div style={{ color: '#64748b', fontSize: 13 }}>Không đạt</div>
                        <div style={{ fontWeight: 700, fontSize: 24, marginTop: 4 }}>{notEligibleCount}</div>
                    </div>
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
                        <div style={{ color: '#64748b', fontSize: 13 }}>Chưa cấp</div>
                        <div style={{ fontWeight: 700, fontSize: 24, marginTop: 4 }}>{pendingCount}</div>
                    </div>
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
                        <div style={{ color: '#64748b', fontSize: 13 }}>Đã cấp</div>
                        <div style={{ fontWeight: 700, fontSize: 24, marginTop: 4 }}>{issuedCount}</div>
                    </div>
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
                        <div style={{ color: '#64748b', fontSize: 13 }}>Tổng học viên</div>
                        <div style={{ fontWeight: 700, fontSize: 24, marginTop: 4 }}>{filteredCandidates.length}</div>
                    </div>
                </div>
            )}

            {/* Bulk action button */}
            {selectedClassId && pendingCount > 0 && (
                <div style={{ marginBottom: 16 }}>
                    <button
                        onClick={handleBulkApprove}
                        style={{
                            padding: '10px 16px',
                            background: '#16a34a',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        ✓ Duyệt cấp tất cả ({pendingCount})
                    </button>
                </div>
            )}

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Học viên</th>
                            <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Lớp</th>
                            <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Điểm TB</th>
                            <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Trạng thái thi</th>
                            <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Trạng thái chứng chỉ</th>
                            <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!selectedClassId ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>
                                    Vui lòng chọn lớp để xem danh sách học viên
                                </td>
                            </tr>
                        ) : filteredCandidates.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>
                                    Lớp này không có học viên cần duyệt chứng chỉ
                                </td>
                            </tr>
                        ) : (
                            filteredCandidates.map((candidate) => (
                                <tr key={candidate.idKetQua}>
                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{candidate.hoTenHocVien || '-'}</td>
                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>{candidate.tenLop || '-'}</td>
                                    <td style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>
                                        {candidate.diemTrungBinh?.toFixed(2) || '-'}
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                padding: '4px 8px',
                                                borderRadius: 4,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                background: candidate.ketLuan === 'Đạt' ? '#dcfce7' : '#f1f5f9',
                                                color: candidate.ketLuan === 'Đạt' ? '#15803d' : '#64748b',
                                            }}
                                        >
                                            {candidate.ketLuan || 'Chưa có'}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                                        {candidate.trangThaiChungChi === 'Không đủ điều kiện' && (
                                            <span style={{ color: '#94a3b8' }}>Không đạt</span>
                                        )}
                                        {candidate.trangThaiChungChi === 'Chưa cấp' && (
                                            <span style={{ color: '#ca8a04', fontWeight: 600 }}>Chưa cấp</span>
                                        )}
                                        {candidate.trangThaiChungChi === 'Đã cấp' && (
                                            <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ Đã cấp</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
                                        {candidate.trangThaiChungChi === 'Chưa cấp' && (
                                            <button
                                                onClick={() => handleApprove(candidate.idKetQua)}
                                                disabled={processingId === candidate.idKetQua}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: processingId === candidate.idKetQua ? '#cbd5e1' : '#3b82f6',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    cursor: processingId === candidate.idKetQua ? 'not-allowed' : 'pointer',
                                                    fontSize: 12,
                                                }}
                                            >
                                                {processingId === candidate.idKetQua ? '...' : 'Duyệt cấp'}
                                            </button>
                                        )}
                                        {candidate.trangThaiChungChi === 'Đã cấp' && (
                                            <button
                                                onClick={() => candidate.idChungChi && handleRevoke(candidate.idChungChi)}
                                                disabled={processingId === candidate.idChungChi}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: processingId === candidate.idChungChi ? '#cbd5e1' : '#dc2626',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: 4,
                                                    cursor: processingId === candidate.idChungChi ? 'not-allowed' : 'pointer',
                                                    fontSize: 12,
                                                }}
                                            >
                                                {processingId === candidate.idChungChi ? '...' : 'Thu hồi'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
