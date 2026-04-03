import React, { useState, useEffect } from 'react';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000';

function App() {
  const [isSecureMode, setIsSecureMode] = useState(false); // Nút gạt bảo mật
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [hoadons, setHoadons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sysError, setSysError] = useState('');

  const fetchHoadons = async () => {
    try {
      const res = await axios.get('/api/hoadon/all');
      setHoadons(res.data);
      setSysError('');
    } catch (err) {
      setSysError(err.response?.data?.error || 'Lỗi lấy dữ liệu');
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchHoadons();
  }, [isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    // Đổi API dựa trên nút gạt
    const endpoint = isSecureMode ? '/api/secure-login' : '/api/login';
    try {
      const res = await axios.post(endpoint, { username, password });
      if (res.data.success) {
        setIsLoggedIn(true);
        setCurrentUser(res.data.user);
      }
    } catch (err) {
      setLoginError(err.response?.data?.error || err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSysError('');
    // Đổi API dựa trên nút gạt
    const endpoint = isSecureMode ? '/api/secure-hoadon' : '/api/hoadon';
    try {
      const res = await axios.get(`${endpoint}?sohd=${searchQuery}`);
      setHoadons(res.data);
      setTimeout(() => fetchHoadons(), 1000); 
    } catch (err) {
      setSysError(err.response?.data?.error || 'Lỗi hệ thống');
    }
  };

  // Nút gạt (Toggle UI) hiển thị ở mọi nơi
  const SecurityToggle = () => (
    <div style={{ marginBottom: '20px', padding: '15px', borderRadius: '8px', backgroundColor: isSecureMode ? '#e6ffe6' : '#ffe6e6', border: `2px solid ${isSecureMode ? 'green' : 'red'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <strong>Trạng thái bảo mật (SQL Injection): </strong>
        <span style={{ color: isSecureMode ? 'green' : 'red', fontWeight: 'bold' }}>
          {isSecureMode ? 'ĐÃ BẬT (An Toàn)' : 'ĐÃ TẮT (Có Lỗ Hổng)'}
        </span>
      </div>
      <button 
        onClick={() => setIsSecureMode(!isSecureMode)}
        style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: isSecureMode ? 'red' : 'green', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}
      >
        {isSecureMode ? 'Tắt Bảo Mật' : 'Bật Bảo Mật'}
      </button>
    </div>
  );

  // MÀN HÌNH CHƯA ĐĂNG NHẬP 
  if (!isLoggedIn) {
    return (
      <div style={{ padding: '50px', maxWidth: '500px', margin: 'auto', fontFamily: 'sans-serif' }}>
        <SecurityToggle />
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
          <h2>Đăng Nhập Quản Trị</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} style={{ padding: '10px' }} />
            <input type="text" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '10px' }} />
            <button type="submit" style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#333', color: 'white', border: 'none' }}>Đăng Nhập</button>
          </form>
          {loginError && <p style={{ color: 'red', marginTop: '15px', fontWeight: 'bold' }}>{loginError}</p>}
        </div>
      </div>
    );
  }

  // MÀN HÌNH DASHBOARD
  return (
    <div style={{ padding: '50px', maxWidth: '900px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <SecurityToggle />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Hệ Thống Quản Lý Hóa Đơn</h2>
        <div>
          Xin chào, <b>{currentUser.username}</b> ({currentUser.role})
          <button onClick={() => setIsLoggedIn(false)} style={{ marginLeft: '15px', padding: '5px 10px' }}>Thoát</button>
        </div>
      </div>

      <div style={{ margin: '20px 0', backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input type="text" placeholder="Nhập mã hóa đơn cần tra cứu (VD: HD0001)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ flex: 1, padding: '10px' }} />
          <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Tìm Kiếm</button>
          <button type="button" onClick={fetchHoadons} style={{ padding: '10px 20px', cursor: 'pointer' }}>Tải Lại Bảng</button>
        </form>
        {sysError && <div style={{ backgroundColor: '#fee', color: 'red', padding: '15px', marginTop: '15px', border: '1px solid red', borderRadius: '5px' }}><b>Lỗi CSDL:</b> {sysError}</div>}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#333', color: 'white' }}>
            <th style={{ padding: '12px' }}>Số Hóa Đơn</th>
            <th style={{ padding: '12px' }}>Mã Khách Hàng / Dữ Liệu Bị Lộ</th>
            <th style={{ padding: '12px' }}>Ngày Mua</th>
          </tr>
        </thead>
        <tbody>
          {hoadons.map((hd, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ddd', backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
              <td style={{ padding: '12px' }}>{hd.sohd || hd.username || '-'}</td>
              <td style={{ padding: '12px', color: hd.password ? 'red' : 'inherit', fontWeight: hd.password ? 'bold' : 'normal' }}>
                {hd.makh || (hd.password ? `MẬT KHẨU LỘ: ${hd.password}` : '') || '-'}
              </td>
              <td style={{ padding: '12px' }}>{hd.ngaymua ? hd.ngaymua.substring(0,10) : '-'}</td>
            </tr>
          ))}
          {hoadons.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>Không có dữ liệu</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default App;