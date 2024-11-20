// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ProductManager from './components/ProductManager/ProductManager';
import BannerManager from './components/BannerManager/BannerManager';
import CatgoriesManager from './components/CategoryManager/CategoriesManager';
function App() {
  return (
    <Router>
      <div className="App">
        {/* Thanh điều hướng */}
        <nav>
          <button>
            <Link to="/products">Quản lý Sản phẩm</Link>
          </button>
          <button>
            <Link to="/banners">Quản lý Banner</Link>
          </button>
          <button>
            <Link to="/categories">Quản lý Danh Mục</Link>
          </button>
        </nav>

        {/* Phần định tuyến */}
        <Routes>
          <Route path="/products" element={<ProductManager/>} />
          <Route path="/banners" element={<BannerManager/>} />
          <Route path="/categories" element={<CatgoriesManager/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
