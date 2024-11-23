// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ProductManager from './components/ProductManager/ProductManager';
import BannerManager from './components/BannerManager/BannerManager';
import CatgoriesManager from './components/CategoryManager/CategoriesManager';
import logo from './img/logone.jpg';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Thanh điều hướng */}
        <nav>
          <Link to="/products">
            <button>Quản lý Sản phẩm</button>
          </Link>
          <Link to="/banners">
            <button>Quản lý Banner</button>
          </Link>
          <Link to="/categories">
            <button>Quản lý Danh Mục</button>
          </Link>
        </nav>
        {/* <h1>Welcome Admin!</h1>
        <img src={logo} alt="Logo" /> */}

        {/* Phần định tuyến */}
        <Routes>
          <Route path="/products" element={<ProductManager />} />
          <Route path="/banners" element={<BannerManager />} />
          <Route path="/categories" element={<CatgoriesManager />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
