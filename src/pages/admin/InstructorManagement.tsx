import { useState, useEffect } from 'react';
import { giangVienService, teachingAssignmentService } from '../../services/giangVienService';
import { classService } from '../../services/classService';
import type { GiangVienDTO, TeachingAssignmentDetailDTO, InstructorCostDTO } from '../../types/GiangVien';
import type { LopHocDTO } from '../../types/KhoaHoc';
import '../../styles/InstructorManagement.css';

export default function InstructorManagement() {
    const [activeTab, setActiveTab] = useState<'instructors' | 'assignments' | 'costs'>('instructors');

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
    });

    // Teaching Assignment State
    const [assignments, setAssignments] = useState<TeachingAssignmentDetailDTO[]>([]);
    const [classes, setClasses] = useState<LopHocDTO[]>([]);
    const [showCreateAssignment, setShowCreateAssignment] = useState(false);
    const [assignmentForm, setAssignmentForm] = useState({
        idLop: 0,
        idGiangVien: 0,
    });

    // Instructor Cost State
    const [costs, setCosts] = useState<InstructorCostDTO[]>([]);
    const [totalCost, setTotalCost] = useState(0);

    // Load data on component mount
    useEffect(() => {
        loadInstructors();
        loadAssignments();
        loadClasses();
    }, []);

    // Load instructors
    const loadInstructors = async () => {
        try {
            const res = await giangVienService.getAllGiangVien();
            setInstructors(res.data);
        } catch (err) {
            console.error('Lỗi load giảng viên:', err);
            alert('Không thể tải danh sách giảng viên');
        }
    };

    // Load teaching assignments
    const loadAssignments = async () => {
        try {
            const res = await teachingAssignmentService.getAllAssignments();
            setAssignments(res.data);
        } catch (err) {
            console.error('Lỗi load phân công:', err);
        }
    };

    // Load classes
    const loadClasses = async () => {
        try {
            const res = await classService.getAllLopHoc();
            setClasses(res.data);
        } catch (err) {
            console.error('Lỗi load lớp học:', err);
        }
    };

    // Load instructor costs
    const loadCosts = async () => {
        try {
            const res = await teachingAssignmentService.calculateInstructorCosts();
            setCosts(res.data);
            const total = res.data.reduce((sum: number, item: InstructorCostDTO) => sum + item.tongThiLo, 0);
            setTotalCost(total);
        } catch (err) {
            console.error('Lỗi tính chi phí:', err);
        }
    };

    // Handle instructor form submission
    const handleCreateInstructor = async () => {
        if (!instructorForm.hoTenGv || instructorForm.phiGiangDay <= 0) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        try {
            if (editingInstructor) {
                await giangVienService.updateGiangVien(editingInstructor, instructorForm);
                alert('Cập nhật giảng viên thành công');
            } else {
                await giangVienService.createGiangVien(instructorForm);
                alert('Tạo giảng viên mới thành công');
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
            alert('Không thể tạo phân công');
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
    const renderAssignmentTab = () => (
        <div className="tab-content">
            <div className="header">
                <h2>Phân công giảng dạy</h2>
                <button className="btn-primary" onClick={() => setShowCreateAssignment(true)}>
                    + Phân công mới
                </button>
            </div>

            {showCreateAssignment && (
                <div className="modal-overlay" onClick={() => setShowCreateAssignment(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Phân công giảng dạy</h3>
                        <div className="form-group">
                            <label>Lớp học:</label>
                            <select
                                value={assignmentForm.idLop}
                                onChange={(e) => setAssignmentForm({ ...assignmentForm, idLop: parseInt(e.target.value) })}
                            >
                                <option value={0}>-- Chọn lớp học --</option>
                                {classes.map((cls) => (
                                    <option key={cls.idLop} value={cls.idLop}>
                                        {cls.tenLop}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Giảng viên:</label>
                            <select
                                value={assignmentForm.idGiangVien}
                                onChange={(e) => setAssignmentForm({ ...assignmentForm, idGiangVien: parseInt(e.target.value) })}
                            >
                                <option value={0}>-- Chọn giảng viên --</option>
                                {instructors.map((inst) => (
                                    <option key={inst.idGiangVien} value={inst.idGiangVien}>
                                        {inst.hoTenGv} ({inst.chuyenMon})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="modal-buttons">
                            <button className="btn-primary" onClick={handleCreateAssignment}>
                                Phân công
                            </button>
                            <button className="btn-secondary" onClick={() => setShowCreateAssignment(false)}>
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
                        {assignments.map((assignment) => (
                            <tr key={assignment.idPhanCong}>
                                <td>{assignment.idPhanCong}</td>
                                <td>{assignment.tenLop}</td>
                                <td>{assignment.tenKhoaHoc}</td>
                                <td>{assignment.hoTenGv}</td>
                                <td>{assignment.chuyenMon || '-'}</td>
                                <td>{new Date(assignment.ngayBatDau).toLocaleDateString('vi-VN')}</td>
                                <td>{new Date(assignment.ngayKetThuc).toLocaleDateString('vi-VN')}</td>
                                <td>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDeleteAssignment(assignment.idPhanCong)}
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
                    className={`tab-button ${activeTab === 'costs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('costs')}
                >
                    💰 Chi phí
                </button>
            </div>

            {activeTab === 'instructors' && renderInstructorTab()}
            {activeTab === 'assignments' && renderAssignmentTab()}
            {activeTab === 'costs' && renderCostsTab()}
        </div>
    );
}
