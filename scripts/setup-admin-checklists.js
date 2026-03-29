const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS admin_checklists (
        id SERIAL PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        description TEXT,
        is_provided_by_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    await pool.query(createTableQuery);
    
    // Add default initial values if table is empty
    const checkRes = await pool.query('SELECT COUNT(*) FROM admin_checklists');
    if (parseInt(checkRes.rows[0].count) === 0) {
      const insertDefaultQuery = `
        INSERT INTO admin_checklists (label, description, is_provided_by_admin) VALUES
        ('여행 공용 멀티플러그 (3구 이상)', '일행 모두가 쓸 수 있도록 관리자 통진환이 챙겨갑니다.', true),
        ('캐리어용 라면 포트 및 컵라면 1박스', '일행 공용 야식. 관리자가 박스채 가져갑니다.', true)
      `;
      await pool.query(insertDefaultQuery);
    }

    console.log("admin_checklists table created successfully.");
  } catch (error) {
    console.error("Error creating admin_checklists table:", error);
  } finally {
    await pool.end();
  }
}

main();
