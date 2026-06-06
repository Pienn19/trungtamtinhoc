import React, { useEffect, useMemo, useState } from 'react'
import { ketQuaHocTapService } from '../../services/ketQuaHocTapService'
import type { ClassStudentResultDTO, TeacherClassDTO } from '../../types/KetQuaHocTap'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function InstructorGradesManagement() {
    const [classes, setClasses] = useState<TeacherClassDTO[]>([])
    const [students, setStudents] = useState<ClassStudentResultDTO[]>([])
    const [selectedClassId, setSelectedClassId] = useState<number>(0)
    const [selectedRegistrationId, setSelectedRegistrationId] = useState<number>(0)
    const [studentQuery, setStudentQuery] = useState('')
    const [diemLyThuyet, setDiemLyThuyet] = useState('')
    const [diemThucHanh, setDiemThucHanh] = useState('')
    const [loading, setLoading] = useState(true)
    const [loadingStudents, setLoadingStudents] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [importFile, setImportFile] = useState<File | null>(null)
    const [importing, setImporting] = useState(false)
    const [importResult, setImportResult] = useState<{ processed?: number; errors?: any[] } | null>(null)

    useEffect(() => {
        void loadClasses()
    }, [])

    useEffect(() => {
        if (!selectedClassId) {
            setStudents([])
            setSelectedRegistrationId(0)
            setStudentQuery('')
            return
        }

        void loadStudents(selectedClassId)
    }, [selectedClassId])

    const selectedStudent = useMemo(
        () => students.find((student) => student.idDangKy === selectedRegistrationId) ?? null,
        [students, selectedRegistrationId],
    )

    const selectedClass = useMemo(
        () => classes.find((item) => item.idLop === selectedClassId) ?? null,
        [classes, selectedClassId],
    )

    const filteredStudents = useMemo(() => {
        const query = studentQuery.trim().toLowerCase()
        if (!query) return students

        return students.filter((student) => {
            const name = student.hoTenHocVien?.toLowerCase() ?? ''
            const email = student.emailHocVien?.toLowerCase() ?? ''
            return name.includes(query) || email.includes(query)
        })
    }, [studentQuery, students])

    useEffect(() => {
        if (!selectedStudent) {
            setDiemLyThuyet('')
            setDiemThucHanh('')
            return
        }

        setDiemLyThuyet(selectedStudent.diemLyThuyet?.toString() ?? '')
        setDiemThucHanh(selectedStudent.diemThucHanh?.toString() ?? '')
    }, [selectedStudent])

    async function loadClasses() {
        try {
            setLoading(true)
            const res = await ketQuaHocTapService.getMyClasses()
            const data = Array.isArray(res.data) ? res.data : []
            setClasses(data)
            if (data.length > 0) {
                setSelectedClassId(data[0].idLop)
            }
            setError(null)
        } catch (err) {
            console.error('Lỗi load lớp của giảng viên:', err)
            setError('Không thể tải danh sách lớp được phân công')
        } finally {
            setLoading(false)
        }
    }

    async function loadStudents(classId: number) {
        try {
            setLoadingStudents(true)
            const res = await ketQuaHocTapService.getClassStudents(classId)
            const data = Array.isArray(res.data) ? res.data : []
            setStudents(data)
            setSelectedRegistrationId(data[0]?.idDangKy ?? 0)
            setStudentQuery('')
            setError(null)
        } catch (err) {
            console.error('Lỗi load học viên của lớp:', err)
            setStudents([])
            setSelectedRegistrationId(0)
            setError('Danh sách học viên của lớp')
        } finally {
            setLoadingStudents(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0] ?? null
        setImportFile(f)
        setImportResult(null)
    }

    const handleImport = async () => {
        if (!selectedClassId) {
            alert('Vui lòng chọn lớp trước khi nhập file')
            return
        }
        if (!importFile) {
            alert('Vui lòng chọn file Excel/CSV để nhập')
            return
        }

        try {
            setImporting(true)
            const res = await ketQuaHocTapService.importClassGrades(selectedClassId, importFile)
            setImportResult(res.data || { processed: 0 })
            // reload students after import
            await loadStudents(selectedClassId)
            alert('Nhập điểm hoàn tất')
        } catch (err: any) {
            console.error('Lỗi khi nhập file:', err)
            alert(err?.response?.data?.message || 'Lỗi khi nhập file')
        } finally {
            setImporting(false)
        }
    }

    const handleExport = async () => {
        if (!selectedClassId) {
            alert('Vui lòng chọn lớp trước khi xuất file')
            return
        }
        try {
            const res = await ketQuaHocTapService.exportClassGrades(selectedClassId)
            const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `grades_class_${selectedClassId}.csv`
            document.body.appendChild(a)
            a.click()
            a.remove()
            window.URL.revokeObjectURL(url)
        } catch (err: any) {
            console.error('Lỗi khi xuất file:', err)
            alert(err?.response?.data?.message || 'Lỗi khi xuất file')
        }
    }

    const exportRosterToPDF = async () => {
        if (!students || students.length === 0) {
            alert('Lớp này chưa có học viên nào để xuất.');
            return;
        }

        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        tempDiv.style.width = '800px';
        tempDiv.style.background = '#ffffff';
        tempDiv.style.padding = '40px';
        tempDiv.style.fontFamily = 'Arial, sans-serif';
        tempDiv.style.color = '#000000';

        const targetStudents = filteredStudents.length > 0 ? filteredStudents : students;

        let tableHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #1e3a8a; margin: 0; font-size: 24px; text-transform: uppercase;">Kết Quả Học Tập</h1>
                <h2 style="color: #475569; margin: 10px 0 0 0; font-size: 18px; font-weight: normal;">Lớp: <strong>${selectedClass?.tenLop || `Lớp ${selectedClassId}`}</strong></h2>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
                <thead>
                    <tr style="background-color: #f1f5f9; color: #1e293b;">
                        <th style="border: 1px solid #cbd5e1; padding: 12px 8px; text-align: center; width: 40px;">STT</th>
                        <th style="border: 1px solid #cbd5e1; padding: 12px 8px; text-align: left;">Họ Tên</th>
                        <th style="border: 1px solid #cbd5e1; padding: 12px 8px; text-align: left;">Email</th>
                        <th style="border: 1px solid #cbd5e1; padding: 12px 8px; text-align: center;">Điểm LT</th>
                        <th style="border: 1px solid #cbd5e1; padding: 12px 8px; text-align: center;">Điểm thực hành</th>
                        <th style="border: 1px solid #cbd5e1; padding: 12px 8px; text-align: center;">Điểm TB</th>
                        <th style="border: 1px solid #cbd5e1; padding: 12px 8px; text-align: center;">Kết Luận</th>
                    </tr>
                </thead>
                <tbody>
        `;

        targetStudents.forEach((student, index) => {
            tableHTML += `
                <tr>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center;">${index + 1}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px;"><strong>${student.hoTenHocVien || ''}</strong></td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px;">${student.emailHocVien || ''}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center;">${student.diemLyThuyet !== undefined && student.diemLyThuyet !== null ? student.diemLyThuyet.toFixed(1) : '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center;">${student.diemThucHanh !== undefined && student.diemThucHanh !== null ? student.diemThucHanh.toFixed(1) : '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center; font-weight: bold; color: #0f172a;">${student.diemTrungBinh !== undefined && student.diemTrungBinh !== null ? student.diemTrungBinh.toFixed(2) : '-'}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 10px 8px; text-align: center; font-weight: bold; color: ${student.ketLuan === 'Đạt' ? '#16a34a' : (student.ketLuan === 'Không Đạt' ? '#dc2626' : '#64748b')}">${student.ketLuan || '-'}</td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
            <div style="margin-top: 40px; display: flex; justify-content: space-between; font-size: 14px;">
                <div>
                    <p style="margin: 0;"><strong>Tổng số học viên:</strong> ${targetStudents.length}</p>
                </div>
                <div style="text-align: center; margin-right: 40px;">
                    <p style="margin: 0 0 60px 0;">Ngày ..... tháng ..... năm .......</p>
                    <p style="margin: 0; font-weight: bold;">Giảng viên phụ trách</p>
                </div>
            </div>
        `;

        tempDiv.innerHTML = tableHTML;
        document.body.appendChild(tempDiv);

        try {
            const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
            const className = selectedClass?.tenLop?.replace(/\s+/g, '_') || selectedClassId;
            pdf.save(`KetQuaHocTap_${className}.pdf`);
        } catch (err) {
            console.error('Lỗi xuất PDF:', err);
            alert('Không thể xuất PDF. Vui lòng thử lại sau.');
        } finally {
            document.body.removeChild(tempDiv);
        }
    };

    const handleSave = async () => {
        if (!selectedRegistrationId) {
            alert('Vui lòng chọn học viên')
            return
        }

        const parsedLyThuyet = diemLyThuyet === '' ? undefined : Number(diemLyThuyet)
        const parsedThucHanh = diemThucHanh === '' ? undefined : Number(diemThucHanh)

        if (parsedLyThuyet !== undefined && (Number.isNaN(parsedLyThuyet) || parsedLyThuyet < 0 || parsedLyThuyet > 10)) {
            alert('Điểm lý thuyết phải từ 0 đến 10')
            return
        }

        if (parsedThucHanh !== undefined && (Number.isNaN(parsedThucHanh) || parsedThucHanh < 0 || parsedThucHanh > 10)) {
            alert('Điểm thực hành phải từ 0 đến 10')
            return
        }

        try {
            setSaving(true)
            if (selectedStudent?.idKetQua) {
                await ketQuaHocTapService.updateResult(selectedStudent.idKetQua, {
                    diemLyThuyet: parsedLyThuyet,
                    diemThucHanh: parsedThucHanh,
                })
                alert('Cập nhật kết quả học tập thành công')
            } else {
                await ketQuaHocTapService.createResult({
                    idDangKy: selectedRegistrationId,
                    diemLyThuyet: parsedLyThuyet,
                    diemThucHanh: parsedThucHanh,
                })
                alert('Thêm kết quả học tập thành công')
            }

            await loadStudents(selectedClassId)
        } catch (err: any) {
            console.error('Lỗi lưu kết quả:', err)
            alert(err?.response?.data?.error || err?.response?.data?.message || 'Không thể lưu kết quả học tập')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div>Đang tải danh sách lớp...</div>
    }

    return (
        <div>
            <h2>Nhập Kết Quả Học Tập</h2>
            <p style={{ color: '#64748b', marginTop: 0 }}>
                Chọn lớp, chọn học viên trong lớp rồi nhập điểm thủ công từng bạn.
            </p>

            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 20 }}>
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
                    <div style={{ color: '#64748b', fontSize: 13 }}>Lớp đang nhập</div>
                    <div style={{ fontWeight: 700, marginTop: 4 }}>{selectedClass?.tenLop ?? 'Chưa chọn lớp'}</div>
                </div>
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 14 }}>
                    <div style={{ color: '#64748b', fontSize: 13 }}>Số học viên</div>
                    <div style={{ fontWeight: 700, marginTop: 4 }}>{students.length}</div>
                </div>
            </div>

            {/* Import / Export controls */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
                <div>
                    <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
                </div>
                <div>
                    <button onClick={handleImport} disabled={importing || !importFile || !selectedClassId} style={{ padding: '8px 12px' }}>
                        {importing ? 'Đang nhập...' : 'Nhập từ file'}
                    </button>
                </div>
                <div>
                    <button onClick={handleExport} disabled={!selectedClassId} style={{ padding: '8px 12px' }}>
                        Xuất file CSV
                    </button>
                </div>
                {importResult && (
                    <div style={{ marginLeft: 12, color: '#065f46' }}>
                        Đã xử lý: {importResult.processed ?? '-'} dòng
                        {importResult.errors && importResult.errors.length > 0 && (
                            <div style={{ color: 'crimson' }}>Lỗi: {importResult.errors.length} dòng</div>
                        )}
                    </div>
                )}
            </div>

            {error && <div style={{ color: 'crimson', marginBottom: 16 }}>{error}</div>}

            <div style={{ display: 'grid', gap: 16, marginBottom: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                <div>
                    <label>Chọn lớp</label>
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(Number(e.target.value))}
                        style={{ width: '100%', padding: 10, marginTop: 6 }}
                    >
                        <option value={0}>-- Chọn lớp --</option>
                        {classes.map((cls) => (
                            <option key={cls.idLop} value={cls.idLop}>
                                {cls.tenLop ?? `Lớp ${cls.idLop}`}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Chọn học viên</label>
                    <input
                        type="search"
                        value={studentQuery}
                        onChange={(e) => setStudentQuery(e.target.value)}
                        placeholder="Tìm theo tên hoặc email"
                        disabled={selectedClassId === 0 || loadingStudents}
                        style={{ width: '100%', padding: 10, marginTop: 6, marginBottom: 8 }}
                    />
                    <select
                        value={selectedRegistrationId}
                        onChange={(e) => setSelectedRegistrationId(Number(e.target.value))}
                        disabled={selectedClassId === 0 || loadingStudents}
                        style={{ width: '100%', padding: 10, marginTop: 6 }}
                    >
                        <option value={0}>{loadingStudents ? 'Đang tải...' : '-- Chọn học viên --'}</option>
                        {filteredStudents.map((student) => (
                            <option key={student.idDangKy} value={student.idDangKy}>
                                {student.hoTenHocVien ?? `Học viên ${student.idHocVien}`}
                            </option>
                        ))}
                    </select>
                    {!loadingStudents && studentQuery.trim() && filteredStudents.length === 0 && (
                        <div style={{ marginTop: 8, color: '#64748b', fontSize: 13 }}>Không tìm thấy học viên phù hợp.</div>
                    )}
                </div>
            </div>

            <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 24 }}>
                <h3 style={{ marginTop: 0 }}>Thông tin học viên</h3>
                {selectedStudent ? (
                    <div style={{ display: 'grid', gap: 8 }}>
                        <div><strong>Họ tên:</strong> {selectedStudent.hoTenHocVien || '-'}</div>
                        <div><strong>Email:</strong> {selectedStudent.emailHocVien || '-'}</div>
                        <div><strong>Lớp:</strong> {selectedStudent.tenLop || '-'}</div>
                        <div><strong>Kết quả hiện tại:</strong> {selectedStudent.ketLuan || 'Chưa có'}</div>
                    </div>
                ) : (
                    <div>Chưa chọn học viên nào.</div>
                )}
            </div>

            <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: 16 }}>
                <div>
                    <label>Điểm lý thuyết</label>
                    <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={diemLyThuyet}
                        onChange={(e) => setDiemLyThuyet(e.target.value)}
                        style={{ width: '100%', padding: 10, marginTop: 6 }}
                        placeholder="Nhập Điểm lý thuyết"
                    />
                </div>
                <div>
                    <label>Điểm thực hành</label>
                    <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        value={diemThucHanh}
                        onChange={(e) => setDiemThucHanh(e.target.value)}
                        style={{ width: '100%', padding: 10, marginTop: 6 }}
                        placeholder="Nhập Điểm thực hành"
                    />
                </div>
            </div>

            <div style={{ marginBottom: 24 }}>
                <button onClick={handleSave} disabled={saving || !selectedRegistrationId} style={{ padding: '10px 16px' }}>
                    {saving ? 'Đang lưu...' : selectedStudent?.idKetQua ? 'Cập nhật kết quả' : 'Lưu kết quả'}
                </button>
            </div>

            <div style={{ background: 'white', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h3 style={{ margin: 0 }}>Danh sách học viên của lớp</h3>
                    {students && students.length > 0 && (
                        <button 
                            onClick={() => void exportRosterToPDF()}
                            style={{ 
                                padding: '6px 12px', 
                                fontSize: '14px', 
                                background: '#e11d48', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            📄 Xuất PDF
                        </button>
                    )}
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table border={1} cellPadding={10} style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                <th>Học viên</th>
                                <th>Email</th>
                                <th>Điểm LT</th>
                                <th>Điểm thực hành</th>
                                <th>Điểm TB</th>
                                <th>Kết luận</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: 'center' }}>
                                        {studentQuery.trim() ? 'Không tìm thấy học viên phù hợp' : 'Chưa có học viên nào trong lớp'}
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.idDangKy}>
                                        <td>{student.hoTenHocVien || '-'}</td>
                                        <td>{student.emailHocVien || '-'}</td>
                                        <td>{student.diemLyThuyet?.toFixed(1) || '-'}</td>
                                        <td>{student.diemThucHanh?.toFixed(1) || '-'}</td>
                                        <td>{student.diemTrungBinh?.toFixed(2) || '-'}</td>
                                        <td>{student.ketLuan || 'Chưa nhập'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
