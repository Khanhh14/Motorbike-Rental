const db = require("../config/db");

// Lấy tất cả loại xe
exports.getAllVehicleTypes = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM vehicletypes");
    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Tạo loại xe mới
exports.createVehicleType = async (req, res) => {
  const { typeName, quantity, description } = req.body;

  try {
    await db.query(
      "INSERT INTO vehicletypes (TypeName, Quantity, Description) VALUES (?, ?, ?)",
      [typeName, quantity, description]
    );
    res.status(201).json({ message: "Tạo loại xe thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Cập nhật loại xe
exports.updateVehicleType = async (req, res) => {
  const { id } = req.params;
  const { typeName, quantity, description } = req.body;

  try {
    await db.query(
      "UPDATE vehicletypes SET TypeName = ?, Quantity = ?, Description = ? WHERE ID = ?",
      [typeName, quantity, description, id]
    );
    res.status(200).json({ message: "Cập nhật loại xe thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

// Xóa loại xe
exports.deleteVehicleType = async (req, res) => {
  const { id } = req.params;

  try {
    // Kiểm tra có xe nào thuộc loại này không
    const [motorbikes] = await db.query("SELECT COUNT(*) AS count FROM motorbikes WHERE vehicle_type_id = ?", [id]);

    if (motorbikes[0].count > 0) {
      return res.status(400).json({
        message: "Không thể xóa loại xe vì vẫn còn xe thuộc loại này!",
      });
    }

    // Nếu không có, thì xóa
    await db.query("DELETE FROM vehicletypes WHERE ID = ?", [id]);
    res.status(200).json({ message: "Xóa loại xe thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

