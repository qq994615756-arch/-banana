require('dotenv').config();
const { Pool } = require('pg');

// 读取你 .env 里的 DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB() {
  try {
    console.log('⏳ 正在连接阿里云数据库...');
    
    // 运行 Claude 给的建表 SQL
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        credits INTEGER DEFAULT 0,
        plan VARCHAR(50) DEFAULT 'Free',
        created_at TIMESTAMP DEFAULT NOW(),
        last_active TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS image_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_email VARCHAR(255),
        prompt TEXT,
        model VARCHAR(100),
        credits INTEGER DEFAULT 0,
        status VARCHAR(50) DEFAULT 'processing',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('🎉 太棒了！users 和 image_records 表创建成功！');
  } catch (error) {
    console.error('❌ 建表失败，请检查 .env 里的数据库连接：', error);
  } finally {
    pool.end();
  }
}

initDB();