import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "react-toastify";

const API_URL = "/api";

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
    const [isExporting, setIsExporting] = useState(false);
    const [isPdfRendering, setIsPdfRendering] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            const [ovRes, courseRes, revRes, gradeRes] = await Promise.all([
                axios.get(`${API_URL}/reporting/overview`, { headers }),
                axios.get(`${API_URL}/reporting/course-statistics`, {
                    headers,
                }),
                axios.get(`${API_URL}/reporting/revenue-statistics`, {
                    headers,
                }),
                axios.get(`${API_URL}/reporting/grade-distribution`, {
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

    const getStatusColor = (status: string) => {
        const normalized = status.toLowerCase();

        if (normalized.includes("đã") || normalized.includes("hoàn") || normalized.includes("paid") || normalized.includes("complete")) {
            return "#16a34a";
        }

        if (normalized.includes("chưa") || normalized.includes("pending")) {
            return "#f59e0b";
        }

        if (normalized.includes("hủy") || normalized.includes("cancel") || normalized.includes("fail")) {
            return "#ef4444";
        }

        return "#64748b";
    };

    const handleExportPDF = () => {
        setIsExporting(true);
        setIsPdfRendering(true);
        const toastId = toast.loading("Đang tạo file PDF, hệ thống đang tải biểu đồ vui lòng đợi tí...");
        
        setTimeout(async () => {
            if (!reportRef.current) {
                toast.error("Không tìm thấy dữ liệu để xuất");
                setIsExporting(false);
                setIsPdfRendering(false);
                return;
            }
            try {
                const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: "#f8fafc" });
                const imgData = canvas.toDataURL("image/png");
                const pdf = new jsPDF("p", "mm", "a4");
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                const pageHeight = pdf.internal.pageSize.getHeight();
                
                let position = 0;
                let heightLeft = pdfHeight;
                
                pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;
                
                while (heightLeft > 0) {
                    position = heightLeft - pdfHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
                    heightLeft -= pageHeight;
                }

                pdf.save("BaoCaoTongHop.pdf");
                toast.update(toastId, { render: "Xuất file PDF thành công!", type: "success", isLoading: false, autoClose: 3000 });
            } catch (error) {
                console.error("Export PDF error", error);
                toast.update(toastId, { render: "Có lỗi xảy ra khi xuất PDF", type: "error", isLoading: false, autoClose: 3000 });
            } finally {
                setIsExporting(false);
                setIsPdfRendering(false);
            }
        }, 1500); // Wait for charts to animate
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>📊 Báo Cáo & Thống Kê</h1>
                <button 
                    style={styles.exportBtn} 
                    onClick={handleExportPDF}
                    disabled={isExporting}
                >
                    {isExporting ? "Đang xuất..." : "📥 Xuất PDF Báo Cáo"}
                </button>
            </div>

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

            <div ref={reportRef} style={isPdfRendering ? { background: '#f8fafc', padding: 20 } : {}}>
                {isPdfRendering && <h1 style={{textAlign: 'center', marginBottom: 20, color: '#1e293b'}}>Báo Cáo Tổng Hợp Thống Kê</h1>}

                {/* Overview Tab */}
                {(activeTab === "overview" || isPdfRendering) && overview && (
                    <div style={{...styles.content, marginBottom: isPdfRendering ? 30 : 0}}>
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
            {(activeTab === "courses" || isPdfRendering) && (
                <div style={{...styles.content, marginBottom: isPdfRendering ? 30 : 0}}>
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

                    {courseStats.length > 0 && (
                        <div style={{ marginTop: 40 }}>
                            <h3>Biểu đồ Doanh Thu Khóa Học</h3>
                            <div style={{ height: 400, width: "100%", marginTop: 20 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={courseStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="courseName" />
                                        <YAxis tickFormatter={(value) => new Intl.NumberFormat("vi-VN", { notation: "compact", compactDisplay: "short" }).format(value)} />
                                        <Tooltip formatter={(value: number) => formatVND(value)} />
                                        <Legend />
                                        <Bar dataKey="totalRevenue" name="Doanh Thu (VND)" fill="#10b981" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Revenue Tab */}
            {(activeTab === "revenue" || isPdfRendering) && revenueStats && (
                <div style={{...styles.content, marginBottom: isPdfRendering ? 30 : 0}}>
                    <div style={styles.sectionHeader}>
                        <div>
                            <h2 style={styles.sectionTitle}>Thống Kê Doanh Thu</h2>
                            <p style={styles.sectionSubtitle}>
                                Tổng hợp doanh thu theo trạng thái và phương thức thanh toán.
                            </p>
                        </div>
                    </div>

                    <div style={styles.revenueSection}>
                        <div style={styles.revenueSummary}>
                            <div>
                                <p style={styles.revenueEyebrow}>Tổng doanh thu đã ghi nhận</p>
                                <p style={styles.revenueTotal}>{formatVND(revenueStats.totalRevenue)}</p>
                            </div>

                            <div style={styles.revenueSummaryMeta}>
                                <div style={styles.revenueMiniStat}>
                                    <span style={styles.revenueMiniLabel}>Trạng thái</span>
                                    <strong>{revenueStats.byStatus.length}</strong>
                                </div>
                                <div style={styles.revenueMiniStat}>
                                    <span style={styles.revenueMiniLabel}>Phương thức</span>
                                    <strong>{revenueStats.byMethod.length}</strong>
                                </div>
                            </div>
                        </div>

                        <div style={styles.revenueCharts}>
                            <div style={styles.revenueChart}>
                                <h3>Theo Trạng Thái Thanh Toán</h3>
                                {revenueStats.byStatus.length === 0 ? (
                                    <div style={styles.emptyState}>Không có dữ liệu trạng thái thanh toán</div>
                                ) : (
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
                                                    <td>
                                                        <span
                                                            style={{
                                                                ...styles.statusBadge,
                                                                color: getStatusColor(s.status),
                                                                backgroundColor: `${getStatusColor(s.status)}15`,
                                                            }}
                                                        >
                                                            {s.status}
                                                        </span>
                                                    </td>
                                                    <td>{s.count}</td>
                                                    <td><strong>{formatVND(s.totalAmount)}</strong></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div style={styles.revenueChart}>
                                <h3>Theo Hình Thức Thanh Toán</h3>
                                {revenueStats.byMethod.length === 0 ? (
                                    <div style={styles.emptyState}>Không có dữ liệu phương thức thanh toán</div>
                                ) : (
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
                                                    <td><strong>{m.method}</strong></td>
                                                    <td>{m.count}</td>
                                                    <td>{formatVND(m.totalAmount)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        <div style={{ ...styles.revenueCharts, marginTop: 40 }}>
                            <div style={{ ...styles.revenueChart, height: 350 }}>
                                <h3>Biểu Đồ Doanh Thu Theo Trạng Thái</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={revenueStats.byStatus}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="status" />
                                        <YAxis tickFormatter={(value) => new Intl.NumberFormat("vi-VN", { notation: "compact", compactDisplay: "short" }).format(value)} />
                                        <Tooltip formatter={(value: number) => formatVND(value)} />
                                        <Bar dataKey="totalAmount" name="Tổng Tiền" fill="#6366f1">
                                            {revenueStats.byStatus.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            
                            <div style={{ ...styles.revenueChart, height: 350 }}>
                                <h3>Biểu Đồ Theo Phương Thức Thanh Toán</h3>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={revenueStats.byMethod} dataKey="totalAmount" nameKey="method" cx="50%" cy="50%" outerRadius={100} label={(entry) => entry.method}>
                                            {revenueStats.byMethod.map((entry, index) => {
                                                const colors = ["#0ea5e9", "#f43f5e", "#10b981", "#8b5cf6"];
                                                return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                            })}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => formatVND(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Grades Tab */}
            {(activeTab === "grades" || isPdfRendering) && (
                <div style={{...styles.content, marginBottom: isPdfRendering ? 30 : 0}}>
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
    exportBtn: {
        backgroundColor: "#10b981",
        color: "white",
        border: "none",
        padding: "8px 16px",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "bold" as const,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    },
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
        padding: "24px",
        borderRadius: "16px",
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
    },
    sectionHeader: {
        marginBottom: "16px",
    },
    sectionTitle: {
        margin: 0,
        fontSize: "22px",
        color: "#0f172a",
    },
    sectionSubtitle: {
        margin: "6px 0 0",
        color: "#64748b",
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
        marginTop: "8px",
    },
    revenueSummary: {
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        color: "white",
        padding: "28px",
        borderRadius: "18px",
        marginBottom: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "20px",
        flexWrap: "wrap" as const,
    },
    revenueEyebrow: {
        margin: 0,
        fontSize: "13px",
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase" as const,
        opacity: 0.85,
    },
    revenueTotal: {
        fontSize: "40px",
        fontWeight: "bold" as const,
        margin: "10px 0 0 0",
    },
    revenueSummaryMeta: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(120px, 1fr))",
        gap: "12px",
    },
    revenueMiniStat: {
        minWidth: "120px",
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.18)",
        borderRadius: "14px",
        padding: "14px",
    },
    revenueMiniLabel: {
        display: "block",
        fontSize: "12px",
        opacity: 0.85,
        marginBottom: "6px",
    },
    revenueCharts: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "20px",
    },
    revenueChart: {
        background: "#f8fafc",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
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
    statusBadge: {
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: 700,
    },
    emptyState: {
        padding: "16px",
        borderRadius: "12px",
        border: "1px dashed #cbd5e1",
        background: "#fff",
        color: "#64748b",
    },
};

export default AdminReporting;
