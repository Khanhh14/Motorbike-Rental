const db = require("../config/db");

exports.getSummary = async (req, res) => {
  const [[rentalStats]] = await db.query(`SELECT COUNT(*) AS total_rentals FROM rentals`);
  const [[revenueStats]] = await db.query(`SELECT SUM(amount) AS total_revenue FROM payments WHERE status = 'completed'`);
  const [[userStats]] = await db.query(`SELECT COUNT(*) AS total_users FROM users WHERE role = 'customer'`);

  res.json({
    total_rentals: rentalStats.total_rentals,
    total_revenue: revenueStats.total_revenue || 0,
    total_users: userStats.total_users
  });
};

exports.getRevenueByMonth = async (req, res) => {
  const [rows] = await db.query(`
    SELECT DATE_FORMAT(paid_at, '%Y-%m') AS month, SUM(amount) AS total_revenue
    FROM payments
    WHERE status = 'completed'
    GROUP BY month
    ORDER BY month
  `);
  res.json(rows);
};

exports.getRentalsByMonth = async (req, res) => {
  const [rows] = await db.query(`
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS total_rentals
    FROM rentals
    GROUP BY month
    ORDER BY month
  `);
  res.json(rows);
};

exports.getTopMotorbikes = async (req, res) => {
  const [rows] = await db.query(`
    SELECT m.id, m.brand, m.model, COUNT(r.id) AS rental_count
    FROM motorbikes m
    JOIN rentals r ON m.id = r.motorbike_id
    GROUP BY m.id, m.brand, m.model
    ORDER BY rental_count DESC
    LIMIT 5
  `);
  res.json(rows);
};
