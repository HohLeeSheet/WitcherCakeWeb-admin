import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import DataTable from "react-data-table-component";
import { format } from "date-fns";

function PendingOrders() {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const customersCollection = collection(db, "KhachHang");
        const customerSnapshots = await getDocs(customersCollection);

        const allPendingOrders = [];

        await Promise.all(
          customerSnapshots.docs.map(async (customerDoc) => {
            const customerId = customerDoc.id;
            const customerName = customerDoc.data().customerName;

            const ordersCollection = collection(
              db,
              "KhachHang",
              customerId,
              "Orders"
            );
            const ordersSnapshot = await getDocs(ordersCollection);

            ordersSnapshot.docs.forEach((orderDoc) => {
              const orderData = orderDoc.data();
              if (orderData.status === "Chờ xác nhận") {
                allPendingOrders.push({
                  id: orderDoc.id,
                  customerName,
                  customerId,
                  ...orderData,
                });
              }
            });
          })
        );

        setPendingOrders(allPendingOrders);
      } catch (err) {
        setError("Lỗi khi tải dữ liệu. Vui lòng thử lại!");
        console.error(err);
      } finally {
        setLoading(false);
      }
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
      alert("Không thể cập nhật trạng thái. Vui lòng thử lại!");
    }
  };

  const columns = [
    {
      name: "Mã đơn hàng",
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: "Ngày tạo",
      selector: (row) =>
        row.createdAt && row.createdAt.seconds
          ? format(new Date(row.createdAt.seconds * 1000), "dd/MM/yyyy")
          : "Không xác định",
      sortable: true,
    },
    {
      name: "Tên khách hàng",
      selector: (row) => row.customerName,
      sortable: true,
    },
    {
      name: "Tổng tiền",
      selector: (row) =>
        row.totalAmount
          ? new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(row.totalAmount * 1000) // Nhân với 1000 nếu cần
          : "0 VND",
      sortable: true,
    },
    {
      name: "Trạng thái",
      cell: (row) =>
        row.status === "Chờ xác nhận" ? (
          <button
            onClick={() => handleUpdateStatus(row.customerId, row.id, "Đã xác nhận")}
            style={{
              padding: "5px 10px",
              backgroundColor: "#864912",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Xác nhận
          </button>
        ) : (
          <span style={{ color: "green" }}>Đã xác nhận</span>
        ),
      sortable: false,
    },
  ];

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{marginLeft:"20px"}}>
      <h2>Quản lý đơn hàng</h2>
      <DataTable
        title="Danh sách đơn hàng"
        columns={columns}
        data={pendingOrders}
        pagination
        highlightOnHover
        paginationComponentOptions={{
          noRowsPerPage: true,
        }}
        customStyles={{
          pagination: {
            style: {
              marginTop: "10px",
              display: "block",
              textAlign: "center",
            },
          },
        }}
      />
    </div>
  );
}

export default PendingOrders;
