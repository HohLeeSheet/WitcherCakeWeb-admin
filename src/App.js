// App.js
import React, { useState } from 'react';
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
import Chart from './components/Chart/Chart';
import './App.css';




function App() {
  const [activeButton, setActiveButton] = useState(null); 

  const handleButtonClick = (button) => {
    setActiveButton(button); 
  };
  return (
    <Router>
      <div className="App">
        {/* Thanh điều hướng */}
        <nav id="nav">
          <img className="logo" src={logo} alt="Logo" />
          <Link to="/productsTest">
            <button
              className={`nav-btn ${activeButton === 'products' ? 'active' : ''}`}
              onClick={() => handleButtonClick('products')}
            >
              Quản Lý Sản Phẩm
            </button>
          </Link>
          <Link to="/categories">
            <button
              className={`nav-btn ${activeButton === 'categories' ? 'active' : ''}`}
              onClick={() => handleButtonClick('categories')}
            >
              Quản lý Danh Mục
            </button>
          </Link>
          <Link to="/banners">
            <button
              className={`nav-btn ${activeButton === 'banners' ? 'active' : ''}`}
              onClick={() => handleButtonClick('banners')}
            >
              Quản lý Banner
            </button>
          </Link>
          <Link to="/customers">
            <button
              className={`nav-btn ${activeButton === 'customers' ? 'active' : ''}`}
              onClick={() => handleButtonClick('customers')}
            >
              Quản lý Khách Hàng
            </button>
          </Link>
          <Link to="/pending">
            <button
              className={`nav-btn ${activeButton === 'pending' ? 'active' : ''}`}
              onClick={() => handleButtonClick('pending')}
            >
              Quản lý Đơn hàng
            </button>
          </Link>
          <Link to="/chart">
            <button
              className={`nav-btn ${activeButton === 'chart' ? 'active' : ''}`}
              onClick={() => handleButtonClick('chart')}
            >
              Thống Kê
            </button>
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
          <Route path="/chart" element={<Chart/>} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
