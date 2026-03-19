import { jwtDecode } from "jwt-decode"

interface JwtPayload {
    unique_name: string
}

export const getUsernameFromToken = () => {

    const token = localStorage.getItem("token")

    if (!token) return null

    const decoded = jwtDecode<JwtPayload>(token)

    return decoded.unique_name
}
