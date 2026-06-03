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

    const pendingCount = filteredCandidates.filter((item) => item.duDieuKienCap && !item.daCoChungChi).length
    const issuedCount = filteredCandidates.filter((item) => item.daCoChungChi).length
    const qualifiedButNotIssuedCount = filteredCandidates.filter((item) => item.duDieuKienCap && !item.daCoChungChi).length

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
        const toApprove = filteredCandidates.filter((c) => c.duDieuKienCap && !c.daCoChungChi)
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

            {/* Stats for selected class */}
            {selectedClassId && (
                <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: 20 }}>
                    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
                        <div style={{ color: '#64748b', fontSize: 13 }}>Chờ duyệt</div>
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
            {selectedClassId && qualifiedButNotIssuedCount > 0 && (
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
                        ✓ Duyệt cấp tất cả ({qualifiedButNotIssuedCount})
                    </button>
                </div>
            )}

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc' }}>
                            <th>Học viên</th>
                            <th>Điểm chuyên cần</th>
                            <th>Điểm thi</th>
                            <th>Điểm TB</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!selectedClassId ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>
                                    Vui lòng chọn lớp để xem danh sách học viên
                                </td>
                            </tr>
                        ) : filteredCandidates.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>
                                    Lớp này không có học viên cần duyệt chứng chỉ
                                </td>
                            </tr>
                        ) : (
                            filteredCandidates.map((candidate) => (
                                <tr key={candidate.idKetQua}>
                                    <td>{candidate.hoTenHocVien || '-'}</td>
                                    <td style={{ textAlign: 'center' }}>-</td>
                                    <td style={{ textAlign: 'center' }}>-</td>
                                    <td style={{ textAlign: 'center', fontWeight: 600 }}>
                                        {candidate.diemTrungBinh?.toFixed(2) || '-'}
                                    </td>
                                    <td>
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                padding: '4px 8px',
                                                borderRadius: 4,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                background: candidate.daCoChungChi ? '#dcfce7' : candidate.duDieuKienCap ? '#fef3c7' : '#fee2e2',
                                                color: candidate.daCoChungChi ? '#15803d' : candidate.duDieuKienCap ? '#b45309' : '#991b1b',
                                            }}
                                        >
                                            {candidate.daCoChungChi ? `✓ Đã cấp${candidate.ngayCap ? ` (${new Date(candidate.ngayCap).toLocaleDateString('vi-VN')})` : ''}` : candidate.duDieuKienCap ? '⏳ Chờ duyệt' : '✗ Chưa đạt'}
                                        </span>
                                    </td>
                                    <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                        {!candidate.daCoChungChi && candidate.duDieuKienCap && (
                                            <button
                                                onClick={() => handleApprove(candidate.idKetQua)}
                                                disabled={processingId === candidate.idKetQua}
                                                style={{
                                                    padding: '6px 12px',
                                                    background: processingId === candidate.idKetQua ? '#cbd5e1' : '#16a34a',
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
                                        {candidate.daCoChungChi && (
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
