import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Cấu hình URL mặc định cho Backend
axios.defaults.baseURL = 'http://localhost:3000';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // State cho Login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // State cho Dashboard
  const [hoadons, setHoadons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sysError, setSysError] = useState('');

  // Lấy dữ liệu hóa đơn
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

  // Xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/login', { username, password });
      if (res.data.success) {
        setIsLoggedIn(true);
        setCurrentUser(res.data.user);
      }
    } catch (err) {
      setLoginError(err.response?.data?.error || 'Đăng nhập thất bại');
    }
  };

  // Xử lý Tra cứu (Nơi thực hiện các đòn tấn công Search, Insert, Update, Delete)
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`/api/hoadon?sohd=${searchQuery}`);
      setHoadons(res.data);
      setSysError('');
      setTimeout(() => fetchHoadons(), 1000); 
    } catch (err) {
      setSysError(err.response?.data?.error || 'Lỗi truy vấn SQL');
    }
  };

  // GIAO DIỆN CHƯA ĐĂNG NHẬP 
  if (!isLoggedIn) {
    return (
      <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto', fontFamily: 'sans-serif' }}>
        <h2>Đăng Nhập Quản Trị</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Tên đăng nhập" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            style={{ padding: '8px' }}
          />
          <input 
            type="text" 
            placeholder="Mật khẩu" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ padding: '8px' }}
          />
          <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Đăng Nhập</button>
        </form>
        {loginError && <p style={{ color: 'red', wordBreak: 'break-all' }}>{loginError}</p>}
      </div>
    );
  }

  // GIAO DIỆN ĐÃ ĐĂNG NHẬP (DASHBOARD) 
  return (
    <div style={{ padding: '50px', maxWidth: '800px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Hệ Thống Quản Lý Hóa Đơn</h2>
        <div>
          Xin chào, <b>{currentUser.username}</b> ({currentUser.role})
          <button onClick={() => setIsLoggedIn(false)} style={{ marginLeft: '10px' }}>Thoát</button>
        </div>
      </div>

      <hr />

      <div style={{ margin: '20px 0' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="Nhập số hóa đơn để tra cứu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '8px' }}
          />
          <button type="submit" style={{ padding: '8px 15px' }}>Tìm Kiếm</button>
          <button type="button" onClick={fetchHoadons} style={{ padding: '8px 15px' }}>Tải Lại</button>
        </form>
        {sysError && <div style={{ backgroundColor: '#fee', color: 'red', padding: '10px', marginTop: '10px', border: '1px solid red' }}><b>Lỗi SQL:</b> {sysError}</div>}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Số Hóa Đơn</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Mã Khách Hàng / Dữ Liệu Ẩn</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Ngày Mua</th>
          </tr>
        </thead>
        <tbody>
          {hoadons.map((hd, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{hd.sohd || hd.username || '-'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{hd.makh || hd.password || hd.role || '-'}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{hd.ngaymua ? hd.ngaymua.substring(0,10) : '-'}</td>
            </tr>
          ))}
          {hoadons.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', padding: '10px' }}>Không có dữ liệu</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default App;