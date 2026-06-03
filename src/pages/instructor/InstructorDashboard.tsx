import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teachingAssignmentService } from '../../services/giangVienService';
import type { TeachingAssignmentDetailDTO } from '../../types/GiangVien';
import '../../styles/InstructorDashboard.css';

export default function InstructorDashboard() {
    const [assignments, setAssignments] = useState<TeachingAssignmentDetailDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                const res = await teachingAssignmentService.getMySchedule();
                setAssignments(res.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Không thể lấy thông tin lịch giảng dạy. Vui lòng kiểm tra lại email liên kết.');
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, []);

    // Calculate total fees
    const totalFee = assignments.reduce((sum, item) => sum + item.phiGiangDay, 0);

    if (loading) {
        return <div className="instructor-container"><h2>Đang tải lịch giảng dạy...</h2></div>;
    }

    return (
        <div className="instructor-container">
            <div className="instructor-header">
                <h1>Khu Vực Giảng Viên</h1>
                <p>Quản lý lịch giảng dạy và thù lao cá nhân</p>
            </div>

            {error ? (
                <div className="alert alert-error">{error}</div>
            ) : (
                <>
                    <div className="dashboard-stats">
                        <div className="stat-card">
                            <h3>Tổng số lớp</h3>
                            <div className="stat-value">{assignments.length}</div>
                        </div>
                        <div className="stat-card">
                            <h3>Tổng thù lao dự kiến</h3>
                            <div className="stat-value text-success">
                                {totalFee.toLocaleString('vi-VN')} VND
                            </div>
                        </div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <Link to="/giang-vien/diem-so" style={{ textDecoration: 'none' }}>
                            <button style={{ padding: '10px 16px', cursor: 'pointer' }}>
                                Nhập kết quả học tập
                            </button>
                        </Link>
                    </div>

                    <div className="schedule-section">
                        <h2>Lịch Giảng Dạy Của Tôi</h2>
                        {assignments.length === 0 ? (
                            <p>Bạn chưa được phân công giảng dạy lớp nào.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="schedule-table">
                                    <thead>
                                        <tr>
                                            <th>Khóa Học</th>
                                            <th>Tên Lớp</th>
                                            <th>Thời Gian Học</th>
                                            <th>Thù Lao (VND)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {assignments.map((item) => (
                                            <tr key={item.idPhanCong}>
                                                <td>{item.tenKhoaHoc}</td>
                                                <td><strong>{item.tenLop}</strong></td>
                                                <td>
                                                    {new Date(item.ngayBatDau).toLocaleDateString('vi-VN')} -
                                                    {new Date(item.ngayKetThuc).toLocaleDateString('vi-VN')}
                                                </td>
                                                <td>{item.phiGiangDay.toLocaleString('vi-VN')}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
