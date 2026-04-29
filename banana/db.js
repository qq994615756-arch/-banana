// ================= PostgreSQL 连接池 =================
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/banana',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// 连接池事件监听
pool.on('connect', () => {
  console.log('✅ PostgreSQL 新连接已建立');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL 连接池异常:', err.message);
});

module.exports = pool;
