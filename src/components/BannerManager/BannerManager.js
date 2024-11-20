import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc
} from "firebase/firestore";
import axios from "axios";

function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Tải danh sách banner từ Firestore
  useEffect(() => {
    const fetchBanners = async () => {
      const bannerCollection = collection(db, "Banner");
      const bannerSnapshot = await getDocs(bannerCollection);
      const bannerData = bannerSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBanners(bannerData);
    };

    fetchBanners();
  }, []);

  // Tải ảnh lên Cloudinary
  const uploadToCloudinary = async (file) => {
    setIsUploading(true); // Bắt đầu trạng thái loading
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
      console.error("Lỗi tải ảnh lên Cloudinary:", error.response || error);
      alert(error.response?.data?.error?.message || "Lỗi không xác định khi tải ảnh!");
      return null;
    } finally {
      setIsUploading(false); // Kết thúc trạng thái loading
    }
  };

  // Xử lý thêm banner
  const handleAddBanner = async (file) => {
    try {
      const uploadedUrl = await uploadToCloudinary(file); // Tải lên Cloudinary
      if (!uploadedUrl) return;

      // Lưu thông tin banner vào Firestore
      const bannerCollection = collection(db, "Banner");
      const newBannerRef = await addDoc(bannerCollection, { url: uploadedUrl });

      // Cập nhật danh sách banner trong giao diện
      setBanners((prevBanners) => [
        { id: newBannerRef.id, url: uploadedUrl },
        ...prevBanners,
      ]);
    } catch (error) {
      console.error("Lỗi thêm banner:", error);
      alert("Không thể thêm banner. Hãy thử lại sau!");
    }
  };

  const deleteBanner = async (id) => {
    try {
        await deleteDoc(doc(db, "Banner", id));
        setBanners((prev) => prev.filter((banner) => banner.id !== id));
    } catch (error) {
        console.error("Lỗi xóa banner:", error);
    }
};

  return (
    <div>
      <h2>Banner Manager</h2>
      <div>
        <h4>Chọn ảnh từ file</h4>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const preview = URL.createObjectURL(file);
              setPreviewUrl(preview); // Hiển thị ảnh tạm thời
              handleAddBanner(file); // Tải lên và thêm banner
            }
          }}
        />
      </div>

      {isUploading && <p>Đang tải ảnh lên...</p>}

      {previewUrl && (
        <div style={{ marginTop: "10px" }}>
          <p>Ảnh đang tải:</p>
          <img
            src={previewUrl}
            alt="Ảnh tạm thời"
            style={{ width: "200px", objectFit: "cover" }}
          />
        </div>
      )}

      <ul>
        {banners.map((banner) => (
          <li key={banner.id} style={{ margin: "10px 0" }}>
            <img
              src={banner.url}
              alt="Banner"
              style={{ width: "200px", objectFit: "cover", margin: "5px" }}
            />
            <button onClick={() => deleteBanner(banner.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BannerManager;
