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
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

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

        fetchCategories(); // Gọi hàm để tải dữ liệu
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
            return null;
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddCategory = async (file) => {
        try {
            const uploadedUrl = await uploadToCloudinary(file);
            if (!uploadedUrl) return;

            const categoriesCollection = collection(db, "Categories");
            const newCategoryRef = await addDoc(categoriesCollection, {
                title,
                picUrl: uploadedUrl,  // Thay 'url' thành 'picUrl'
            });

            setCategories((prev) => [
                {
                    id: newCategoryRef.id,
                    title,
                    picUrl: uploadedUrl,  // Thay 'url' thành 'picUrl'
                },
                ...prev,
            ]);
            setTitle('');
            setPreviewUrl(null);
        } catch (error) {
            console.error("Lỗi thêm category:", error);
        }
    };

    const deleteCategory = async (id) => {
        try {
            await deleteDoc(doc(db, "Categories", id));
            setCategories((prev) => prev.filter((category) => category.id !== id));
        } catch (error) {
            console.error("Lỗi xóa category:", error);
        }
    };

    const editCategory = async (category) => {
        const newTitle = prompt("Nhập tiêu đề mới:", category.title);
        if (!newTitle) return;

        try {
            const categoryRef = doc(db, "Categories", category.id);
            await updateDoc(categoryRef, { title: newTitle });
            setCategories((prev) =>
                prev.map((cat) =>
                    cat.id === category.id ? { ...cat, title: newTitle } : cat
                )
            );
        } catch (error) {
            console.error("Lỗi sửa category:", error);
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
            {isUploading && <p>Đang tải ảnh lên...</p>}
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
