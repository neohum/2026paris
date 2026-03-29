const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS flight_recommendations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        departure_date VARCHAR(50),
        return_date VARCHAR(50),
        airline VARCHAR(100),
        route VARCHAR(100),
        price VARCHAR(50),
        duration VARCHAR(50),
        memo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS flight_votes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        flight_id INTEGER REFERENCES flight_recommendations(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, flight_id)
      );
    `;
    await pool.query(createTableQuery);
    console.log("flight_recommendations and flight_votes tables created successfully.");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await pool.end();
  }
}

main();
