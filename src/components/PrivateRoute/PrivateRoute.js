import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const isAdmin = localStorage.getItem("isAdmin"); // Kiểm tra trạng thái đăng nhập từ LocalStorage
  return isAdmin === "true" ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
