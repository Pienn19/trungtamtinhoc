import { useEffect, useState } from "react";
import axios from "axios";

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

const AdminClassTransfer = () => {
    const [transfers, setTransfers] = useState<ChuyenLop[]>([]);
    const [classes, setClasses] = useState<LopHoc[]>([]);
    const [students, setStudents] = useState<HocVien[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        idHocVien: "",
        idLopCu: "",
        idLopMoi: "",
        lyDo: "",
    });

    useEffect(() => {
        loadTransfers();
        loadClasses();
        loadStudents();
    }, []);

    const loadTransfers = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:5025/api/chuyenlop", {
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
            const res = await axios.get("http://localhost:5025/api/lophoc", {
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
            const res = await axios.get("http://localhost:5025/api/admin/users", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStudents(res.data.filter((u: any) => u.idVaiTro === 3));
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

            await axios.post(
                "http://localhost:5025/api/chuyenlop",
                {
                    idHocVien: parseInt(formData.idHocVien),
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
                `http://localhost:5025/api/chuyenlop/${id}/approve`,
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
                `http://localhost:5025/api/chuyenlop/${id}/reject`,
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
            <h1>Quản Lý Chuyển Lớp</h1>

            <button
                style={styles.btnCreate}
                onClick={() => setShowForm(!showForm)}
            >
                {showForm ? "✕ Hủy" : "+ Tạo đơn chuyển lớp"}
            </button>

            {showForm && (
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label>Học viên *</label>
                        <select
                            name="idHocVien"
                            value={formData.idHocVien}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">-- Chọn học viên --</option>
                            {students.map((s) => (
                                <option key={s.idHocVien} value={s.idHocVien}>
                                    {s.hoTen}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label>Lớp cũ *</label>
                        <select
                            name="idLopCu"
                            value={formData.idLopCu}
                            onChange={handleInputChange}
                            required
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
                        <label>Lớp mới *</label>
                        <select
                            name="idLopMoi"
                            value={formData.idLopMoi}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">-- Chọn lớp mới --</option>
                            {classes.map((c) => (
                                <option key={c.idLop} value={c.idLop}>
                                    {c.tenLop}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label>Lý do</label>
                        <textarea
                            name="lyDo"
                            value={formData.lyDo}
                            onChange={handleInputChange}
                            placeholder="Nhập lý do chuyển lớp..."
                            rows={3}
                        />
                    </div>

                    <button
                        type="submit"
                        style={styles.btnSubmit}
                        disabled={loading}
                    >
                        {loading ? "Đang gửi..." : "Gửi đơn chuyển lớp"}
                    </button>
                </form>
            )}

            <h2 style={{ marginTop: "30px" }}>Danh sách đơn chuyển lớp</h2>

            {transfers.length === 0 ? (
                <p>Chưa có đơn chuyển lớp nào</p>
            ) : (
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
                                <td>{t.hoTenHocVien}</td>
                                <td>{t.tenLopCu}</td>
                                <td>{t.tenLopMoi}</td>
                                <td>
                                    {new Date(t.ngayChuyenLop).toLocaleDateString("vi-VN")}
                                </td>
                                <td style={{ color: getStatusColor(t.trangThai) }}>
                                    <strong>{t.trangThai}</strong>
                                </td>
                                <td>{t.lyDo}</td>
                                <td>
                                    {t.trangThai === "Pending" && (
                                        <>
                                            <button
                                                style={styles.btnApprove}
                                                onClick={() => handleApprove(t.idChuyenLop)}
                                            >
                                                Phê duyệt
                                            </button>
                                            <button
                                                style={styles.btnReject}
                                                onClick={() => handleReject(t.idChuyenLop)}
                                            >
                                                Từ chối
                                            </button>
                                        </>
                                    )}
                                    {t.trangThai !== "Pending" && (
                                        <span>--</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
        default:
            return "#6b7280";
    }
};

const styles = {
    container: {
        padding: "20px",
    },
    btnCreate: {
        padding: "10px 20px",
        background: "#3b82f6",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        marginBottom: "20px",
    },
    form: {
        background: "#f3f4f6",
        padding: "20px",
        borderRadius: "8px",
        marginBottom: "20px",
    },
    formGroup: {
        marginBottom: "15px",
    },
    btnSubmit: {
        padding: "10px 20px",
        background: "#10b981",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
    },
    table: {
        width: "100%",
        borderCollapse: "collapse" as const,
        marginTop: "20px",
    },
    btnApprove: {
        padding: "5px 10px",
        background: "#22c55e",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        marginRight: "5px",
    },
    btnReject: {
        padding: "5px 10px",
        background: "#ef4444",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
};

export default AdminClassTransfer;
