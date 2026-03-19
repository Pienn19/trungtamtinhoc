import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }: any) => {

  const role = localStorage.getItem("role");

  if (role !== "Admin") {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;