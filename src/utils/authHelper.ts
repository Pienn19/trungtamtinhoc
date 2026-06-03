export const getToken = () => {
    return localStorage.getItem("token")
}

export const isLoggedIn = () => {
    return !!localStorage.getItem("token")
}

export const logout = () => {
    localStorage.removeItem("token")
}

export const normalizeUserRole = (role: string | null | undefined) => {
    if (!role) {
        return null;
    }

    const normalized = role
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    if (normalized === "1" || normalized === "admin" || normalized.includes("quan tri")) {
        return "Admin";
    }

    if (normalized === "2" || normalized === "hocvien" || normalized.includes("hoc vien")) {
        return "HocVien";
    }

    if (normalized === "3" || normalized === "giangvien" || normalized.includes("giang vien") || normalized.includes("giang")) {
        return "GiangVien";
    }

    return role;
}
