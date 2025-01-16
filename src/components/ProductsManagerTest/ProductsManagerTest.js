import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { db } from "../../firebase";
import { collection, getDocs, doc, updateDoc, getDoc  } from "firebase/firestore";
import { Route, useNavigate, Routes, Link} from "react-router-dom";
const ProductManager = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
  
    // Hàm để lấy tên loại sản phẩm từ `reference`
    const fetchCategoryName = async (categoryRef) => {
      const categoryDoc = await getDoc(categoryRef);
      return categoryDoc.exists() ? categoryDoc.data().title : 'Unknown Category';
    };
    // Lấy dữ liệu sản phẩm từ Firestore
    useEffect(() => {
        const fetchProducts = async () => {
          setLoading(true); // Bắt đầu tải dữ liệu
          const productsCollection = collection(db, "Products");
          const productsSnapshot = await getDocs(productsCollection);
          const productsData = productsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
      
          const productsWithCategoryNames = await Promise.all(
            productsData.map(async (product) => {
              if (product.categoryID) {
                const categoryName = await fetchCategoryName(product.categoryID);
                return { ...product, categoryName };
              }
              return { ...product, categoryName: "No Category" };
            })
          );
      
          setProducts(productsWithCategoryNames);
          setLoading(false); // Kết thúc tải dữ liệu
        };
      
        const fetchCategories = async () => {
          const categoryCollection = collection(db, "Categories");
          const categorySnapshot = await getDocs(categoryCollection);
          setCategories(
            categorySnapshot.docs.map((doc) => ({
              id: doc.id,
              name: doc.data().title,
              ref: doc.ref,
            }))
          );
        };
      
        fetchProducts();
        fetchCategories();
      }, []);
      

  // Xóa sản phẩm (ẩn sản phẩm)
  const deleteProduct = async (id) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?");
    if (!confirmDelete) return;

    const productDoc = doc(db, "Products", id);
    await updateDoc(productDoc, { invisible: true }); // Đánh dấu "invisible" là true
    setProducts((prev) => prev.filter((product) => product.id !== id)); // Cập nhật UI
  };

  // Cột hiển thị của bảng
  const columns = [
    {
      name: "Ảnh",
      selector: (row) => (
        <img
          src={row.picUrl[0]} // Sử dụng liên kết từ Cloudinary
          alt="Ảnh sản phẩm"
          style={{ width: "50px", height: "50px", objectFit: "cover" }} // Thiết lập kích thước ảnh
        />
      ),
      sortable: false, // Vô hiệu hóa sắp xếp vì ảnh không thể so sánh trực tiếp
    },,
    {
      name: "Tên sản phẩm",
      selector: (row) => row.title,
      sortable: true,
    },
    {
      name: "Giá (VNĐ)",
      selector: (row) => row.price + ".000",
      sortable: true,
    },
    {
        name: "Danh mục",
        selector: (row) => row.categoryName || "Không có danh mục",
      },
      {
        name: "Ngày thêm",
        selector: (row) =>
          new Date(row.createAt).toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }), // Chuyển timestamp thành định dạng ngày giờ
        sortable: true, // Cho phép sắp xếp theo ngày
      },
    {
      name: "Hành động",
      cell: (row) => (
        <div>
          <button onClick={() => navigate(`/product/${row.id}`)}>Xem chi tiết</button>
          <button onClick={() => deleteProduct(row.id)}>Xóa</button>
        </div>
      ),
    },
  ];

  return (
    <div style={{marginLeft:40}}>
      <h2>Quản lý Sản phẩm</h2>
      <Routes>
          <Route path="/products" element={<ProductManager />} />
        </Routes>
      <Link to="/products">
        <button>Thêm sản phẩm</button>
      </Link>
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <DataTable
          title="Danh sách sản phẩm"
          columns={columns}
          data={products.filter((product) => !product.invisible)} // Chỉ hiển thị sản phẩm "visible"
          pagination
          highlightOnHover
          paginationComponentOptions={{
            noRowsPerPage: true, 
          }}
          customStyles={{
            pagination:{
              style:{
                marginTop: "10px",
                display: "block",
                textAlign:"center"
              }
            }
          }}
        />
      )}
    </div>
  );
};

export default ProductManager;
