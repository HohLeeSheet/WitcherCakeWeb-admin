import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import './CategoryManager.css';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import axios from "axios";

function CategoriesManager() {
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [picUrl, setPicUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesCollection = collection(db, "Categories");
      const categoriesSnapshot = await getDocs(categoriesCollection);
      const categoriesData = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoriesData);
    };

    fetchCategories();
  }, []);

  const uploadToCloudinary = async (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "withershop");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dot3j50a9/image/upload",
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Lỗi tải ảnh lên Cloudinary:", error);
      alert("Không thể tải ảnh lên. Vui lòng thử lại!");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!title || !picUrl) {
      alert("Vui lòng nhập đủ thông tin tiêu đề và ảnh!");
      return;
    }

    try {
      if (editingId) {
        // Cập nhật danh mục
        const categoryRef = doc(db, "Categories", editingId);
        await updateDoc(categoryRef, { title, picUrl });
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingId ? { ...cat, title, picUrl } : cat
          )
        );
        alert("Cập nhật danh mục thành công!");
      } else {
        // Thêm danh mục mới
        const categoriesCollection = collection(db, "Categories");
        const newCategoryRef = await addDoc(categoriesCollection, {
          title,
          picUrl,
        });
        setCategories((prev) => [
          { id: newCategoryRef.id, title, picUrl },
          ...prev,
        ]);
        alert("Thêm danh mục thành công!");
      }

      // Reset form
      setTitle('');
      setPicUrl(null);
      setPreviewUrl(null);
      setEditingId(null);
    } catch (error) {
      console.error("Lỗi lưu danh mục:", error);
      alert("Không thể lưu danh mục. Vui lòng thử lại!");
    }
  };

  const handleEditCategory = (category) => {
    setEditingId(category.id);
    setTitle(category.title);
    setPicUrl(category.picUrl);
    setPreviewUrl(category.picUrl);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, "Categories", id));
      setCategories((prev) => prev.filter((category) => category.id !== id));
      alert("Xóa danh mục thành công!");
    } catch (error) {
      console.error("Lỗi xóa danh mục:", error);
      alert("Không thể xóa danh mục. Vui lòng thử lại!");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    const uploadedUrl = await uploadToCloudinary(file);
    if (uploadedUrl) {
      setPicUrl(uploadedUrl);
    }
  };

    return (
        <div style={{marginLeft:40}}>
            <h2>
                Quản lý Danh mục
            </h2>
            <div>
                <input
                    class="tieu-de"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề"
                />
            </div>
            <div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const preview = URL.createObjectURL(file);
                            setPreviewUrl(preview);  // Hiển thị ảnh tạm thời
                            handleAddCategory(file); // Gọi hàm để thêm category với ảnh tải lên
                        }
                    }}
                />
            </div>
            {isUploading && <p>Đang tải ảnh lên....</p>}
            {previewUrl && <img src={previewUrl} alt="Ảnh tạm thời" style={{ width: "200px" }} />}
            <div class="category-container">
                {categories.map((category) => (
                    <div class="category-item" key={category.id}>
                        <h3>{category.title}</h3>
                        <img class="category-img"
                            src={category.picUrl}  
                            alt="Banner"
                            style={{ width: "200px", objectFit: "cover", margin: "5px" }}
                        />
                        <button class="category-item-btn" onClick={() => editCategory(category)}>Sửa</button>
                        <button class="category-item-btn" onClick={() => deleteCategory(category.id)}>Xóa</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CategoriesManager;
