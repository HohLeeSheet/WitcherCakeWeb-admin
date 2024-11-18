import React, { useState, useEffect } from 'react';
import { db } from '../src/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import './ProductManager.css';
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
      const productsCollection = collection(db, 'Products');
      await addDoc(productsCollection, {
        title,
        price,
        description,
        rating,
        picUrl,
        categoryID: categoryRef,
      });
      setTitle('');
      setPrice(0);
      setDescription('');
      setRating(0);
      setPicUrl([]);
      setCategoryRef(null);
    }
  };

  // Xóa sản phẩm
  const deleteProduct = async (id) => {
    const productDoc = doc(db, 'Products', id);
    await deleteDoc(productDoc);
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
        <input
          type="text"
          value={imgUrl}
          onChange={(e) => setImgUrl(e.target.value)}
        />
        <label>Image URL</label>
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

      {/* Hiển thị danh sách ảnh */}
      <div style={{ marginTop: '20px' }}>
  <h3>Ảnh đã thêm:</h3>
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