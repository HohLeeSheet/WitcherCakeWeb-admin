import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import './ProductManager.css';
import axios from 'axios';
function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState();
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState();
  const [imgUrl, setImgUrl] = useState('');
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
    const fetchProducts = async () => {
      const productsCollection = collection(db, 'Products');
      const productsSnapshot = await getDocs(productsCollection);
      const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Lấy tên loại sản phẩm từ reference
      const productsWithCategoryNames = await Promise.all(productsData.map(async (product) => {
        if (product.categoryID) {
          const categoryName = await fetchCategoryName(product.categoryID);
          return { ...product, categoryName };
        }
        return { ...product, categoryName: 'No Category' };
      }));

      setProducts(productsWithCategoryNames);
    };

    const fetchCategories = async () => {
      const categoryCollection = collection(db, 'Categories');
      const categorySnapshot = await getDocs(categoryCollection);
      setCategories(categorySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().title, ref: doc.ref })));
    };

    fetchProducts();
    fetchCategories();
  }, []);

  // Thêm sản phẩm
  const addProduct = async () => {
    if (title && price && categoryRef) {
      try {
        const productsCollection = collection(db, 'Products');
        // Thêm sản phẩm vào Firestore và lấy Document Reference
        const newProductRef = await addDoc(productsCollection, {
          title,
          price,
          description,
          rating,
          picUrl,
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
          categoryID: categoryRef,
          categoryName: categories.find(cat => cat.ref === categoryRef)?.name || 'No Category',
        };

        // Thêm sản phẩm vào đầu danh sách
        setProducts((prevProducts) => [newProduct, ...prevProducts]);

        // Reset các trường input
        setTitle('');
        setPrice(0);
        setDescription('');
        setRating(0);
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
      await deleteDoc(productDoc); // Xóa sản phẩm khỏi Firestore

      // Cập nhật danh sách sản phẩm (loại bỏ sản phẩm vừa xóa)
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== id));

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
    setDescription(product.description);
    setCategoryRef(product.categoryID);
  };

  // Cập nhật sản phẩm
  const updateProduct = async () => {
    if (editingId && categoryRef) {
      const productDoc = doc(db, 'Products', editingId);
      await updateDoc(productDoc, {
        title,
        price,
        description,
        rating,
        picUrl,
        categoryID: categoryRef,
      });
      setEditingId(null);
      setTitle('');
      setPrice(0);
      setDescription('');
      setRating(0);
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
    <div>
      <h2>Product Manager</h2>
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label>Title</label>
      </div>

      <div>
        <input
          type="number"
          value={price}
          onChange={(e) => {
            const value = parseFloat(e.target.value); // Chuyển đổi giá trị nhập sang số thực
            setPrice(isNaN(value) ? 0 : value); // Nếu không phải số, đặt giá trị là 0
          }}
        />
      </div>

      <div>
        <input
          type="number"
          value={rating}
          onChange={(e) => {
            const value = parseFloat(e.target.value); // Chuyển đổi giá trị nhập sang số thực
            setRating(isNaN(value) ? 0 : value); // Nếu không phải số, đặt giá trị là 0

          }}
        />
        <label>Rating</label>
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
        <label>Description</label>
      </div>

      <div>
        <div>
          <h4>Chọn ảnh từ file</h4>
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0];
              if (file) {
                const previewUrl = URL.createObjectURL(file); // Tạo URL tạm để hiển thị
                setPicUrl((prev) => [...prev, previewUrl]); // Hiển thị ảnh tạm thời

                try {
                  const uploadedUrl = await uploadToCloudinary(file); // Tải lên Cloudinary
                  if (uploadedUrl) {
                    setPicUrl((prev) =>
                      prev.map((url) => (url === previewUrl ? uploadedUrl : url))
                    ); // Thay thế URL tạm bằng URL từ Cloudinary
                  }
                } catch (error) {
                  console.error("Error uploading file:", error);
                }
              }
            }}
          />

        </div>
        <button
          onClick={() => {
            if (imgUrl.trim() !== "") { // Kiểm tra xem URL không trống
              setPicUrl([...picUrl, imgUrl]); // Thêm URL vào mảng
              setImgUrl(''); // Xóa trường nhập sau khi thêm
            }
          }}
        >
          Thêm Ảnh
        </button>
      </div>

      {/* hihihihihihihihihihiheheheheeheheheee */}
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
      {/* jhvjhvghvhgvhgvhgvhgvhgvhggfdgfcikhiv */}

      <button onClick={editingId ? updateProduct : addProduct}>
        {editingId ? "Update Product" : "Add Product"}
      </button>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            <p>Price: ${product.price}</p>
            <p>Category: {product.categoryName || 'No Category'}</p>
            <div class="img-container">
              {product.picUrl && product.picUrl.map((url, index) => (
                <img key={index} src={url} alt={`Ảnh ${index + 1}`} style={{ objectFit: 'cover', margin: '5px' }} />
              ))}
            </div>
            <button onClick={() => editProduct(product)}>Edit</button>
            <button onClick={() => deleteProduct(product.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductManager;