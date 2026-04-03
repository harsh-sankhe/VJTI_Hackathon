const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  connectionTimeoutMillis: 5000, 
  idleTimeoutMillis: 30000,      
  max: 20                        
});

module.exports = pool;