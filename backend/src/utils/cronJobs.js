const cron = require("node-cron");
const db = require("../config/db");

// ✅ Auto cập nhật trạng thái đơn thuê
const autoUpdateRentalStatus = async () => {
  try {
    const now = new Date();
    const nextDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);

    const [expiredRentals] = await db.query(
      "SELECT id, motorbike_id FROM rentals WHERE status = 'ongoing' AND end_date < ?",
      [nextDayStart]
    );

    if (expiredRentals.length > 0) {
      await db.query("START TRANSACTION");
      await db.query("UPDATE rentals SET status = 'completed' WHERE status = 'ongoing' AND end_date < ?", [nextDayStart]);
      await db.query("UPDATE motorbikes SET status = 'Available' WHERE id IN (?)", [expiredRentals.map(r => r.motorbike_id)]);
      await db.query("COMMIT");
    }
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Lỗi cập nhật trạng thái tự động:", error);
  }
};

// Chạy cron job mỗi phút (nếu muốn chạy hàng ngày lúc 00:01 thì sửa lại "1 0 * * *")
cron.schedule("* * * * *", autoUpdateRentalStatus, { scheduled: true, timezone: "Asia/Ho_Chi_Minh" });
