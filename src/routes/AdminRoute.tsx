import { Navigate } from "react-router-dom";
import { normalizeUserRole } from "../utils/authHelper";

const AdminRoute = ({ children }: any) => {

  const userRole = normalizeUserRole(localStorage.getItem("userRole"));

  if (userRole !== "Admin") {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;