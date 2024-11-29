import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { collection, getDocs, updateDoc, getDoc, doc } from "firebase/firestore";
import { format } from "date-fns";
import { db } from "../../firebase";
import "./OrderManager.css"

function CustomerOrders() {
    const { customerId } = useParams();
    const [orders, setOrders] = useState([]);
    const [customerName, setCustomerName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            // Lấy thông tin khách hàng
            setLoading(true);
            const customerDocRef = collection(db, "KhachHang");
            const customerSnapshot = await getDocs(customerDocRef);
            const customerData = customerSnapshot.docs.find((doc) => doc.id === customerId);

            if (customerData) {
                setCustomerName(customerData.data().customerName);

                // Lấy subcollection Orders
                const ordersCollection = collection(db, "KhachHang", customerId, "Orders");
                const ordersSnapshot = await getDocs(ordersCollection);
                const ordersList = ordersSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setLoading(false);
                setOrders(ordersList);
            }
        };

        fetchOrders();
    }, [customerId]);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            const orderDocRef = doc(db, "KhachHang", customerId, "Orders", orderId);
            await updateDoc(orderDocRef, { status: newStatus });

            // Cập nhật trạng thái trong UI
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );

            alert("Cập nhật trạng thái thành công!");
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
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
                row.createAt
                    ? format(new Date(row.createAt.seconds * 1000), "dd/MM/yyyy")
                    : "N/A",
            sortable: true,
        },
        {
            name: "Tên khách hàng",
            selector: (row) => row.customerName,
            sortable: true,
        },
        {
            name: "Tổng tiền",
            selector: (row) => `${row.totalAmount}.000`, // Định dạng tiền tệ
            sortable: true,
        },
        {
            name: "Trạng thái",
            cell: (row) =>
                row.status === "Chờ xác nhận" ? (
                    <button
                        onClick={() => handleUpdateStatus(row.id, "Đã xác nhận")}
                        style={{
                            padding: "5px 10px",
                            backgroundColor: "#4CAF50",
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

    return (
        <div>
            <h2>Quản lý đơn hàng</h2>
            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <DataTable
                    title="Danh sách đơn hàng"
                    columns={columns}
                    data={orders.filter((order) => order)} // Lọc nếu cần
                    pagination
                    highlightOnHover
                />
            )}
        </div>
    );
}

export default CustomerOrders;
