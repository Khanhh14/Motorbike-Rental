const mysql = require("mysql2");

// Kết nối MySQL với Pooling và Promise
const db = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "14062003",
  database: process.env.DB_NAME || "motorbike_rental",
  waitForConnections: true,
  connectionLimit: 10,  
  queueLimit: 0,
}).promise(); 

db.getConnection()
  .then((connection) => {
    console.log("Kết nối MySQL thành công!");
    connection.release();
  })
  .catch((err) => {
    console.error("Kết nối MySQL thất bại:", err);
  });

module.exports = db;
