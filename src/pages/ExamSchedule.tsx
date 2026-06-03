import { useEffect, useState } from 'react'
import { getMyExamSchedules, registerForExam, getMyGrades } from '../services/examService'

export default function ExamSchedule() {
    const [schedules, setSchedules] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [registering, setRegistering] = useState<number | null>(null)
    const [myRegistrations, setMyRegistrations] = useState<number[]>([])

    useEffect(() => {
        void load()
    }, [])

    const load = async () => {
        setLoading(true)
        try {
            const data = await getMyExamSchedules()
            setSchedules(Array.isArray(data) ? data : [])
            const grades = await getMyGrades()
            const registered = Array.isArray(grades) ? grades.map((g: any) => g.IdLichThi) : []
            setMyRegistrations(registered)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (id: number) => {
        if (!window.confirm('Xác nhận đăng ký thi?')) return
        try {
            setRegistering(id)
            await registerForExam(id)
            alert('Đăng ký thành công')
            await load()
        } catch (err: any) {
            console.error(err)
            alert(err?.response?.data?.message || 'Không thể đăng ký')
        } finally {
            setRegistering(null)
        }
    }

    return (
        <div className="page-shell">
            <h2>Lịch Thi</h2>
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                    {schedules.length === 0 && <div>Không có lịch thi.</div>}
                    {schedules.map((s) => (
                        <div key={s.idLichThi || s.IdLichThi} style={{ border: '1px solid #e2e8f0', padding: 12, borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: 700 }}>{s.tenLop ?? s.TenLop}</div>
                                <div style={{ color: '#64748b' }}>{new Date(s.ngayThi ?? s.NgayThi).toLocaleString()}</div>
                                <div style={{ color: '#64748b' }}>Phòng: {s.tenPhong ?? s.TenPhong ?? 'N/A'}</div>
                            </div>
                            <div>
                                {myRegistrations.includes(s.idLichThi ?? s.IdLichThi) ? (
                                    <button disabled className="auth-button auth-button--muted">Đã đăng ký</button>
                                ) : (
                                    <button onClick={() => handleRegister(s.idLichThi ?? s.IdLichThi)} disabled={registering !== null} className="auth-button">{registering === (s.idLichThi ?? s.IdLichThi) ? 'Đang...' : 'Đăng ký'}</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
