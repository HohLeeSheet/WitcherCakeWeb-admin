import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { db } from "../../firebase";
import { collection, getDocs, doc, updateDoc, getDoc  } from "firebase/firestore";
import { Route, useNavigate, Routes, BrowserRouter, Link} from "react-router-dom";
function CustomerList() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchCustomers = async () => {
        setLoading(true);
        const customerCollection = collection(db, "KhachHang");
        const customerSnapshot = await getDocs(customerCollection);
        const customerList = customerSnapshot.docs.map((doc, index) => ({
          id: doc.id,
          ...doc.data(),
          stt: index + 1,
        }));
        setLoading(false);
        setCustomers(customerList);
      };
      
      fetchCustomers();
    }, []);
    
    const columns = [
      {
        name: "Tên khách hàng",
        selector: (row) => row.tenKhachHang,
        sortable: true,
      },
      {
        name: "Email",
        selector: (row) => row.email,
        sortable: true,
      },
      {
          name: "Số điện thoại",
          selector: (row) => row.soDienThoai,
        },
        {
          name: "Đơn hàng",
          cell: (row) => (
            <div>
              <button onClick={() => navigate(`/customer/${row.id}`)}>Xem chi tiết</button>
            </div>
          ),
        },
    ];
    return (
      <div>
      <h2>Quản lý khách hàng</h2>
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <DataTable
          title="Danh sách khách hàng"
          columns={columns}
          data={customers.filter((customer) => customer)} // Chỉ hiển thị sản phẩm "visible"
          pagination
          highlightOnHover
          customStyles={{
            pagination:{
              style:{
                margin: 0 +" auto",
                width: "1500px",
                marginTop: "10px"
              }
            }
          }}
        />
      )}
    </div>
    );
  }
  
  export default CustomerList;