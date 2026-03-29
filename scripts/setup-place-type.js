const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const alterQuery = `
      ALTER TABLE course_places 
      ADD COLUMN IF NOT EXISTS place_type VARCHAR(50) DEFAULT 'attraction';
    `;
    await pool.query(alterQuery);

    const updateQuery = `
      UPDATE course_places SET place_type = 'attraction' WHERE place_type IS NULL;
    `;
    await pool.query(updateQuery);

    console.log("course_places table successfully updated with place_type column.");
  } catch (error) {
    console.error("Error altering table:", error);
  } finally {
    await pool.end();
  }
}

main();
