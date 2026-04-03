const { Client } = require('pg');
require('dotenv').config();

async function probe() {
  console.log("Probing with URL:", process.env.SUPABASE_URL);
  const client = new Client({
    connectionString: process.env.SUPABASE_URL,
  });

  try {
    await client.connect();
    console.log("✅ Successfully connected to Supabase!");
    const res = await client.query('SELECT current_database();');
    console.log("Database:", res.rows[0].current_database);
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  } finally {
    await client.end();
  }
}

probe();
