// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ProductManager from './components/ProductManager/ProductManager';
import BannerManager from './components/BannerManager/BannerManager';
import CatgoriesManager from './components/CategoryManager/CategoriesManager';
import ProductManagerTest from './components/ProductsManagerTest/ProductsManagerTest';
import ProductDetail from './components/ProductsManagerTest/ProductDetail';
import CustomerManager from './components/CustomerManager/CustomerManager';
import CustomerOrder from './components/CustomerManager/OrderManager';
import PendingOrder from './components/CustomerManager/PendingOrder';
import Admin from './components/Admin/Admin';
import logo from './img/logoCakeVip.png';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Thanh điều hướng */}
       
        <nav>
        <img class="logo" src={logo} alt="Logo" />
          <Link to="/products">
          </Link>
          <Link to="/productsTest">
            <button class="nav-btn">Quản Lý Sản Phẩm</button>
          </Link>
          <Link to="/categories">
            <button class="nav-btn">Quản lý Danh Mục</button>
          </Link>
          <Link to="/banners">
            <button class="nav-btn">Quản lý Banner</button>
          </Link>
          <Link to="/customers">
            <button class="nav-btn">Khách Hàng</button>
          </Link>
          <Link to="/pending">
            <button class="nav-btn">Đơn Hàng Cần Xác Nhận</button>
          </Link>
        </nav>
        

        {/* Phần định tuyến */}
        <Routes>
          {/* Định tuyến mặc định */}
          <Route path="/" element={<Admin />} />
          {/* Các phần đính tuyến khác */}
          <Route path="/products" element={<PrivateRoute><ProductManager /></PrivateRoute>} />
          <Route path="/banners" element={<PrivateRoute><BannerManager /></PrivateRoute>} />
          <Route path="/categories" element={<PrivateRoute><CatgoriesManager /></PrivateRoute>} />
          <Route path="/productsTest" element={<PrivateRoute><ProductManagerTest /></PrivateRoute>} />
          <Route path="/product/:id" element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
          <Route path="/customers" element={<PrivateRoute><CustomerManager/></PrivateRoute>} />
          <Route path="/customer/:customerId" element={<PrivateRoute><CustomerOrder/></PrivateRoute>} />
          <Route path="/orders" element={<PrivateRoute><CustomerOrder/></PrivateRoute>} />
          <Route path="/pending" element={<PrivateRoute><PendingOrder/></PrivateRoute>} />
          <Route path="/login" element={<Admin/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
