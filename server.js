const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const fs = require("fs");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// ============================================
// MYSQL CONNECTION POOL (Instead of single connection)
// ============================================
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
    rejectUnauthorized: false
},
    timezone: 'Asia/Karachi',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

// Test connection
db.getConnection((err, connection) => {
    if (err) {
        console.log("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Connected to Aiven MySQL");
        connection.release();
    }
});

// ============================================
// TEST ROUTE
// ============================================
app.get("/", (req, res) => {
    res.send("Backend Connected!");
});

// ============================================
// GET PRODUCTS
// ============================================
app.get("/products", (req, res) => {
    db.query("SELECT * FROM products", (err, results) => {
        if (err) {
            console.log("❌ Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// ============================================
// ADD PRODUCT
// ============================================
app.post("/products", (req, res) => {
    const { name, price, image, description, category } = req.body;

    const sql = `
        INSERT INTO products
        (name, price, image, description, category)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, price, image, description, category], (err, result) => {
        if (err) {
            console.log("❌ Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Product added successfully" });
    });
});

// ============================================
// DELETE PRODUCT
// ============================================
app.delete("/products/:id", (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM products WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.log("❌ Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Product deleted successfully" });
    });
});

// ============================================
// SAVE ORDER
// ============================================
app.post("/orders", (req, res) => {
    const { customer_name, customer_email, customer_phone, customer_address, total } = req.body;

    const sql = `
        INSERT INTO orders
        (customer_name, customer_email, customer_phone, customer_address, total)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [customer_name, customer_email, customer_phone, customer_address, total],
        (err, result) => {
            if (err) {
                console.log("❌ Error:", err.message);
                return res.status(500).json({ error: err.message });
            }
            res.json({ message: "Order saved successfully" });
        }
    );
});

// ============================================
// GET ALL ORDERS
// ============================================
app.get("/orders", (req, res) => {
    db.query("SELECT * FROM orders ORDER BY id DESC", (err, results) => {
        if (err) {
            console.log("❌ Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// ============================================
// DELETE ORDER
// ============================================
app.delete("/orders/:id", (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM orders WHERE id = ?", [id], (err, result) => {
        if (err) {
            console.log("❌ Error:", err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: "Order deleted successfully" });
    });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
