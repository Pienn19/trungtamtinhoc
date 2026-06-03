import { useEffect, useState } from 'react'
import { getMyExamSchedules, registerForExam, getMyGrades } from '../services/examService'

export default function ExamRegistration() {
    const [schedules, setSchedules] = useState<any[]>([])
    const [registeredIds, setRegisteredIds] = useState<number[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { void load() }, [])

    const load = async () => {
        setLoading(true)
        try {
            const sch = await getMyExamSchedules()
            const grades = await getMyGrades()
            setSchedules(Array.isArray(sch) ? sch : [])
            setRegisteredIds(Array.isArray(grades) ? grades.map((g: any) => g.IdLichThi) : [])
        } catch (err) {
            console.error(err)
        } finally { setLoading(false) }
    }

    const handleRegister = async (id: number) => {
        if (!window.confirm('Xác nhận đăng ký thi?')) return
        try {
            await registerForExam(id)
            alert('Đăng ký thành công')
            await load()
        } catch (err: any) {
            console.error(err)
            alert(err?.response?.data?.message || 'Không thể đăng ký')
        }
    }

    return (
        <div className="page-shell">
            <h2>Đăng ký Thi</h2>
            {loading ? <p>Đang tải...</p> : (
                <div>
                    {schedules.length === 0 && <div>Không có lịch thi gần đây.</div>}
                    {schedules.map((s) => (
                        <div key={s.idLichThi ?? s.IdLichThi} style={{ border: '1px solid #e2e8f0', padding: 12, borderRadius: 8, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontWeight: 700 }}>{s.tenLop ?? s.TenLop}</div>
                                <div style={{ color: '#64748b' }}>{new Date(s.ngayThi ?? s.NgayThi).toLocaleString()}</div>
                                <div style={{ color: '#64748b' }}>Phòng: {s.tenPhong ?? s.TenPhong ?? 'N/A'}</div>
                            </div>
                            <div>
                                {registeredIds.includes(s.idLichThi ?? s.IdLichThi) ? (
                                    <span style={{ color: '#16a34a', fontWeight: 700 }}>Đã đăng ký</span>
                                ) : (
                                    <button onClick={() => handleRegister(s.idLichThi ?? s.IdLichThi)} className="auth-button">Đăng ký</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
