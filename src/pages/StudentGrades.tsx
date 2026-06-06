import { useEffect, useState } from 'react'
import { getMyLearningResults } from '../services/examService'

interface LearningResult {
    idDangKy: number
    tenKhoaHoc: string
    tenLop: string
    ngayBatDau: string | null
    ngayKetThuc: string | null
    diemLyThuyet: number | null
    diemThucHanh: number | null
    diemTrungBinh: number | null
    ketLuan: string | null
    trangThaiDangKy: string
}

export default function StudentGrades() {
    const [results, setResults] = useState<LearningResult[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { void load() }, [])

    const load = async () => {
        setLoading(true)
        try {
            const res = await getMyLearningResults()
            setResults(Array.isArray(res) ? res : [])
        } catch (err) {
            console.error(err)
        } finally { setLoading(false) }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A'
        return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const getStatusColor = (ketLuan: string | null) => {
        if (!ketLuan) return '#999'
        if (ketLuan.toLowerCase().includes('đạt') || ketLuan.toLowerCase().includes('pass')) return '#22c55e'
        if (ketLuan.toLowerCase().includes('không') || ketLuan.toLowerCase().includes('fail')) return '#ef4444'
        return '#999'
    }

    const getStatusBg = (ketLuan: string | null) => {
        if (!ketLuan) return '#f3f4f6'
        if (ketLuan.toLowerCase().includes('đạt') || ketLuan.toLowerCase().includes('pass')) return '#f0fdf4'
        if (ketLuan.toLowerCase().includes('không') || ketLuan.toLowerCase().includes('fail')) return '#fef2f2'
        return '#f3f4f6'
    }

    return (
        <div className="page-shell" style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: 20 }}>Kết Quả Học Tập</h2>
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <div>
                    {results.length === 0 && <div>Chưa có kết quả học tập.</div>}
                    {results.length > 0 && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                <thead>
                                    <tr style={{
                                        background: 'linear-gradient(135deg, #0f4c81 0%, #0b78b3 100%)',
                                        color: 'white',
                                        textAlign: 'left'
                                    }}>
                                        <th style={{ padding: '12px' }}>Khóa Học</th>
                                        <th>Lớp Học</th>
                                        <th>Ngày Bắt Đầu</th>
                                        <th>Ngày Kết Thúc</th>
                                        <th style={{ textAlign: 'center' }}>Điểm lý thuyết</th>
                                        <th style={{ textAlign: 'center' }}>Điểm thực hành</th>
                                        <th style={{ textAlign: 'center' }}>Điểm Trung Bình</th>
                                        <th>Kết Luận</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.map((result, idx) => (
                                        <tr key={result.idDangKy} style={{
                                            borderBottom: '1px solid #e5e7eb',
                                            background: idx % 2 === 0 ? '#fafbfc' : 'white'
                                        }}>
                                            <td style={{ padding: '12px', fontWeight: 500 }}>{result.tenKhoaHoc}</td>
                                            <td>{result.tenLop}</td>
                                            <td>{formatDate(result.ngayBatDau)}</td>
                                            <td>{formatDate(result.ngayKetThuc)}</td>
                                            <td style={{ textAlign: 'center', fontWeight: 600 }}>
                                                {result.diemLyThuyet !== null ? result.diemLyThuyet.toFixed(1) : '-'}
                                            </td>
                                            <td style={{ textAlign: 'center', fontWeight: 600 }}>
                                                {result.diemThucHanh !== null ? result.diemThucHanh.toFixed(1) : '-'}
                                            </td>
                                            <td style={{
                                                textAlign: 'center',
                                                fontWeight: 700,
                                                color: '#0f4c81',
                                                fontSize: '15px'
                                            }}>
                                                {result.diemTrungBinh !== null ? result.diemTrungBinh.toFixed(2) : '-'}
                                            </td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '4px',
                                                    background: getStatusBg(result.ketLuan),
                                                    color: getStatusColor(result.ketLuan),
                                                    fontWeight: 600,
                                                    fontSize: '13px',
                                                    display: 'inline-block'
                                                }}>
                                                    {result.ketLuan || '-'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

