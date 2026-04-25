import { useEffect, useState } from "react";
import axios from "axios";

interface OverviewStats {
    totalCourses: number;
    totalClasses: number;
    totalStudents: number;
    totalInstructors: number;
    totalEnrollments: number;
    completedEnrollments: number;
    completionRate: number;
    totalRevenue: number;
    certificatesIssued: number;
}

interface CourseStats {
    courseId: number;
    courseName: string;
    totalClasses: number;
    totalEnrolled: number;
    totalRevenue: number;
    averageRating: number;
}

interface RevenueStats {
    totalRevenue: number;
    byStatus: Array<{ status: string; count: number; totalAmount: number }>;
    byMethod: Array<{ method: string; count: number; totalAmount: number }>;
}

interface GradeDistribution {
    gradeRange: string;
    count: number;
    percentage: number;
}

const AdminReporting = () => {
    const [overview, setOverview] = useState<OverviewStats | null>(null);
    const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
    const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
    const [gradeDistribution, setGradeDistribution] = useState<
        GradeDistribution[]
    >([]);
    const [activeTab, setActiveTab] = useState("overview");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [ovRes, courseRes, revRes, gradeRes] = await Promise.all([
                axios.get("http://localhost:5025/api/reporting/overview", { headers }),
                axios.get("http://localhost:5025/api/reporting/course-statistics", {
                    headers,
                }),
                axios.get("http://localhost:5025/api/reporting/revenue-statistics", {
                    headers,
                }),
                axios.get("http://localhost:5025/api/reporting/grade-distribution", {
                    headers,
                }),
            ]);

            setOverview(ovRes.data);
            setCourseStats(courseRes.data);
            setRevenueStats(revRes.data);
            setGradeDistribution(gradeRes.data);
        } catch (error) {
            console.error("Error loading reporting data:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <h1>Báo Cáo & Thống Kê</h1>
                <p>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1>📊 Báo Cáo & Thống Kê</h1>

            <div style={styles.tabs}>
                <button
                    style={{
                        ...styles.tabBtn,
                        ...(activeTab === "overview"
                            ? styles.tabBtnActive
                            : styles.tabBtnInactive),
                    }}
                    onClick={() => setActiveTab("overview")}
                >
                    Tổng Quan
                </button>
                <button
                    style={{
                        ...styles.tabBtn,
                        ...(activeTab === "courses"
                            ? styles.tabBtnActive
                            : styles.tabBtnInactive),
                    }}
                    onClick={() => setActiveTab("courses")}
                >
                    Khóa Học
                </button>
                <button
                    style={{
                        ...styles.tabBtn,
                        ...(activeTab === "revenue"
                            ? styles.tabBtnActive
                            : styles.tabBtnInactive),
                    }}
                    onClick={() => setActiveTab("revenue")}
                >
                    Doanh Thu
                </button>
                <button
                    style={{
                        ...styles.tabBtn,
                        ...(activeTab === "grades"
                            ? styles.tabBtnActive
                            : styles.tabBtnInactive),
                    }}
                    onClick={() => setActiveTab("grades")}
                >
                    Điểm Số
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && overview && (
                <div style={styles.content}>
                    <div style={styles.statsGrid}>
                        <StatCard
                            label="Tổng Khóa Học"
                            value={overview.totalCourses}
                            icon="📚"
                            color="#3b82f6"
                        />
                        <StatCard
                            label="Tổng Lớp Học"
                            value={overview.totalClasses}
                            icon="🏫"
                            color="#8b5cf6"
                        />
                        <StatCard
                            label="Tổng Học Viên"
                            value={overview.totalStudents}
                            icon="👥"
                            color="#ec4899"
                        />
                        <StatCard
                            label="Giảng Viên"
                            value={overview.totalInstructors}
                            icon="👨‍🏫"
                            color="#f59e0b"
                        />
                        <StatCard
                            label="Đơn Đăng Ký"
                            value={overview.totalEnrollments}
                            icon="📋"
                            color="#10b981"
                        />
                        <StatCard
                            label="Hoàn Thành"
                            value={overview.completedEnrollments}
                            icon="✅"
                            color="#06b6d4"
                        />
                        <StatCard
                            label="Tỷ Lệ Hoàn Thành"
                            value={`${overview.completionRate}%`}
                            icon="📈"
                            color="#6366f1"
                        />
                        <StatCard
                            label="Doanh Thu"
                            value={formatVND(overview.totalRevenue)}
                            icon="💰"
                            color="#14b8a6"
                        />
                        <StatCard
                            label="Chứng Chỉ Cấp"
                            value={overview.certificatesIssued}
                            icon="🎓"
                            color="#f97316"
                        />
                    </div>
                </div>
            )}

            {/* Courses Tab */}
            {activeTab === "courses" && (
                <div style={styles.content}>
                    <h2>Thống Kê Khóa Học</h2>
                    {courseStats.length === 0 ? (
                        <p>Không có dữ liệu</p>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th>Khóa Học</th>
                                    <th>Lớp</th>
                                    <th>Học Viên</th>
                                    <th>Doanh Thu</th>
                                    <th>Đánh Giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courseStats.map((c) => (
                                    <tr key={c.courseId} style={styles.tableRow}>
                                        <td>
                                            <strong>{c.courseName}</strong>
                                        </td>
                                        <td>{c.totalClasses}</td>
                                        <td>{c.totalEnrolled}</td>
                                        <td style={{ color: "#10b981" }}>
                                            <strong>{formatVND(c.totalRevenue)}</strong>
                                        </td>
                                        <td>⭐ {c.averageRating}/5</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Revenue Tab */}
            {activeTab === "revenue" && revenueStats && (
                <div style={styles.content}>
                    <h2>Thống Kê Doanh Thu</h2>
                    <div style={styles.revenueSection}>
                        <div style={styles.revenueSummary}>
                            <h3>Tổng Doanh Thu</h3>
                            <p style={styles.revenueTotal}>
                                {formatVND(revenueStats.totalRevenue)}
                            </p>
                        </div>

                        <div style={styles.revenueCharts}>
                            <div style={styles.revenueChart}>
                                <h3>Theo Trạng Thái Thanh Toán</h3>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeader}>
                                            <th>Trạng Thái</th>
                                            <th>Số Lượng</th>
                                            <th>Tổng Tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {revenueStats.byStatus.map((s) => (
                                            <tr key={s.status} style={styles.tableRow}>
                                                <td>{s.status}</td>
                                                <td>{s.count}</td>
                                                <td>{formatVND(s.totalAmount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div style={styles.revenueChart}>
                                <h3>Theo Hình Thức Thanh Toán</h3>
                                <table style={styles.table}>
                                    <thead>
                                        <tr style={styles.tableHeader}>
                                            <th>Hình Thức</th>
                                            <th>Số Lượng</th>
                                            <th>Tổng Tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {revenueStats.byMethod.map((m) => (
                                            <tr key={m.method} style={styles.tableRow}>
                                                <td>{m.method}</td>
                                                <td>{m.count}</td>
                                                <td>{formatVND(m.totalAmount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Grades Tab */}
            {activeTab === "grades" && (
                <div style={styles.content}>
                    <h2>Phân Bố Điểm Số</h2>
                    {gradeDistribution.length === 0 ? (
                        <p>Không có dữ liệu</p>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr style={styles.tableHeader}>
                                    <th>Khoảng Điểm</th>
                                    <th>Số Lượng Học Viên</th>
                                    <th>Phần Trăm</th>
                                    <th>Biểu Đồ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gradeDistribution.map((g) => (
                                    <tr key={g.gradeRange} style={styles.tableRow}>
                                        <td>
                                            <strong>{g.gradeRange}</strong>
                                        </td>
                                        <td>{g.count}</td>
                                        <td>{g.percentage}%</td>
                                        <td>
                                            <div style={styles.progressBar}>
                                                <div
                                                    style={{
                                                        ...styles.progressFill,
                                                        width: `${g.percentage * 2}px`,
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

interface StatCardProps {
    label: string;
    value: string | number;
    icon: string;
    color: string;
}

const StatCard = ({ label, value, icon, color }: StatCardProps) => (
    <div
        style={{
            ...styles.statCard,
            borderLeft: `4px solid ${color}`,
        }}
    >
        <div style={styles.statIcon}>{icon}</div>
        <div>
            <p style={styles.statLabel}>{label}</p>
            <p style={styles.statValue}>{value}</p>
        </div>
    </div>
);

const styles = {
    container: {
        padding: "20px",
    },
    tabs: {
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        borderBottom: "2px solid #e5e7eb",
    },
    tabBtn: {
        padding: "10px 20px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500" as const,
    },
    tabBtnActive: {
        color: "#3b82f6",
        borderBottom: "3px solid #3b82f6",
    },
    tabBtnInactive: {
        color: "#6b7280",
    },
    content: {
        background: "white",
        padding: "20px",
        borderRadius: "8px",
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
    },
    statCard: {
        background: "white",
        padding: "20px",
        borderRadius: "8px",
        display: "flex",
        gap: "15px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    statIcon: {
        fontSize: "32px",
    },
    statLabel: {
        margin: "0",
        color: "#6b7280",
        fontSize: "14px",
    },
    statValue: {
        margin: "5px 0 0 0",
        fontSize: "24px",
        fontWeight: "bold" as const,
        color: "#1f2937",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse" as const,
        marginTop: "20px",
    },
    tableHeader: {
        background: "#f3f4f6",
        borderBottom: "2px solid #e5e7eb",
    },
    tableRow: {
        borderBottom: "1px solid #e5e7eb",
    },
    revenueSection: {
        marginTop: "20px",
    },
    revenueSummary: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        padding: "30px",
        borderRadius: "8px",
        marginBottom: "30px",
    },
    revenueTotal: {
        fontSize: "32px",
        fontWeight: "bold" as const,
        margin: "10px 0 0 0",
    },
    revenueCharts: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "20px",
    },
    revenueChart: {
        background: "#f9fafb",
        padding: "20px",
        borderRadius: "8px",
    },
    progressBar: {
        background: "#e5e7eb",
        height: "8px",
        borderRadius: "4px",
        overflow: "hidden",
    },
    progressFill: {
        background: "#3b82f6",
        height: "100%",
    },
};

export default AdminReporting;
