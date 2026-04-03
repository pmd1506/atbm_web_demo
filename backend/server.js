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
    if (err) throw err;
    console.log('Đã kết nối thành công tới CSDL MySQL. - server.js:19');
});

// PHIÊN BẢN CÓ LỖ HỔNG (VULNERABLE)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    console.log("[LỖ HỔNG] Login SQL: - server.js:26", sql);
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length > 0) res.json({ success: true, user: results[0] });
        else res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu!" });
    });
});

app.get('/api/hoadon', (req, res) => {
    const sohd = req.query.sohd;
    const sql = `SELECT * FROM hoadon WHERE sohd = '${sohd}'`;
    console.log("[LỖ HỔNG] Tra cứu SQL: - server.js:37", sql);
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message }); 
        const data = Array.isArray(results[0]) ? results[0] : results;
        res.json(data);
    });
});

// PHIÊN BẢN AN TOÀN (SECURE)
app.post('/api/secure-login', (req, res) => {
    const { username, password } = req.body;
    // GIẢI PHÁP: Dùng dấu ? làm tham số (Prepared Statement)
    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    console.log("[AN TOÀN] Login SQL: - server.js:50", sql, "| Tham số:", [username, password]);
    
    // Dùng db.execute thay vì db.query
    db.execute(sql, [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: "Đã xảy ra lỗi hệ thống!" }); 
        if (results.length > 0) res.json({ success: true, user: results[0] });
        else res.status(401).json({ success: false, message: "Sai tài khoản hoặc mật khẩu!" });
    });
});

app.get('/api/secure-hoadon', (req, res) => {
    const sohd = req.query.sohd;
    const sql = `SELECT * FROM hoadon WHERE sohd = ?`;
    console.log("[AN TOÀN] Tra cứu SQL: - server.js:63", sql, "| Tham số:", [sohd]);

    db.execute(sql, [sohd], (err, results) => {
        if (err) return res.status(500).json({ error: "Đã xảy ra lỗi hệ thống!" });
        res.json(results);
    });
});

// API Lấy toàn bộ hóa đơn (Dùng chung)
app.get('/api/hoadon/all', (req, res) => {
    db.query('SELECT * FROM hoadon', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend Server đang chạy tại http://localhost:${PORT} - server.js:81`);
});