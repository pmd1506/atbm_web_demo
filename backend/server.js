const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json()); 

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      
    password: 'phamminhduc2005',        
    database: 'demo_atbm_sqli',
    multipleStatements: true 
});

db.connect(err => {
    if (err) {
        console.error('Lỗi kết nối CSDL: - server.js:19', err);
        process.exit(1);
    }
    console.log('Đã kết nối thành công tới CSDL MySQL. - server.js:22');
});


// 1. API Đăng nhập (Lỗi Bypass)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    console.log("[LOG] Truy vấn Đăng nhập: - server.js:31", sql);

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu!" });
        }
    });
});

// 2. API Tra cứu hóa đơn (Lỗi Data Extraction & Stacked Queries)
app.get('/api/hoadon', (req, res) => {
    const sohd = req.query.sohd;
    const sql = `SELECT * FROM hoadon WHERE sohd = '${sohd}'`;
    
    console.log("[LOG] Truy vấn Tra cứu: - server.js:48", sql);

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message }); 
        
        const data = Array.isArray(results[0]) ? results[0] : results;
        res.json(data);
    });
});

// 3. API Lấy toàn bộ hóa đơn (Để hiển thị Dashboard)
app.get('/api/hoadon/all', (req, res) => {
    db.query('SELECT * FROM hoadon', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend Server đang chạy tại http://localhost:${PORT} - server.js:68`);
});