const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS course_votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
    `;
    await pool.query(createTableQuery);
    console.log("course_votes table created successfully.");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    await pool.end();
  }
}

main();
