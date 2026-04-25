import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }: any) => {

  const userRole = localStorage.getItem("userRole");

  if (userRole !== "Admin") {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;