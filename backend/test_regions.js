const { Client } = require('pg');

const regions = [
  'ap-south-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ap-east-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-southeast-1',
  'ap-southeast-2',
  'ca-central-1',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'sa-east-1'
];

async function testConnection(host, port, user, password) {
  const client = new Client({
    host,
    port,
    database: 'postgres',
    user,
    password,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log(`SUCCESS: ${host}`);
    await client.end();
    return true;
  } catch (err) {
    if (err.message !== 'Tenant or user not found' && err.message !== 'project not found') {
      console.log(`FAILED (${host}): ${err.message}`);
    }
    return false;
  }
}

async function main() {
  const pass = 'Tanmay@1712';
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const success = await testConnection(host, 6543, 'postgres.uzivikolecaudvowneno', pass);
    if (success) {
      console.log(`\n🎉 Found the right region: ${region}`);
      process.exit(0);
    }
  }
  console.log('Finished testing all regions. None succeeded.');
}

main();
