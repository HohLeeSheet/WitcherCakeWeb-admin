import React, { useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, where, query  } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCollection = collection(db, "KhachHang");
      const userQuery = query(
        userCollection,
        where("email", "==", email),
        where("matKhau", "==", password),
        where("isAdmin", "==", true)
      );

      const querySnapshot = await getDocs(userQuery);

      if (querySnapshot.empty) {
        setError("Email hoặc mật khẩu không đúng!");
      } else {
        localStorage.setItem("isAdmin", true);
        navigate("/productsTest");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Đã xảy ra lỗi, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleLogin}>
        <div>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}

export default LoginAdmin;
