import React from "react";
import { Navigate } from "react-router-dom";
import Swal from "sweetalert2";

function LogOut() {
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Xác nhận đăng xuất",
      text: "Bạn có chắc chắn muốn đăng xuất không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      localStorage.setItem("isAdmin", false);
      return <Navigate to="/login" />;
    }
  };

  // Kích hoạt hàm `handleLogout`
  handleLogout();
  return null;
}

export default LogOut;
