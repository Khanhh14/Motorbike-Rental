const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "14062003",
  database: process.env.DB_NAME || "motorbike_rental",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error("Lỗi kết nối MySQL:", err);
    return;
  }
  connection.release();
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public/uploads/");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const getAllMotorbikes = (req, res) => {
  const { search, role } = req.query;
  let query = "SELECT * FROM motorbikes";

  if (role !== "admin") {
    query += " WHERE status = 'available'";
  }

  if (search) {
    const searchCondition = `brand LIKE '%${search}%' OR model LIKE '%${search}%' OR license_plate LIKE '%${search}%'`;
    query += role !== "admin" ? ` AND (${searchCondition})` : ` WHERE ${searchCondition}`;
  }

  pool.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi truy vấn CSDL" });
    }

    const updatedResults = results.map((bike) => ({
      ...bike,
      image_url: bike.image_url ? `http://localhost:5000/uploads/${bike.image_url}` : null,
    }));

    res.json(updatedResults);
  });
};

const getMotorbikeById = (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM motorbikes WHERE id = ?";

  pool.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi truy vấn CSDL" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy xe" });
    }

    let motorbike = results[0];
    if (motorbike.image_url) {
      motorbike.image_url = `http://localhost:5000/uploads/${motorbike.image_url}`;
    }

    res.json(motorbike);
  });
};

const addMotorbike = (req, res) => {
  const {
    brand,
    model,
    vehicle_type_id,
    description,
    year,
    license_plate,
    price_per_day,
    status,
  } = req.body;
  const image_url = req.file ? req.file.filename : null;

  if (
    !brand ||
    !model ||
    !vehicle_type_id ||
    !year ||
    !license_plate ||
    !price_per_day ||
    !status ||
    !image_url
  ) {
    return res.status(400).json({ error: "Thiếu thông tin xe" });
  }

  const query =
    "INSERT INTO motorbikes (brand, model, vehicle_type_id, description, year, license_plate, price_per_day, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

  pool.query(
    query,
    [
      brand,
      model,
      vehicle_type_id,
      description,
      year,
      license_plate,
      price_per_day,
      status,
      image_url,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Lỗi khi thêm xe vào CSDL" });
      }
      // Tăng số lượng loại xe sau khi thêm thành công
      pool.query(
        "UPDATE vehicletypes SET Quantity = Quantity + 1 WHERE ID = ?",
        [vehicle_type_id],
        (err2) => {
          if (err2) {
            return res.status(500).json({ error: "Lỗi khi cập nhật số lượng loại xe" });
          }
          res.json({
            message: "Xe đã được thêm thành công!",
            motorbikeId: result.insertId,
          });
        }
      );
    }
  );
};

exports.createMotorbike = async (req, res) => {
  try {
    const { vehicle_type_id, ...otherFields } = req.body;

    // Thêm xe vào bảng motorbikes
    // await db.query("INSERT INTO motorbikes ...", ...);

    // Sau khi thêm xe thành công, tăng số lượng loại xe
    await db.query(
      "UPDATE vehicletypes SET Quantity = Quantity + 1 WHERE ID = ?",
      [vehicle_type_id]
    );

    res.status(201).json({ message: "Thêm xe thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error });
  }
};

const updateMotorbike = async (req, res) => {
  const { id } = req.params;
  const {
    brand,
    model,
    vehicle_type_id: newTypeId,
    description,
    year,
    license_plate,
    price_per_day,
    status,
  } = req.body;

  const newImage = req.file ? req.file.filename : null;

  try {
    const connection = await pool.promise().getConnection();

    try {
      // Lấy thông tin xe hiện tại (bao gồm image_url và vehicle_type_id)
      const [rows] = await connection.query("SELECT image_url, vehicle_type_id FROM motorbikes WHERE id = ?", [id]);
      if (rows.length === 0) {
        connection.release();
        return res.status(404).json({ error: "Không tìm thấy xe để cập nhật" });
      }

      const oldImage = rows[0].image_url;
      const oldTypeId = rows[0].vehicle_type_id;
      const finalImage = newImage || oldImage;

      // Cập nhật xe
      await connection.query(
        `UPDATE motorbikes 
         SET brand=?, model=?, vehicle_type_id=?, description=?, year=?, license_plate=?, 
             price_per_day=?, status=?, image_url=? 
         WHERE id=?`,
        [
          brand,
          model,
          newTypeId,
          description,
          year,
          license_plate,
          price_per_day,
          status,
          finalImage,
          id,
        ]
      );

      // Nếu loại xe đã bị thay đổi => cập nhật lại số lượng
      if (oldTypeId !== Number(newTypeId)) {
        // Giảm loại xe cũ
        await connection.query(
          "UPDATE vehicletypes SET Quantity = GREATEST(Quantity - 1, 0) WHERE ID = ?",
          [oldTypeId]
        );
        // Tăng loại xe mới
        await connection.query(
          "UPDATE vehicletypes SET Quantity = Quantity + 1 WHERE ID = ?",
          [newTypeId]
        );
      }

      res.json({ message: "Cập nhật xe thành công!" });
    } catch (err) {
      console.error("Lỗi khi cập nhật xe:", err);
      res.status(500).json({ error: "Lỗi khi cập nhật xe" });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Lỗi kết nối CSDL:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

const deleteMotorbike = (req, res) => {
  const { id } = req.params;

  // Bước 1: Lấy xe để biết vehicle_type_id
  const checkQuery = "SELECT * FROM motorbikes WHERE id = ?";
  pool.query(checkQuery, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi kiểm tra xe" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy xe cần xóa" });
    }

    const vehicle_type_id = results[0].vehicle_type_id;

    // Bước 2: Xóa xe
    const deleteQuery = "DELETE FROM motorbikes WHERE id = ?";
    pool.query(deleteQuery, [id], (deleteErr) => {
      if (deleteErr) {
        return res.status(500).json({ error: "Lỗi khi xóa xe" });
      }

      // Bước 3: Giảm số lượng loại xe
      pool.query(
        "UPDATE vehicletypes SET Quantity = GREATEST(Quantity - 1, 0) WHERE ID = ?",
        [vehicle_type_id],
        (updateErr) => {
          if (updateErr) {
            return res.status(500).json({ error: "Đã xóa xe, nhưng lỗi khi cập nhật số lượng loại xe" });
          }

          res.json({ message: "Xe đã được xóa và cập nhật số lượng thành công!" });
        }
      );
    });
  });
};

module.exports = {
  getAllMotorbikes,
  getMotorbikeById,
  addMotorbike,
  updateMotorbike,
  deleteMotorbike,
  upload,
};
