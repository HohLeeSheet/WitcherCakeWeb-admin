// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ProductManager from './components/ProductManager/ProductManager';
import BannerManager from './components/BannerManager/BannerManager';
import CatgoriesManager from './components/CategoryManager/CategoriesManager';
import logo from './img/logoCakeVip.png';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Thanh điều hướng */}
       
        <nav>
        <img class="logo" src={logo} alt="Logo" />
          <Link to="/products">
            <button class="nav-btn">Quản lý Sản phẩm</button>
          </Link>
          <Link to="/banners">
            <button class="nav-btn">Quản lý Banner</button>
          </Link>
          <Link to="/categories">
            <button class="nav-btn">Quản lý Danh Mục</button>
          </Link>
        </nav>
        

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
