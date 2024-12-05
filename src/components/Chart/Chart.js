import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function RevenueManagement() {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        const ordersCollection = collection(db, "KhachHang");
        const customersSnapshot = await getDocs(ordersCollection);

        const monthlyRevenue = {};

        await Promise.all(
          customersSnapshot.docs.map(async (customerDoc) => {
            const customerId = customerDoc.id;
            const ordersRef = collection(db, "KhachHang", customerId, "Orders");
            const orderQuery = query(
              ordersRef,
              where("status", "==", "Đã xác nhận")
            );
            const ordersSnapshot = await getDocs(orderQuery);

            ordersSnapshot.docs.forEach((orderDoc) => {
              const orderData = orderDoc.data();
              const orderDate = orderData.createdAt?.seconds;
              const totalAmount = orderData.totalAmount || 0;

              if (orderDate) {
                const date = new Date(orderDate * 1000);
                const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;

                if (!monthlyRevenue[monthYear]) {
                  monthlyRevenue[monthYear] = { revenue: 0, orderCount: 0 };
                }
                monthlyRevenue[monthYear].revenue += totalAmount * 1000; // Nhân lên 1000
                monthlyRevenue[monthYear].orderCount += 1;
              }
            });
          })
        );

        const revenueArray = Object.entries(monthlyRevenue).map(
          ([monthYear, data]) => ({
            monthYear,
            revenue: data.revenue,
            orderCount: data.orderCount,
          })
        );

        setRevenueData(revenueArray);
      } catch (err) {
        setError("Lỗi khi tải dữ liệu. Vui lòng thử lại!");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>{error}</p>;

  // Sắp xếp dữ liệu theo thứ tự thời gian
  const chartData = revenueData
    .map((item) => ({
      x: item.monthYear,
      revenue: item.revenue,
      orderCount: item.orderCount,
    }))
    .sort((a, b) => {
      const [monthA, yearA] = a.x.split("-").map(Number);
      const [monthB, yearB] = b.x.split("-").map(Number);

      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

  // Tính toán dữ liệu tổng hợp
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = chartData.reduce((sum, item) => sum + item.orderCount, 0);
  const averageRevenue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const bestMonth = chartData.reduce(
    (max, item) => (item.revenue > max.revenue ? item : max),
    { revenue: 0 }
  );

  return (
    <div style={{fontFamily: "Arial, sans-serif", boxSizing:"border-box" }}>
      <h2 style={{ textAlign: "center", color: "#333", paddingTop:"20px" }}>Thống kê Doanh thu</h2>

      {/* Hiển thị biểu đồ */}
      <div
        style={{
          width: "100%",
          height: "400px",
          margin: "20px auto",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          borderRadius: "8px",
          padding: "20px",
        }}
      >
        <ResponsiveContainer  style={{
              width:"100%",
              height:"100%"
            }}>
          <LineChart data={chartData}
          style={{
            height:"95%"
          }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis  dataKey="x"/>
            <YAxis 
              tickFormatter={(value) =>
                new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(value)
              }
              style={{
                marginTop:"100px"
              }}
            />
            <Tooltip
             
              formatter={(value) =>
                new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(value)
              }
              
              
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
            <Line type="monotone" dataKey="orderCount" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Hiển thị thông tin tổng hợp dưới dạng chữ */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          backgroundColor: "#f9f9f9",
          borderRadius: "8px",
          lineHeight: "1.8",
          width:"100%"
        }}
      >
        <h3 style={{ color: "#555" }}>Thông tin tổng hợp</h3>
        <p>
          <strong>Tổng doanh thu:</strong>{" "}
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(totalRevenue)}
        </p>
        <p>
          <strong>Tổng số đơn hàng:</strong> {totalOrders}
        </p>
        <p>
          <strong>Doanh thu trung bình mỗi đơn:</strong>{" "}
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(averageRevenue)}
        </p>
        <p>
          <strong>Tháng có doanh thu cao nhất:</strong>{" "}
          {bestMonth.x || "Không có"} với{" "}
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(bestMonth.revenue)}
        </p>
      </div>
    </div>
  );
}

export default RevenueManagement;
