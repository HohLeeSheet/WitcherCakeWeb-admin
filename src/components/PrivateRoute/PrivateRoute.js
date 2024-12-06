import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const isAdmin = localStorage.getItem("isAdmin");
  if(!isAdmin){
    alert("Bạn cần đăng nhập")
  }
   // Kiểm tra trạng thái đăng nhập từ LocalStorage
  return isAdmin === "true" ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
