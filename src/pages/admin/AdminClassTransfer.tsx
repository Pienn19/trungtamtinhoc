import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "/api";

interface ChuyenLop {
    idChuyenLop: number;
    idHocVien: number;
    hoTenHocVien?: string;
    idLopCu: number;
    tenLopCu?: string;
    idLopMoi: number;
    tenLopMoi?: string;
    ngayChuyenLop: string;
    lyDo?: string;
    nguoiPheDuyet?: string;
    trangThai: string;
}

interface LopHoc {
    idLop: number;
    tenLop: string;
}

interface HocVien {
    idHocVien: number;
    hoTen: string;
}

interface StudentOption extends HocVien {
    accountId: number;
}

const AdminClassTransfer = () => {
    const [transfers, setTransfers] = useState<ChuyenLop[]>([]);
    const [classes, setClasses] = useState<LopHoc[]>([]);
    const [students, setStudents] = useState<StudentOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        idHocVien: "",
        idLopCu: "",
        idLopMoi: "",
        lyDo: "",
    });

    // Map account ID to student ID
    const [accountToStudentMap, setAccountToStudentMap] = useState<{
        [key: number]: number;
    }>({});

    useEffect(() => {
        loadTransfers();
        loadClasses();
        loadStudents();
    }, []);

    const loadTransfers = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/chuyenlop`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTransfers(res.data);
        } catch (error) {
            console.error("Error loading transfers:", error);
        }
    };

    const loadClasses = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/lophoc`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setClasses(res.data);
        } catch (error) {
            console.error("Error loading classes:", error);
        }
    };

    const loadStudents = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const users = res.data || [];
            // For each user with role=student (role id 2), try to resolve the real HocVien.IdHocVien
            const studentUsers = users.filter((u: any) => (u.idVaiTro ?? u.IdVaiTro) === 2);

            const resolved: StudentOption[] = [];
            const studentMap: { [key: number]: number } = {};

            await Promise.all(
                studentUsers.map(async (u: any) => {
                    const accountId = u.idTaiKhoan ?? u.IdTaiKhoan;
                    try {
                        const r = await axios.get(`${API_URL}/dangky/by-student/${accountId}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });

                        const regs = r.data || [];
                        // If there is at least one registration, get the HocVien id from it
                        if (Array.isArray(regs) && regs.length > 0) {
                            const hv = regs[0].hocVienInfo ?? regs[0].HocVienInfo;
                            const idHocVien = hv?.idHocVien ?? hv?.IdHocVien;
                            const hoTen = hv?.hoTen ?? hv?.HoTen ?? u.hoTen ?? u.HoTen ?? '';
                            if (idHocVien) {
                                resolved.push({ idHocVien: idHocVien, hoTen, accountId });
                                studentMap[accountId] = idHocVien;
                                return;
                            }
                        }

                        // If no registrations returned, try to infer name and skip mapping
                    } catch (err) {
                        // ignore 404/not found for students without registrations
                    }

                    // Fallback: do not include users without a mapped HocVien id to avoid FK issues
                })
            );

            setStudents(resolved as any);
            setAccountToStudentMap(studentMap);
        } catch (error) {
            console.error("Error loading students:", error);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // If user selected a student, try to auto-fill their current class (lớp cũ)
        if (name === "idHocVien" && value) {
            // value is the student/account id
            (async () => {
                try {
                    const token = localStorage.getItem("token");
                    const res = await axios.get(`${API_URL}/dangky/by-student/${value}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });

                    const regs = res.data || [];
                    if (Array.isArray(regs) && regs.length > 0) {
                        // choose first active registration's class as lớp cũ
                        const first = regs[0];
                        const idLop = first.lopHocInfo?.idLop ?? first.LopHocInfo?.IdLop ?? first.lopHocInfo?.IdLop;
                        if (idLop) {
                            setFormData((prev) => ({ ...prev, idLopCu: String(idLop) }));
                        }
                        // Also extract the actual student ID from the registration
                        const studentId = first.hocVienInfo?.idHocVien ?? first.HocVienInfo?.IdHocVien;
                        if (studentId) {
                            setAccountToStudentMap((prev) => ({
                                ...prev,
                                [parseInt(value)]: studentId,
                            }));
                        }
                    }
                } catch (err) {
                    // silent: no blocking UX if lookup fails
                    console.debug("Could not auto-fill class for student:", err);
                }
            })();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!formData.idHocVien || !formData.idLopCu || !formData.idLopMoi) {
                alert("Vui lòng điền đầy đủ thông tin");
                setLoading(false);
                return;
            }

            // Get the actual student ID from the account ID
            const accountId = parseInt(formData.idHocVien);
            const studentId = accountToStudentMap[accountId] || accountId;

            await axios.post(
                `${API_URL}/chuyenlop`,
                {
                    idHocVien: studentId,
                    idLopCu: parseInt(formData.idLopCu),
                    idLopMoi: parseInt(formData.idLopMoi),
                    lyDo: formData.lyDo,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            alert("Tạo đơn chuyển lớp thành công");
            setFormData({ idHocVien: "", idLopCu: "", idLopMoi: "", lyDo: "" });
            setShowForm(false);
            loadTransfers();
        } catch (error: any) {
            alert("Lỗi: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        try {
            const token = localStorage.getItem("token");
            const username = localStorage.getItem("username") || "Admin";

            await axios.put(
                `${API_URL}/chuyenlop/${id}/approve`,
                {
                    nguoiPheDuyet: username,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            alert("Phê duyệt chuyển lớp thành công");
            loadTransfers();
        } catch (error: any) {
            alert("Lỗi: " + (error.response?.data?.message || error.message));
        }
    };

    const handleReject = async (id: number) => {
        try {
            const token = localStorage.getItem("token");

            await axios.put(
                `${API_URL}/chuyenlop/${id}/reject`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            alert("Từ chối chuyển lớp thành công");
            loadTransfers();
        } catch (error: any) {
            alert("Lỗi: " + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <p style={styles.kicker}>Admin / Chuyển lớp</p>
                    <h1 style={styles.title}>Quản Lý Chuyển Lớp</h1>
                    <p style={styles.subtitle}>
                        Tạo đơn chuyển lớp, theo dõi trạng thái và duyệt yêu cầu của học viên.
                    </p>
                </div>

                <button
                    type="button"
                    style={styles.btnCreate}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "✕ Đóng form" : "+ Tạo đơn chuyển lớp"}
                </button>
            </div>

            {showForm && (
                <div style={styles.formCard}>
                    <div style={styles.formHeader}>
                        <div>
                            <h2 style={styles.formTitle}>Tạo đơn chuyển lớp</h2>
                            <p style={styles.formDescription}>
                                Chọn học viên, lớp hiện tại và lớp mới để tạo yêu cầu chuyển lớp.
                            </p>
                        </div>
                        <div style={styles.formHint}>Các trường có dấu * là bắt buộc</div>
                    </div>

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formGrid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Học viên *</label>
                                <select
                                    name="idHocVien"
                                    value={formData.idHocVien}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.control}
                                >
                                    <option value="">-- Chọn học viên --</option>
                                    {students.map((s) => (
                                        <option key={s.accountId} value={s.accountId}>
                                            {s.hoTen}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Lớp cũ *</label>
                                <select
                                    name="idLopCu"
                                    value={formData.idLopCu}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.control}
                                >
                                    <option value="">-- Chọn lớp cũ --</option>
                                    {classes.map((c) => (
                                        <option key={c.idLop} value={c.idLop}>
                                            {c.tenLop}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>Lớp mới *</label>
                                <select
                                    name="idLopMoi"
                                    value={formData.idLopMoi}
                                    onChange={handleInputChange}
                                    required
                                    style={styles.control}
                                >
                                    <option value="">-- Chọn lớp mới --</option>
                                    {classes.map((c) => (
                                        <option key={c.idLop} value={c.idLop}>
                                            {c.tenLop}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ ...styles.formGroup, ...styles.formGroupFull }}>
                                <label style={styles.label}>Lý do</label>
                                <textarea
                                    name="lyDo"
                                    value={formData.lyDo}
                                    onChange={handleInputChange}
                                    placeholder="Ví dụ: Xung đột giờ học, chuyển sang ca phù hợp hơn..."
                                    rows={4}
                                    style={{ ...styles.control, ...styles.textarea }}
                                />
                            </div>
                        </div>

                        <div style={styles.formActions}>
                            <button
                                type="button"
                                style={styles.btnSecondary}
                                onClick={() => setShowForm(false)}
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                style={styles.btnSubmit}
                                disabled={loading}
                            >
                                {loading ? "Đang gửi..." : "Gửi đơn chuyển lớp"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={styles.sectionHeader}>
                <div>
                    <h2 style={styles.sectionTitle}>Danh sách đơn chuyển lớp</h2>
                    <p style={styles.sectionSubtitle}>
                        Theo dõi nhanh các đơn đang chờ duyệt và trạng thái xử lý.
                    </p>
                </div>
            </div>

            {transfers.length === 0 ? (
                <div style={styles.emptyState}>Chưa có đơn chuyển lớp nào</div>
            ) : (
                <div style={styles.tableShell}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Học viên</th>
                                <th>Lớp cũ</th>
                                <th>Lớp mới</th>
                                <th>Ngày chuyển</th>
                                <th>Trạng thái</th>
                                <th>Lý do</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.map((t) => (
                                <tr key={t.idChuyenLop}>
                                    <td>{t.idChuyenLop}</td>
                                    <td>
                                        <div style={styles.primaryCell}>{t.hoTenHocVien}</div>
                                        <div style={styles.secondaryCell}>ID HV: {t.idHocVien}</div>
                                    </td>
                                    <td>{t.tenLopCu}</td>
                                    <td>{t.tenLopMoi}</td>
                                    <td>{new Date(t.ngayChuyenLop).toLocaleDateString("vi-VN")}</td>
                                    <td>
                                        <span
                                            style={{
                                                ...styles.statusBadge,
                                                color: getStatusColor(t.trangThai),
                                                backgroundColor: `${getStatusColor(t.trangThai)}15`,
                                            }}
                                        >
                                            {t.trangThai}
                                        </span>
                                    </td>
                                    <td>{t.lyDo || "--"}</td>
                                    <td>
                                        {t.trangThai === "Pending" || t.trangThai === "TeacherRequested" ? (
                                            <div style={styles.actionGroup}>
                                                <button
                                                    type="button"
                                                    style={styles.btnApprove}
                                                    onClick={() => handleApprove(t.idChuyenLop)}
                                                >
                                                    Phê duyệt
                                                </button>
                                                <button
                                                    type="button"
                                                    style={styles.btnReject}
                                                    onClick={() => handleReject(t.idChuyenLop)}
                                                >
                                                    Từ chối
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={styles.mutedText}>--</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "Approved":
            return "#22c55e";
        case "Rejected":
            return "#ef4444";
        case "Pending":
            return "#f59e0b";
        case "TeacherRequested":
            return "#2563eb";
        default:
            return "#6b7280";
    }
};

const styles = {
    container: {
        padding: "24px",
        maxWidth: "1280px",
        margin: "0 auto",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
        marginBottom: "20px",
        flexWrap: "wrap" as const,
    },
    kicker: {
        margin: 0,
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
        color: "#64748b",
    },
    title: {
        margin: "6px 0 0",
        fontSize: "32px",
        lineHeight: 1.15,
        color: "#0f172a",
    },
    subtitle: {
        margin: "8px 0 0",
        color: "#64748b",
        maxWidth: "720px",
    },
    btnCreate: {
        padding: "12px 18px",
        background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
        color: "white",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: 700,
        boxShadow: "0 10px 24px rgba(37, 99, 235, 0.18)",
    },
    formCard: {
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        padding: "20px",
        borderRadius: "16px",
        marginBottom: "24px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
    },
    formHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "12px",
        marginBottom: "18px",
        flexWrap: "wrap" as const,
    },
    formTitle: {
        margin: 0,
        fontSize: "20px",
        color: "#0f172a",
    },
    formDescription: {
        margin: "6px 0 0",
        color: "#64748b",
    },
    formHint: {
        fontSize: "13px",
        color: "#334155",
        background: "#e2e8f0",
        borderRadius: "999px",
        padding: "8px 12px",
        whiteSpace: "nowrap" as const,
    },
    form: {
        margin: 0,
    },
    formGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "16px",
    },
    formGroup: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "8px",
    },
    formGroupFull: {
        gridColumn: "1 / -1",
    },
    label: {
        fontSize: "14px",
        fontWeight: 700,
        color: "#334155",
    },
    control: {
        width: "100%",
        border: "1px solid #cbd5e1",
        borderRadius: "12px",
        padding: "12px 14px",
        background: "#fff",
        color: "#0f172a",
        fontSize: "14px",
        outline: "none",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        boxSizing: "border-box" as const,
    },
    textarea: {
        resize: "vertical" as const,
        minHeight: "120px",
    },
    formActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "18px",
    },
    btnSubmit: {
        padding: "12px 18px",
        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        color: "white",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: 700,
        boxShadow: "0 10px 24px rgba(16, 185, 129, 0.18)",
    },
    btnSecondary: {
        padding: "12px 18px",
        background: "#fff",
        color: "#334155",
        border: "1px solid #cbd5e1",
        borderRadius: "12px",
        cursor: "pointer",
        fontWeight: 700,
    },
    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: "12px",
        marginBottom: "12px",
        flexWrap: "wrap" as const,
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
    emptyState: {
        padding: "20px",
        borderRadius: "14px",
        border: "1px dashed #cbd5e1",
        background: "#fff",
        color: "#64748b",
    },
    tableShell: {
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        overflowX: "auto" as const,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.05)",
    },
    table: {
        width: "100%",
        borderCollapse: "separate" as const,
        borderSpacing: 0,
        marginTop: 0,
    },
    primaryCell: {
        fontWeight: 700,
        color: "#0f172a",
    },
    secondaryCell: {
        marginTop: 4,
        fontSize: 12,
        color: "#64748b",
    },
    statusBadge: {
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: 700,
    },
    actionGroup: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap" as const,
    },
    btnApprove: {
        padding: "8px 12px",
        background: "#22c55e",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: 700,
    },
    btnReject: {
        padding: "8px 12px",
        background: "#ef4444",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: 700,
    },
    mutedText: {
        color: "#94a3b8",
    },
};

export default AdminClassTransfer;
