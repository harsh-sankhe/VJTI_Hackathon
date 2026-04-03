const { Client } = require('pg');

async function testConnection(host, port, user, password, ssl) {
  console.log(`Testing ${host}:${port} with user ${user} (ssl: ${ssl})`);
  const client = new Client({
    host,
    port,
    database: 'postgres',
    user,
    password,
    ssl: ssl ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 5000
  });

  try {
    await client.connect();
    console.log(`SUCCESS: Connected to ${host}:${port}`);
    await client.end();
    return true;
  } catch (err) {
    console.log(`FAILED: ${host}:${port} - ${err.message}`);
    return false;
  }
}

async function main() {
  const host = 'db.uzivikolecaudvowneno.supabase.co';
  const pass = 'Tanmay@1712'; // Unescaped password
  
  await testConnection(host, 5432, 'postgres', pass, true);
  await testConnection(host, 6543, 'postgres', pass, true);
  await testConnection(host, 6543, 'postgres.uzivikolecaudvowneno', pass, true);
  
  // Test AWS global pooler
  await testConnection('aws-0-ap-south-1.pooler.supabase.com', 6543, 'postgres.uzivikolecaudvowneno', pass, true);
  await testConnection('aws-0-ap-southeast-1.pooler.supabase.com', 6543, 'postgres.uzivikolecaudvowneno', pass, true);
  await testConnection('aws-0-us-east-1.pooler.supabase.com', 6543, 'postgres.uzivikolecaudvowneno', pass, true);
}

main();
