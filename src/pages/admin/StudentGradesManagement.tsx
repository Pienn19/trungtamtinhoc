import { useState, useEffect } from 'react';
import { ketQuaHocTapService } from '../../services/ketQuaHocTapService';
import { classService } from '../../services/classService';
import type { KetQuaHocTapDetailDTO, GradeStatisticsDTO } from '../../types/KetQuaHocTap';
import type { LopHocDTO } from '../../types/KhoaHoc';
import '../../styles/StudentGradesManagement.css';

export default function StudentGradesManagement() {
    const [results, setResults] = useState<KetQuaHocTapDetailDTO[]>([]);
    const [classes, setClasses] = useState<LopHocDTO[]>([]);
    const [statistics, setStatistics] = useState<GradeStatisticsDTO | null>(null);
    const [selectedClass, setSelectedClass] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
        diemChuyenCan: 0,
        diemThi: 0,
    });
    const [showEditModal, setShowEditModal] = useState(false);

    // Load data on mount
    useEffect(() => {
        loadClasses();
        loadResults();
    }, []);

    // Load classes
    const loadClasses = async () => {
        try {
            const res = await classService.getAllLopHoc();
            setClasses(res.data);
        } catch (err) {
            console.error('Lỗi load lớp:', err);
        }
    };

    // Load results
    const loadResults = async () => {
        try {
            const res = await ketQuaHocTapService.getAllResults();
            setResults(res.data);
        } catch (err) {
            console.error('Lỗi load kết quả:', err);
        }
    };

    // Load statistics by class
    const loadStatistics = async (classId: number) => {
        try {
            const res = await ketQuaHocTapService.getClassStatistics(classId);
            setStatistics(res.data);

            // Also load results for specific class
            const resultRes = await ketQuaHocTapService.getResultsByClass(classId);
            setResults(resultRes.data);
        } catch (err) {
            console.error('Lỗi load thống kê:', err);
        }
    };

    // Handle class selection
    const handleSelectClass = (classId: number) => {
        setSelectedClass(classId);
        loadStatistics(classId);
    };

    // Handle edit
    const handleEdit = (result: KetQuaHocTapDetailDTO) => {
        setEditingId(result.idKetQua);
        setEditForm({
            diemChuyenCan: result.diemChuyenCan || 0,
            diemThi: result.diemThi || 0,
        });
        setShowEditModal(true);
    };

    // Save edit
    const handleSaveEdit = async () => {
        if (!editingId) return;

        try {
            await ketQuaHocTapService.updateResult(editingId, {
                diemChuyenCan: editForm.diemChuyenCan,
                diemThi: editForm.diemThi,
            });
            alert('Cập nhật kết quả thành công');
            setShowEditModal(false);
            setEditingId(null);

            if (selectedClass) {
                loadStatistics(selectedClass);
            } else {
                loadResults();
            }
        } catch (err) {
            console.error('Lỗi cập nhật:', err);
            alert('Không thể cập nhật kết quả');
        }
    };

    // Handle delete
    const handleDelete = async (id: number) => {
        if (!confirm('Bạn chắc chắn muốn xóa kết quả này?')) return;

        try {
            await ketQuaHocTapService.deleteResult(id);
            alert('Xóa kết quả thành công');

            if (selectedClass) {
                loadStatistics(selectedClass);
            } else {
                loadResults();
            }
        } catch (err) {
            console.error('Lỗi xóa:', err);
            alert('Không thể xóa kết quả');
        }
    };

    return (
        <div className="student-grades-management">
            <h2>Quản Lý Kết Quả Học Tập</h2>

            {/* Class Selector */}
            <div className="class-selector">
                <label>Chọn lớp học:</label>
                <select
                    value={selectedClass || ''}
                    onChange={(e) => handleSelectClass(parseInt(e.target.value))}
                >
                    <option value="">-- Tất cả lớp --</option>
                    {classes.map((cls) => (
                        <option key={cls.idLop} value={cls.idLop}>
                            {cls.tenLop}
                        </option>
                    ))}
                </select>
            </div>

            {/* Statistics */}
            {statistics && selectedClass && (
                <div className="statistics-section">
                    <h3>📊 Thống kê lớp học</h3>
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">Tổng học viên</div>
                            <div className="stat-value">{statistics.totalStudents}</div>
                        </div>
                        <div className="stat-card success">
                            <div className="stat-label">Đạt</div>
                            <div className="stat-value">{statistics.passed}</div>
                        </div>
                        <div className="stat-card danger">
                            <div className="stat-label">Không đạt</div>
                            <div className="stat-value">{statistics.failed}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Tỷ lệ đạt</div>
                            <div className="stat-value">{statistics.passRate.toFixed(1)}%</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Điểm TB</div>
                            <div className="stat-value">{statistics.averageScore.toFixed(2)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Cao nhất</div>
                            <div className="stat-value">{statistics.highestScore}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Thấp nhất</div>
                            <div className="stat-value">{statistics.lowestScore}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Table */}
            <div className="results-section">
                <h3>📋 Danh sách kết quả</h3>
                {results.length === 0 ? (
                    <p className="no-data">Không có kết quả nào</p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Học viên</th>
                                    <th>Khóa học</th>
                                    <th>Lớp học</th>
                                    <th>Điểm chuyên cần</th>
                                    <th>Điểm thi</th>
                                    <th>Điểm TB</th>
                                    <th>Kết luận</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result) => (
                                    <tr key={result.idKetQua}>
                                        <td>{result.idKetQua}</td>
                                        <td>{result.hocVienName}</td>
                                        <td>{result.courseeName}</td>
                                        <td>{result.className}</td>
                                        <td className="text-center">
                                            {result.diemChuyenCan?.toFixed(1) || '-'}
                                        </td>
                                        <td className="text-center">
                                            {result.diemThi?.toFixed(1) || '-'}
                                        </td>
                                        <td className="text-center font-bold">
                                            {result.diemTrungBinh?.toFixed(2) || '-'}
                                        </td>
                                        <td>
                                            <span className={`badge ${result.ketLuan?.includes('Đạt') ? 'success' : 'danger'}`}>
                                                {result.ketLuan || '--'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn-edit"
                                                onClick={() => handleEdit(result)}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                className="btn-delete"
                                                onClick={() => handleDelete(result.idKetQua)}
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Cập nhật kết quả học tập</h3>

                        <div className="form-group">
                            <label>Điểm chuyên cần (0-10):</label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.5"
                                value={editForm.diemChuyenCan}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        diemChuyenCan: parseFloat(e.target.value),
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Điểm thi (0-10):</label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.5"
                                value={editForm.diemThi}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        diemThi: parseFloat(e.target.value),
                                    })
                                }
                            />
                        </div>

                        <div className="modal-buttons">
                            <button className="btn-primary" onClick={handleSaveEdit}>
                                Lưu
                            </button>
                            <button
                                className="btn-secondary"
                                onClick={() => setShowEditModal(false)}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
