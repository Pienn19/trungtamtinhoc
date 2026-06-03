import { useState, useEffect, useMemo } from 'react';
import { giangVienService, teachingAssignmentService } from '../../services/giangVienService';
import { classService } from '../../services/classService';
import { createClassSchedule, deleteClassSchedule, getClassSchedules } from '../../services/scheduleService';
import type { GiangVienDTO, TeachingAssignmentDetailDTO, InstructorCostDTO, LichHocDTO } from '../../types/GiangVien';
import type { LopHocDTO } from '../../types/KhoaHoc';
import '../../styles/InstructorManagement.css';

function parseLocalDate(dateString: string) {
    // Handle ISO format (2026-05-06T00:00:00) and YYYY-MM-DD format
    const dateOnly = dateString.split('T')[0]; // Extract just the date part
    const [year, month, day] = dateOnly.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function formatLocalDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function InstructorManagement() {
    const [activeTab, setActiveTab] = useState<'instructors' | 'assignments' | 'schedule' | 'costs'>('instructors');

    // Instructor State
    const [instructors, setInstructors] = useState<GiangVienDTO[]>([]);
    const [showCreateInstructor, setShowCreateInstructor] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState<number | null>(null);
    const [instructorForm, setInstructorForm] = useState({
        hoTenGv: '',
        chuyenMon: '',
        dienThoaiGv: '',
        emailGv: '',
        phiGiangDay: 0,
        tenDangNhap: '',
        matKhau: '123456',
    });

    // Teaching Assignment State
    const [assignments, setAssignments] = useState<TeachingAssignmentDetailDTO[]>([]);
    const [classes, setClasses] = useState<LopHocDTO[]>([]);
    const [showCreateAssignment, setShowCreateAssignment] = useState(false);
    const [assignmentForm, setAssignmentForm] = useState({
        idLop: 0,
        idGiangVien: 0,
    });

    // Schedule State
    const [scheduleClassId, setScheduleClassId] = useState(0);
    const [classSchedules, setClassSchedules] = useState<LichHocDTO[]>([]);
    const [scheduleForm, setScheduleForm] = useState({
        idGiangVien: 0,
        gioBatDau: '08:00',
        gioKetThuc: '11:00',
        loai: 'Lý thuyết',
        trangThai: 'Bình thường',
        diaDiem: '',
        ghiChu: '',
    });
    const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([1, 3, 5]);

    // Instructor Cost State
    const [costs, setCosts] = useState<InstructorCostDTO[]>([]);
    const [totalCost, setTotalCost] = useState(0);

    const weekdayOptions = useMemo(() => ([
        { value: 1, label: 'Thứ 2' },
        { value: 2, label: 'Thứ 3' },
        { value: 3, label: 'Thứ 4' },
        { value: 4, label: 'Thứ 5' },
        { value: 5, label: 'Thứ 6' },
        { value: 6, label: 'Thứ 7' },
        { value: 0, label: 'Chủ nhật' },
    ]), [])

    const selectedWeekdayLabel = useMemo(() => {
        const labels = weekdayOptions
            .filter((item) => selectedWeekdays.includes(item.value))
            .map((item) => item.label)

        return labels.length > 0 ? labels.join(', ') : 'Chưa chọn thứ nào'
    }, [selectedWeekdays, weekdayOptions])

    const classAssignmentMap = useMemo(() => {
        return assignments.reduce((map, assignment) => {
            map[assignment.idLop] = assignment;
            return map;
        }, {} as Record<number, TeachingAssignmentDetailDTO>);
    }, [assignments]);

    const selectedClassAssignment = assignmentForm.idLop > 0 ? classAssignmentMap[assignmentForm.idLop] : undefined;

    useEffect(() => {
        if (scheduleForm.idGiangVien !== 0) return;

        const assignedTeacher = classAssignmentMap[scheduleClassId];
        if (assignedTeacher?.idGiangVien) {
            setScheduleForm((current) => ({
                ...current,
                idGiangVien: assignedTeacher.idGiangVien,
            }));
        }
    }, [classAssignmentMap, scheduleClassId, scheduleForm.idGiangVien]);

    const getErrorMessage = (error: unknown, fallback: string) => {
        if (error && typeof error === 'object' && 'response' in error) {
            const response = (error as any).response;
            const message = response?.data?.message;
            if (typeof message === 'string' && message.trim()) {
                return message;
            }
        }

        if (error instanceof Error && error.message.trim()) {
            return error.message;
        }

        return fallback;
    }

    // Load instructors
    async function loadInstructors() {
        try {
            const res = await giangVienService.getAllGiangVien();
            setInstructors(res.data);
        } catch (err) {
            console.error('Lỗi load giảng viên:', err);
            alert('Không thể tải danh sách giảng viên');
        }
    }

    // Load teaching assignments
    async function loadAssignments() {
        try {
            const res = await teachingAssignmentService.getAllAssignments();
            setAssignments(res.data);
        } catch (err) {
            console.error('Lỗi load phân công:', err);
        }
    }

    // Load classes
    async function loadClasses() {
        try {
            const res = await classService.getAllLopHoc();
            setClasses(res.data);
            if (!scheduleClassId && Array.isArray(res.data) && res.data.length > 0) {
                setScheduleClassId(res.data[0].idLop);
            }
        } catch (err) {
            console.error('Lỗi load lớp học:', err);
        }
    }

    async function loadClassSchedules(classId: number) {
        if (!classId) {
            setClassSchedules([]);
            return;
        }

        try {
            const res = await getClassSchedules(classId);
            setClassSchedules(res);
        } catch (err) {
            console.error('Lỗi load lịch học:', err);
            setClassSchedules([]);
        }
    }

    // Load instructor costs
    async function loadCosts() {
        try {
            const res = await teachingAssignmentService.calculateInstructorCosts();
            setCosts(res.data);
            const total = res.data.reduce((sum: number, item: InstructorCostDTO) => sum + item.tongThiLo, 0);
            setTotalCost(total);
        } catch (err) {
            console.error('Lỗi tính chi phí:', err);
        }
    }

    // Load data on component mount
    useEffect(() => {
        loadInstructors();
        loadAssignments();
        loadClasses();
    }, []);

    useEffect(() => {
        void loadClassSchedules(scheduleClassId);
    }, [scheduleClassId]);

    // Handle instructor form submission
    const handleCreateInstructor = async () => {
        if (!instructorForm.hoTenGv || instructorForm.phiGiangDay <= 0) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        if (!editingInstructor && !instructorForm.tenDangNhap) {
            alert('Tên đăng nhập không được để trống');
            return;
        }

        try {
            if (editingInstructor) {
                await giangVienService.updateGiangVien(editingInstructor, instructorForm);
                alert('Cập nhật giảng viên thành công');
            } else {
                await giangVienService.createGiangVien(instructorForm);
                alert('Tạo giảng viên mới thành công. Tài khoản: ' + instructorForm.tenDangNhap + ', Mật khẩu: 123456');
            }

            resetInstructorForm();
            loadInstructors();
        } catch (err) {
            console.error('Lỗi lưu giảng viên:', err);
            alert('Không thể lưu giảng viên');
        }
    };

    // Handle delete instructor
    const handleDeleteInstructor = async (id: number) => {
        if (!confirm('Bạn chắc chắn muốn xóa giảng viên này?')) return;

        try {
            await giangVienService.deleteGiangVien(id);
            alert('Xóa giảng viên thành công');
            loadInstructors();
        } catch (err) {
            console.error('Lỗi xóa giảng viên:', err);
            alert('Không thể xóa giảng viên');
        }
    };

    // Handle edit instructor
    const handleEditInstructor = (instructor: GiangVienDTO) => {
        setInstructorForm({
            hoTenGv: instructor.hoTenGv,
            chuyenMon: instructor.chuyenMon,
            dienThoaiGv: instructor.dienThoaiGv,
            emailGv: instructor.emailGv,
            phiGiangDay: instructor.phiGiangDay,
            tenDangNhap: '',
            matKhau: '123456',
        });
        setEditingInstructor(instructor.idGiangVien);
        setShowCreateInstructor(true);
    };

    // Reset instructor form
    const resetInstructorForm = () => {
        setInstructorForm({
            hoTenGv: '',
            chuyenMon: '',
            dienThoaiGv: '',
            emailGv: '',
            phiGiangDay: 0,
            tenDangNhap: '',
            matKhau: '123456',
        });
        setEditingInstructor(null);
        setShowCreateInstructor(false);
    };

    // Handle create assignment
    const handleCreateAssignment = async () => {
        if (assignmentForm.idLop <= 0 || assignmentForm.idGiangVien <= 0) {
            alert('Vui lòng chọn lớp học và giảng viên');
            return;
        }

        try {
            await teachingAssignmentService.createAssignment(assignmentForm);
            alert('Phân công giảng dạy thành công');
            setAssignmentForm({ idLop: 0, idGiangVien: 0 });
            setShowCreateAssignment(false);
            loadAssignments();
            loadCosts();
        } catch (err) {
            console.error('Lỗi tạo phân công:', err);
            alert(getErrorMessage(err, 'Không thể tạo phân công'));
        }
    };

    // Handle delete assignment
    const handleDeleteAssignment = async (id: number) => {
        if (!confirm('Bạn chắc chắn muốn xóa phân công này?')) return;

        try {
            await teachingAssignmentService.deleteAssignment(id);
            alert('Xóa phân công thành công');
            loadAssignments();
            loadCosts();
        } catch (err) {
            console.error('Lỗi xóa phân công:', err);
            alert('Không thể xóa phân công');
        }
    };

    const toggleWeekday = (weekday: number) => {
        setSelectedWeekdays((current) =>
            current.includes(weekday)
                ? current.filter((item) => item !== weekday)
                : [...current, weekday].sort((a, b) => a - b)
        );
    };

    const handleCreateSchedules = async () => {
        if (!scheduleClassId) {
            alert('Vui lòng chọn lớp học');
            return;
        }

        if (!scheduleForm.idGiangVien) {
            alert('Vui lòng chọn giảng viên');
            return;
        }

        const selectedClass = classes.find((cls) => cls.idLop === scheduleClassId);
        if (!selectedClass || !selectedClass.ngayBatDau || !selectedClass.ngayKetThuc) {
            alert('Lớp không có khoảng ngày hợp lệ');
            return;
        }

        if (!scheduleForm.gioBatDau || !scheduleForm.gioKetThuc) {
            alert('Vui lòng nhập giờ bắt đầu và giờ kết thúc');
            return;
        }

        if (selectedWeekdays.length === 0) {
            alert('Vui lòng chọn ít nhất một thứ trong tuần');
            return;
        }

        const start = parseLocalDate(selectedClass.ngayBatDau);
        const end = parseLocalDate(selectedClass.ngayKetThuc);

        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
            alert('Khoảng ngày lớp không hợp lệ');
            return;
        }

        const dates: Date[] = [];
        const cursor = new Date(start);
        while (cursor <= end) {
            if (selectedWeekdays.includes(cursor.getDay())) {
                dates.push(new Date(cursor));
            }
            cursor.setDate(cursor.getDate() + 1);
        }

        if (dates.length === 0) {
            alert('Không có ngày nào khớp với các thứ đã chọn');
            return;
        }

        try {
            // Send all schedule requests in parallel for better performance
            await Promise.all(dates.map(date =>
                createClassSchedule({
                    idLop: scheduleClassId,
                    idGiangVien: scheduleForm.idGiangVien,
                    ngay: formatLocalDate(date),
                    gioBatDau: scheduleForm.gioBatDau,
                    gioKetThuc: scheduleForm.gioKetThuc,
                    loai: scheduleForm.loai || null,
                    trangThai: scheduleForm.trangThai || null,
                    diaDiem: scheduleForm.diaDiem || null,
                    ghiChu: scheduleForm.ghiChu || null,
                })
            ));

            alert(`Đã tạo ${dates.length} buổi học trong khoảng ${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`);
            setScheduleForm((current) => ({
                ...current,
                idGiangVien: current.idGiangVien,
                diaDiem: '',
                ghiChu: '',
            }));
            await loadClassSchedules(scheduleClassId);
        } catch (err: any) {
            console.error('Lỗi tạo lịch học:', err);
            alert(err?.response?.data?.message || 'Không thể tạo lịch học');
        }
    };

    const handleDeleteSchedule = async (idLichHoc: number) => {
        if (!confirm('Bạn chắc chắn muốn xóa buổi học này?')) return;

        try {
            await deleteClassSchedule(idLichHoc);
            alert('Xóa buổi học thành công');
            await loadClassSchedules(scheduleClassId);
        } catch (err: any) {
            console.error('Lỗi xóa buổi học:', err);
            alert(err?.response?.data?.message || 'Không thể xóa buổi học');
        }
    };

    const renderScheduleTab = () => (
        <div className="tab-content">
            <div className="header">
                <h2>Lịch học lớp</h2>
                <button className="btn-primary" onClick={() => void loadClassSchedules(scheduleClassId)}>
                    🔄 Tải lại
                </button>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: '#1d4ed8', marginBottom: 6 }}>Tạo lịch nhanh</div>
                <div style={{ color: '#1e3a8a', fontSize: 14, lineHeight: 1.5 }}>
                    Chọn lớp, khoảng ngày, các thứ trong tuần và khung giờ. Hệ thống sẽ tự tạo một buổi học cho mỗi ngày phù hợp.
                </div>
            </div>

            <div className="form-group">
                <label>Lớp học:</label>
                <select
                    value={scheduleClassId}
                    onChange={(e) => {
                        const nextClassId = Number(e.target.value);
                        setScheduleClassId(nextClassId);
                        const assignedTeacher = classAssignmentMap[nextClassId];
                        setScheduleForm((current) => ({
                            ...current,
                            idGiangVien: assignedTeacher?.idGiangVien ?? 0,
                        }));
                    }}
                >
                    <option value={0}>-- Chọn lớp học --</option>
                    {classes.map((cls) => (
                        <option key={cls.idLop} value={cls.idLop}>
                            {cls.tenLop}
                        </option>
                    ))}
                </select>
                <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>
                    Đang cấu hình cho: <strong>{classes.find((cls) => cls.idLop === scheduleClassId)?.tenLop || 'Chưa chọn lớp'}</strong>
                </div>
            </div>

            <div className="form-group">
                <label>Giảng viên:</label>
                <select
                    value={scheduleForm.idGiangVien}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, idGiangVien: Number(e.target.value) })}
                >
                    <option value={0}>-- Chọn giảng viên --</option>
                    {instructors.map((gv) => (
                        <option key={gv.idGiangVien} value={gv.idGiangVien}>
                            {gv.hoTenGv}
                        </option>
                    ))}
                </select>
                <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>
                    {scheduleForm.idGiangVien
                        ? `Đã chọn: ${instructors.find((gv) => gv.idGiangVien === scheduleForm.idGiangVien)?.hoTenGv || 'Giảng viên'}`
                        : 'Chọn giảng viên phụ trách buổi học này'}
                </div>
            </div>

            <div className="form-group">
                <label>Khoảng thời gian học:</label>
                <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    {scheduleClassId > 0 ? (
                        (() => {
                            const selectedClass = classes.find((cls) => cls.idLop === scheduleClassId);
                            return selectedClass ? (
                                <div>
                                    <div style={{ fontWeight: 600, marginBottom: '6px' }}>{selectedClass.tenLop}</div>
                                    <div style={{ fontSize: '14px', color: '#475569' }}>
                                        📅 {new Date(selectedClass.ngayBatDau).toLocaleDateString('vi-VN')} → {new Date(selectedClass.ngayKetThuc).toLocaleDateString('vi-VN')}
                                    </div>
                                </div>
                            ) : null;
                        })()
                    ) : (
                        <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chọn lớp để xem khoảng thời gian</div>
                    )}
                </div>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
                <div className="form-group">
                    <label>Giờ bắt đầu:</label>
                    <input
                        type="time"
                        value={scheduleForm.gioBatDau}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, gioBatDau: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Giờ kết thúc:</label>
                    <input
                        type="time"
                        value={scheduleForm.gioKetThuc}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, gioKetThuc: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label>Loại buổi học:</label>
                    <input
                        type="text"
                        value={scheduleForm.loai}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, loai: e.target.value })}
                        placeholder="Ví dụ: Lý thuyết"
                    />
                </div>
                <div className="form-group">
                    <label>Địa điểm:</label>
                    <input
                        type="text"
                        value={scheduleForm.diaDiem}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, diaDiem: e.target.value })}
                        placeholder="Phòng học / Online"
                    />
                </div>
                <div className="form-group">
                    <label>Trạng thái:</label>
                    <select
                        value={scheduleForm.trangThai}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, trangThai: e.target.value })}
                    >
                        <option value="Bình thường">Bình thường</option>
                        <option value="Tạm ngưng">Tạm ngưng</option>
                        <option value="Hủy">Hủy</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Ghi chú:</label>
                    <input
                        type="text"
                        value={scheduleForm.ghiChu}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, ghiChu: e.target.value })}
                        placeholder="Ghi chú thêm"
                    />
                </div>
            </div>

            <div className="form-group">
                <label>Thứ trong tuần:</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                    {weekdayOptions.map((item) => (
                        <label key={item.value} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                                type="checkbox"
                                checked={selectedWeekdays.includes(item.value)}
                                onChange={() => toggleWeekday(item.value)}
                            />
                            {item.label}
                        </label>
                    ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 13, color: '#64748b' }}>
                    Đã chọn: <strong>{selectedWeekdayLabel}</strong>
                </div>
            </div>

            <div className="modal-buttons" style={{ marginBottom: '24px' }}>
                <button className="btn-primary" onClick={handleCreateSchedules}>
                    ✓ Tạo lịch học cho {selectedWeekdayLabel}
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ngày</th>
                            <th>Thứ</th>
                            <th>Giảng viên</th>
                            <th>Giờ</th>
                            <th>Loại</th>
                            <th>Địa điểm</th>
                            <th>Ghi chú</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classSchedules.length === 0 ? (
                            <tr>
                                <td colSpan={9} style={{ textAlign: 'center' }}>
                                    Chưa có lịch học cho lớp này
                                </td>
                            </tr>
                        ) : (
                            classSchedules.map((schedule) => {
                                const dayName = new Date(schedule.ngay).toLocaleDateString('vi-VN', { weekday: 'long' });
                                return (
                                    <tr key={schedule.idLichHoc}>
                                        <td>{schedule.idLichHoc}</td>
                                        <td>{new Date(schedule.ngay).toLocaleDateString('vi-VN')}</td>
                                        <td>{dayName}</td>
                                        <td>{schedule.tenGiangVien || '-'}</td>
                                        <td>{schedule.gioBatDau} - {schedule.gioKetThuc}</td>
                                        <td>{schedule.loai || '-'}</td>
                                        <td>{schedule.diaDiem || '-'}</td>
                                        <td>{schedule.ghiChu || '-'}</td>
                                        <td>
                                            <button className="btn-delete" onClick={() => handleDeleteSchedule(schedule.idLichHoc)}>
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Render instructor tab
    const renderInstructorTab = () => (
        <div className="tab-content">
            <div className="header">
                <h2>Quản lý Giảng viên</h2>
                <button className="btn-primary" onClick={() => setShowCreateInstructor(true)}>
                    + Thêm giảng viên
                </button>
            </div>

            {showCreateInstructor && (
                <div className="modal-overlay" onClick={resetInstructorForm}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>{editingInstructor ? 'Chỉnh sửa giảng viên' : 'Tạo giảng viên mới'}</h3>
                        <div className="form-group">
                            <label>Họ tên:</label>
                            <input
                                type="text"
                                value={instructorForm.hoTenGv}
                                onChange={(e) => setInstructorForm({ ...instructorForm, hoTenGv: e.target.value })}
                                placeholder="Nhập họ tên"
                            />
                        </div>
                        <div className="form-group">
                            <label>Chuyên môn:</label>
                            <input
                                type="text"
                                value={instructorForm.chuyenMon}
                                onChange={(e) => setInstructorForm({ ...instructorForm, chuyenMon: e.target.value })}
                                placeholder="VD: Lập trình Web"
                            />
                        </div>
                        <div className="form-group">
                            <label>Điện thoại:</label>
                            <input
                                type="text"
                                value={instructorForm.dienThoaiGv}
                                onChange={(e) => setInstructorForm({ ...instructorForm, dienThoaiGv: e.target.value })}
                                placeholder="Số điện thoại"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                value={instructorForm.emailGv}
                                onChange={(e) => setInstructorForm({ ...instructorForm, emailGv: e.target.value })}
                                placeholder="Email"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phí giảng dạy (đơn vị: VNĐ):</label>
                            <input
                                type="number"
                                value={instructorForm.phiGiangDay}
                                onChange={(e) => setInstructorForm({ ...instructorForm, phiGiangDay: parseFloat(e.target.value) })}
                                placeholder="Ví dụ: 500000"
                                min="0"
                            />
                        </div>
                        {!editingInstructor && (
                            <>
                                <div className="form-group">
                                    <label>Tên đăng nhập:</label>
                                    <input
                                        type="text"
                                        value={instructorForm.tenDangNhap}
                                        onChange={(e) => setInstructorForm({ ...instructorForm, tenDangNhap: e.target.value })}
                                        placeholder="Ví dụ: giangvien_01"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Mật khẩu (mặc định: 123456):</label>
                                    <input
                                        type="text"
                                        value={instructorForm.matKhau}
                                        onChange={(e) => setInstructorForm({ ...instructorForm, matKhau: e.target.value })}
                                        placeholder="Mặc định: 123456"
                                    />
                                </div>
                            </>
                        )}
                        <div className="modal-buttons">
                            <button className="btn-primary" onClick={handleCreateInstructor}>
                                Lưu
                            </button>
                            <button className="btn-secondary" onClick={resetInstructorForm}>
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Họ tên</th>
                            <th>Chuyên môn</th>
                            <th>Điện thoại</th>
                            <th>Email</th>
                            <th>Phí giảng dạy</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {instructors.map((instructor) => (
                            <tr key={instructor.idGiangVien}>
                                <td>{instructor.idGiangVien}</td>
                                <td>{instructor.hoTenGv}</td>
                                <td>{instructor.chuyenMon || '-'}</td>
                                <td>{instructor.dienThoaiGv || '-'}</td>
                                <td>{instructor.emailGv || '-'}</td>
                                <td>{instructor.phiGiangDay.toLocaleString()} VNĐ</td>
                                <td>
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleEditInstructor(instructor)}
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteInstructor(instructor.idGiangVien)}
                                    >
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    // Render assignment tab
    const renderAssignmentTab = () => {
        return (
            <div className="tab-content">
                <div className="header">
                    <h2>Phân công giảng dạy</h2>
                    <button className="btn-primary" onClick={() => setShowCreateAssignment(true)}>
                        ➕ Phân công mới
                    </button>
                </div>

                <div style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 16,
                    display: 'grid',
                    gap: 8,
                }}>
                    <div style={{ fontWeight: 700, color: '#1d4ed8', fontSize: 14 }}>📋 Hướng dẫn phân công</div>
                    <div style={{ color: '#1e3a8a', fontSize: 13, lineHeight: 1.6 }}>
                        <div>1. Nhấp vào <strong>"Phân công mới"</strong> ở trên</div>
                        <div>2. Chọn <strong>lớp học</strong> cần giao dạy</div>
                        <div>3. Chọn <strong>giảng viên</strong> sẽ dạy lớp đó</div>
                        <div>4. Nhấp <strong>"Phân công"</strong> để hoàn tất</div>
                    </div>
                </div>

                {showCreateAssignment && (
                    <div className="modal-overlay" onClick={() => setShowCreateAssignment(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 600 }}>➕ Phân công giảng dạy mới</h3>

                            <div style={{ display: 'grid', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                                        Bước 1: Chọn lớp học <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <select
                                        value={assignmentForm.idLop}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, idLop: parseInt(e.target.value) })}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            border: '1px solid #d1d5db',
                                            fontSize: 14,
                                            fontFamily: 'system-ui',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <option value={0}>-- Chọn lớp học --</option>
                                        {classes.map((cls) => {
                                            const currentAssignment = classAssignmentMap[cls.idLop];
                                            return (
                                                <option key={cls.idLop} value={cls.idLop}>
                                                    {cls.tenLop} {currentAssignment ? `(đang do ${currentAssignment.hoTenGv} phụ trách)` : '(chưa giao)'}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {assignmentForm.idLop > 0 && (
                                        selectedClassAssignment ? (
                                            <div style={{ marginTop: 10, padding: 10, background: '#fff7ed', borderRadius: 6, fontSize: 13, color: '#9a3412' }}>
                                                ⚠ Lớp <strong>{classes.find(c => c.idLop === assignmentForm.idLop)?.tenLop}</strong> hiện đang do <strong>{selectedClassAssignment.hoTenGv}</strong> phụ trách.
                                                Nếu muốn đổi giảng viên, hãy xóa phân công cũ trước.
                                            </div>
                                        ) : (
                                            <div style={{ marginTop: 10, padding: 10, background: '#f0fdf4', borderRadius: 6, fontSize: 13, color: '#166534' }}>
                                                ✓ Lớp: <strong>{classes.find(c => c.idLop === assignmentForm.idLop)?.tenLop}</strong> chưa có giảng viên.
                                            </div>
                                        )
                                    )}
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 14 }}>
                                        Bước 2: Chọn giảng viên <span style={{ color: '#dc2626' }}>*</span>
                                    </label>
                                    <select
                                        value={assignmentForm.idGiangVien}
                                        onChange={(e) => setAssignmentForm({ ...assignmentForm, idGiangVien: parseInt(e.target.value) })}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            borderRadius: 8,
                                            border: '1px solid #d1d5db',
                                            fontSize: 14,
                                            fontFamily: 'system-ui',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <option value={0}>-- Chọn giảng viên --</option>
                                        {instructors.map((inst) => (
                                            <option key={inst.idGiangVien} value={inst.idGiangVien}>
                                                {inst.hoTenGv} ({inst.chuyenMon || 'Chuyên môn chưa cập nhật'})
                                            </option>
                                        ))}
                                    </select>
                                    {assignmentForm.idGiangVien > 0 && (
                                        <div style={{ marginTop: 10, padding: 10, background: '#f0fdf4', borderRadius: 6, fontSize: 13, color: '#166534' }}>
                                            ✓ Giảng viên: <strong>{instructors.find(i => i.idGiangVien === assignmentForm.idGiangVien)?.hoTenGv}</strong> được chọn
                                        </div>
                                    )}
                                </div>

                                {assignmentForm.idLop > 0 && assignmentForm.idGiangVien > 0 && (
                                    <div style={{ padding: 12, background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', fontSize: 13 }}>
                                        <strong>📝 Xác nhận phân công:</strong>
                                        <div style={{ marginTop: 8 }}>
                                            Lớp <strong>{classes.find(c => c.idLop === assignmentForm.idLop)?.tenLop}</strong> sẽ được giảng viên <strong>{instructors.find(i => i.idGiangVien === assignmentForm.idGiangVien)?.hoTenGv}</strong> dạy
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-buttons" style={{ marginTop: 20 }}>
                                <button
                                    className="btn-primary"
                                    onClick={handleCreateAssignment}
                                    disabled={assignmentForm.idLop <= 0 || assignmentForm.idGiangVien <= 0 || !!selectedClassAssignment}
                                    style={{ opacity: assignmentForm.idLop <= 0 || assignmentForm.idGiangVien <= 0 || !!selectedClassAssignment ? 0.5 : 1, cursor: assignmentForm.idLop <= 0 || assignmentForm.idGiangVien <= 0 || !!selectedClassAssignment ? 'not-allowed' : 'pointer' }}
                                >
                                    ✓ Xác nhận phân công
                                </button>
                                <button className="btn-secondary" onClick={() => setShowCreateAssignment(false)}>
                                    Hủy
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
                    <div style={{ padding: 16, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#166534' }}>{assignments.length}</div>
                        <div style={{ color: '#65a30d', fontSize: 12, marginTop: 4 }}>Phân công hiện tại</div>
                    </div>
                    <div style={{ padding: 16, background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#1d4ed8' }}>{classes.length}</div>
                        <div style={{ color: '#0284c7', fontSize: 12, marginTop: 4 }}>Tổng số lớp</div>
                    </div>
                    <div style={{ padding: 16, background: '#fef3c7', borderRadius: 8, border: '1px solid #fde68a', textAlign: 'center' }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#92400e' }}>{classes.length - assignments.length}</div>
                        <div style={{ color: '#b45309', fontSize: 12, marginTop: 4 }}>Lớp chưa giao</div>
                    </div>
                </div>

                {/* Assignments Table */}
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Lớp học</th>
                                <th>Khóa học</th>
                                <th>Giảng viên</th>
                                <th>Chuyên môn</th>
                                <th>Ngày bắt đầu</th>
                                <th>Ngày kết thúc</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assignments.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: 'center', padding: 20, color: '#6b7280' }}>
                                        Chưa có phân công nào. Nhấn "Phân công mới" để bắt đầu.
                                    </td>
                                </tr>
                            ) : (
                                assignments.map((assignment) => (
                                    <tr key={assignment.idPhanCong}>
                                        <td>{assignment.idPhanCong}</td>
                                        <td><strong>{assignment.tenLop}</strong></td>
                                        <td>{assignment.tenKhoaHoc}</td>
                                        <td>{assignment.hoTenGv}</td>
                                        <td>{assignment.chuyenMon || '-'}</td>
                                        <td>{new Date(assignment.ngayBatDau).toLocaleDateString('vi-VN')}</td>
                                        <td>{new Date(assignment.ngayKetThuc).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDeleteAssignment(assignment.idPhanCong)}
                                                style={{ fontSize: 12 }}
                                            >
                                                🗑 Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Render costs tab
    const renderCostsTab = () => (
        <div className="tab-content">
            <div className="header">
                <h2>Chi phí giảng dạy</h2>
                <button className="btn-primary" onClick={loadCosts}>
                    🔄 Cập nhật
                </button>
            </div>

            <div className="costs-summary">
                <div className="summary-card">
                    <div className="summary-label">Tổng chi phí giảng dạy</div>
                    <div className="summary-value">{totalCost.toLocaleString()} VNĐ</div>
                </div>
                <div className="summary-card">
                    <div className="summary-label">Số lượng giảng viên</div>
                    <div className="summary-value">{costs.length}</div>
                </div>
                <div className="summary-card">
                    <div className="summary-label">Tổng số lớp được giao</div>
                    <div className="summary-value">{costs.reduce((sum, c) => sum + c.soLopGiao, 0)}</div>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Giảng viên</th>
                            <th>Phí/lớp (VNĐ)</th>
                            <th>Số lớp</th>
                            <th>Tổng thù lao (VNĐ)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {costs.map((cost) => (
                            <tr key={cost.idGiangVien}>
                                <td>{cost.idGiangVien}</td>
                                <td>{cost.hoTenGv}</td>
                                <td>{cost.phiGiangDay.toLocaleString()}</td>
                                <td>{cost.soLopGiao}</td>
                                <td className="bold">{cost.tongThiLo.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="instructor-management">
            <div className="tabs">
                <button
                    className={`tab-button ${activeTab === 'instructors' ? 'active' : ''}`}
                    onClick={() => setActiveTab('instructors')}
                >
                    👨‍🏫 Giảng viên
                </button>
                <button
                    className={`tab-button ${activeTab === 'assignments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assignments')}
                >
                    📋 Phân công
                </button>
                <button
                    className={`tab-button ${activeTab === 'schedule' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schedule')}
                >
                    📅 Lịch học
                </button>
                <button
                    className={`tab-button ${activeTab === 'costs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('costs')}
                >
                    💰 Chi phí
                </button>
            </div>

            {activeTab === 'instructors' && renderInstructorTab()}
            {activeTab === 'assignments' && renderAssignmentTab()}
            {activeTab === 'schedule' && renderScheduleTab()}
            {activeTab === 'costs' && renderCostsTab()}
        </div>
    );
}
