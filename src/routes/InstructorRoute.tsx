import { Navigate } from "react-router-dom";
import { normalizeUserRole } from "../utils/authHelper";

const InstructorRoute = ({ children }: any) => {
  const userRole = normalizeUserRole(localStorage.getItem("userRole"));

  if (userRole !== "GiangVien" && userRole !== "Admin") {
    return <Navigate to="/" />;
  }

  return children;
};

export default InstructorRoute;