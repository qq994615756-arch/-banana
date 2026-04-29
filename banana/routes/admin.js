const express = require('express');
const router = express.Router();
const pool = require('../db');

// ================= 权限校验中间件 (暂时放行，方便本地测试) =================
// const jwt = require('jsonwebtoken');
// const { JWT_SECRET } = require('../config');
// function authMiddleware(req, res, next) {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ code: -1, msg: '未登录' });
//   try {
//     req.user = jwt.verify(token, JWT_SECRET);
//     next();
//   } catch {
//     res.status(401).json({ code: -1, msg: 'Token 无效' });
//   }
// }

// ================= 获取仪表盘统计数据 =================
router.get('/stats', async (req, res) => {
  try {
    // 并行执行多个统计查询，提升性能
    const [totalUsers, todayUsers, totalCredits, todayImages] = await Promise.all([
      // 总用户数
      pool.query('SELECT COUNT(*)::int AS count FROM users'),
      // 今日新增用户
      pool.query(`
        SELECT COUNT(*)::int AS count
        FROM users
        WHERE DATE(created_at) = CURRENT_DATE
      `),
      // 总积分消耗（所有用户的积分总和）
      pool.query('SELECT COALESCE(SUM(credits), 0)::int AS total FROM users'),
      // 今日生图数
      pool.query(`
        SELECT COUNT(*)::int AS count
        FROM image_records
        WHERE DATE(created_at) = CURRENT_DATE
      `),
    ]);

    res.json({
      code: 0,
      data: {
        totalUsers: totalUsers.rows[0].count,
        todayNewUsers: todayUsers.rows[0].count,
        totalCredits: totalCredits.rows[0].total,
        todayImages: todayImages.rows[0].count,
      },
    });
  } catch (error) {
    console.error('❌ 获取统计数据失败:', error.message);
    res.status(500).json({ code: -1, msg: '获取统计数据失败' });
  }
});

// ================= 获取用户列表 =================
router.get('/users', async (req, res) => {
  try {
    const { page = 1, pageSize = 20, search = '' } = req.query;
    const offset = (page - 1) * pageSize;

    // 构建查询条件
    let whereClause = '';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      whereClause = `WHERE email ILIKE $${params.length}`;
    }

    // 查询用户列表
    params.push(pageSize);
    params.push(offset);

    const usersQuery = `
      SELECT
        id,
        email,
        credits,
        plan,
        created_at,
        last_active
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    // 查询总数
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM users
      ${whereClause}
    `;

    const [usersResult, countResult] = await Promise.all([
      pool.query(usersQuery, params),
      pool.query(countQuery, search ? [params[0]] : []),
    ]);

    res.json({
      code: 0,
      data: {
        users: usersResult.rows,
        total: countResult.rows[0].total,
        page: Number(page),
        pageSize: Number(pageSize),
      },
    });
  } catch (error) {
    console.error('❌ 获取用户列表失败:', error.message);
    res.status(500).json({ code: -1, msg: '获取用户列表失败' });
  }
});

// ================= 用户充值积分 =================
router.post('/users/recharge', async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ code: -1, msg: '参数无效' });
    }

    const result = await pool.query(
      `UPDATE users SET credits = credits + $1 WHERE id = $2 RETURNING id, email, credits`,
      [amount, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ code: -1, msg: '用户不存在' });
    }

    res.json({
      code: 0,
      msg: '充值成功',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('❌ 充值失败:', error.message);
    res.status(500).json({ code: -1, msg: '充值失败' });
  }
});

module.exports = router;
