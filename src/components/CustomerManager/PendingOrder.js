import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { collection, getDocs, updateDoc, getDoc, doc } from "firebase/firestore";
import { format } from "date-fns";
import { db } from "../../firebase";

function PendingOrders() {
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      const customersCollection = collection(db, "KhachHang");
      const customerSnapshots = await getDocs(customersCollection);

      const allPendingOrders = [];

      for (const customerDoc of customerSnapshots.docs) {
        const customerId = customerDoc.id;
        const customerName = customerDoc.data().customerName;

        // Lấy các đơn hàng trong subcollection Orders
        const ordersCollection = collection(db, "KhachHang", customerId, "Orders");
        const ordersSnapshot = await getDocs(ordersCollection);

        ordersSnapshot.docs.forEach((orderDoc) => {
          const orderData = orderDoc.data();
          if (orderData.status === "Chưa xác nhận") {
            allPendingOrders.push({
              id: orderDoc.id,
              customerName,
              customerId,
              ...orderData,
            });
          }
        });
      }

      setPendingOrders(allPendingOrders);
    };

    fetchPendingOrders();
  }, []);

  const handleUpdateStatus = async (customerId, orderId, newStatus) => {
    try {
      const orderDocRef = doc(db, "KhachHang", customerId, "Orders", orderId);
      await updateDoc(orderDocRef, { status: newStatus });

      setPendingOrders((prevOrders) =>
        prevOrders.filter((order) => order.id !== orderId)
      );

      alert("Đã xác nhận đơn hàng!");
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
    }
  };

  return (
    <div>
      <h1>Danh sách đơn hàng chưa xác nhận</h1>
      <table border="1" style={{ width: "100%", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Tên khách hàng</th>
            <th>Mã đơn hàng</th>
            <th>Ngày tạo</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {pendingOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.customerName}</td>
              <td>{order.id}</td>
              <td>
                {order.createdAt
                  ? new Date(order.createdAt.seconds * 1000).toLocaleDateString()
                  : "N/A"}
              </td>
              <td>{order.status}</td>
              <td>
                <button
                  onClick={() =>
                    handleUpdateStatus(order.customerId, order.id, "Đã xác nhận")
                  }
                >
                  Xác nhận
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PendingOrders;
