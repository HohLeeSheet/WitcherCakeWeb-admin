import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import '../ProductManager/ProductManager.css';
import { useParams, useNavigate } from "react-router-dom";
import axios from 'axios';
function ProductManager() {
  const { id } = useParams(); // Lấy ID sản phẩm từ UR

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState();
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState();
  const [picUrl, setPicUrl] = useState([]);
  const [categoryRef, setCategoryRef] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Hàm để lấy tên loại sản phẩm từ `reference`
  const fetchCategoryName = async (categoryRef) => {
    const categoryDoc = await getDoc(categoryRef);
    return categoryDoc.exists() ? categoryDoc.data().title : 'Unknown Category';
  };


  // Lấy dữ liệu sản phẩm từ Firestore
  useEffect(() => {
    const fetchProductById = async () => {
      try {
        if (id) { // Chỉ thực thi nếu `id` tồn tại
          const productDoc = doc(db, 'Products', id);
          const productSnapshot = await getDoc(productDoc);
  
          if (productSnapshot.exists()) {
            const productData = productSnapshot.data();
  
            // Nếu sản phẩm có categoryID, fetch tên danh mục
            let categoryName = 'No Category';
            if (productData.categoryID) {
              categoryName = await fetchCategoryName(productData.categoryID);
            }
  
            // Định dạng dữ liệu sản phẩm
            const productWithCategory = {
              id: productSnapshot.id,
              ...productData,
              categoryName,
            };
  
            setProducts([productWithCategory]); // Chỉ lưu sản phẩm này
          } else {
            console.error("Sản phẩm không tồn tại!");
            setProducts([]); // Không có sản phẩm
          }
        }
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };
  
    fetchProductById();
  }, [id]);

  // Thêm sản phẩm
  const addProduct = async () => {
    if (title && price && categoryRef) {
      try {
        const productsCollection = collection(db, 'Products');
        const time = new Date();
        // Thêm sản phẩm vào Firestore và lấy Document Reference
        const newProductRef = await addDoc(productsCollection, {
          title,
          price,
          description,
          rating,
          picUrl,
          invisible: false,
          createAt: time.getTime(),
          categoryID: categoryRef,
        });

        // Tạo đối tượng sản phẩm mới
        const newProduct = {
          id: newProductRef.id,
          title,
          price,
          description,
          rating,
          picUrl,
          invisible: false,
          createAt: time.getTime(),
          categoryID: categoryRef,
          categoryName: categories.find(cat => cat.ref === categoryRef)?.name || 'No Category',
        };

        // Thêm sản phẩm vào đầu danh sách
        setProducts((prevProducts) => [newProduct, ...prevProducts]);

        // Reset các trường input
        setTitle('');
        setPrice();
        setDescription('');
        setRating();
        setPicUrl([]);
        setCategoryRef(null);
      } catch (error) {
        console.error('Lỗi khi thêm sản phẩm:', error);
        alert('Không thể thêm sản phẩm. Vui lòng thử lại!');
      }
    } else {
      alert('Vui lòng nhập đủ thông tin sản phẩm và chọn danh mục!');
    }
  };


  // Xóa sản phẩm
  const deleteProduct = async (id) => {
    try {
      const productDoc = doc(db, 'Products', id);
      await updateDoc(productDoc, { invisible: true }); // Cập nhật trạng thái "invisible" trong Firestore
      setProducts((prevProducts) => prevProducts.map((product) =>
        product.id === id ? { ...product, invisible: true } : product
      ));
      alert('Xóa sản phẩm thành công!');
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      alert('Không thể xóa sản phẩm. Vui lòng thử lại!');
    }
  };


  // Chỉnh sửa sản phẩm
  const editProduct = (product) => {
    setEditingId(product.id);
    setTitle(product.title);
    setPrice(product.price);
    setRating(product.rating);
    setDescription(product.description);
    setCategoryRef(product.categoryID);
    setPicUrl(product.picUrl);
  };

  // Cập nhật sản phẩm
  const updateProduct = async () => {
    if (editingId && categoryRef) {
      const productDoc = doc(db, 'Products', editingId);
      const time = new Date();
      await updateDoc(productDoc, {
        title,
        price,
        description,
        rating,
        picUrl,
        createAt: time.getTime(),
        categoryID: categoryRef,
      });
      setEditingId(null);
      setTitle('');
      setPrice();
      setDescription('');
      setRating();
      setPicUrl([]);
      setCategoryRef(null);
    }
  };

  const uploadToCloudinary = async (file) => {
    setIsUploading(true); // Bắt đầu trạng thái loading
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "withershop");

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/dot3j50a9/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Lỗi tải ảnh lên Cloudinary:", error.response || error);
      alert(error.response?.data?.error?.message || "Lỗi không xác định khi tải ảnh!");
      return null;
    }
    finally {
      setIsUploading(false); // Kết thúc trạng thái loading
    }
  };

  return (
    <div style={{marginLeft:40}}>
      <h2>Quản lý Sản phẩm</h2>
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label>Tên sản phẩm</label>
      </div>

      <div>
        <input
          type="number"
          value={price}
          onChange={(e) => {
            const value = parseFloat(e.target.value); // Chuyển đổi giá trị nhập sang số thực
            setPrice(isNaN(value) ? null : value); // Nếu không phải số, đặt giá trị là 0
          }}
        />
        <label>Giá</label>
      </div>

      <div>
        <input
          type="number"
          value={rating}
          onChange={(e) => {
            const value = parseFloat(e.target.value); // Chuyển đổi giá trị nhập sang số thực
            setRating(isNaN(value) ? null : value); // Nếu không phải số, đặt giá trị là 0

          }}
        />
        <label>Đánh giá</label>
      </div>

      <div>
        <select
          value={categoryRef?.id || ''} // Nếu có categoryRef, lấy id làm giá trị của select, nếu không, chọn giá trị rỗng
          onChange={(e) => {
            const selectedCategory = categories.find(cat => cat.id === e.target.value);
            setCategoryRef(selectedCategory ? selectedCategory.ref : null); // Cập nhật categoryRef với tham chiếu của danh mục
          }}
        >
          <option value="">Chọn loại sản phẩm</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name} {/* Hiển thị tên danh mục */}
            </option>
          ))}
        </select>

      </div>

      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        >
        </textarea>
        <label>Mô tả</label>
      </div>

      <div>
        <div>
          {isUploading ? (
            <p>Đang tải ảnh lên...</p>
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  const previewUrl = URL.createObjectURL(file); // Tạo URL tạm để hiển thị
                  setPicUrl((prev) => [...prev, previewUrl]); // Thêm URL tạm

                  try {
                    const uploadedUrl = await uploadToCloudinary(file); // Tải lên Cloudinary
                    if (uploadedUrl) {
                      // Thay URL tạm bằng URL thực
                      setPicUrl((prev) =>
                        prev.map((url) => (url === previewUrl ? uploadedUrl : url))
                      );
                    }
                  } catch (error) {
                    console.error("Error uploading file:", error);
                  }
                }
              }}
            />

          )}
        </div>
      </div>

      {/* Hiển thị danh sách ảnh */}
      <div style={{ marginTop: '20px' }}>
        <div className="newProduct-img-container">
          {picUrl.map((url, index) => (
            <div key={index} style={{ position: 'relative' }}>
              <button
                className="btnDelete"
                onClick={() => setPicUrl(picUrl.filter((_, i) => i !== index))}
              >
                x
              </button>
              <img
                className="newProduct-img"
                src={url}
                alt={`Ảnh ${index + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      <button onClick={editingId ? updateProduct : addProduct}>
        {editingId ? "Update Product" : "Add Product"}
      </button>

      <ul>
  {products
    .slice() // Tạo một bản sao để tránh thay đổi mảng gốc
    .sort((a, b) => new Date(b.createAt) - new Date(a.createAt)) // Sắp xếp giảm dần theo thời gian
    .map((product) =>
      !product.invisible ? (
        <li key={product.id}>
          <h3>{product.title}</h3>
          <p>{product.description}</p>
          <p>Price: {product.price}.000đ</p>
          <p>Category: {product.categoryName || 'No Category'}</p>
          <div className="img-container">
            {product.picUrl &&
              product.picUrl.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Ảnh ${index + 1}`}
                  style={{ objectFit: 'cover', margin: '5px' }}
                />
              ))}
          </div>
          <button onClick={() => editProduct(product)}>Edit</button>
          <button onClick={() => deleteProduct(product.id)}>Delete</button>
        </li>
      ) : null
    )}
</ul>

    </div>
  );
}

export default ProductManager;