const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// ================= Google 登录接口 =================
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body; // 前端传过来的 access_token

    // 使用 access_token 向 Google 请求获取用户真实信息
    const userInfoRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`);
    const payload = await userInfoRes.json();

    if (!userInfoRes.ok || !payload.sub) {
      throw new Error('无效的 Google Token');
    }

    // 构造用户信息
    const userData = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
    };

    // 生成你自己的 JWT Token
    const appToken = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });

    // 返回给前端
    res.json({ code: 0, data: { token: appToken, user: userData } });
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    res.status(401).json({ code: -1, msg: 'Google 验证失败' });
  }
});

// ================= 邮箱登录接口 (带白名单限制) =================
router.post('/email', (req, res) => {
  try {
    const { email } = req.body; // 获取前端传来的邮箱

    // 🛑 白名单检查：只允许你的邮箱
    if (email !== '1065499853@qq.com') {
      return res.status(403).json({ code: -1, msg: '未经授权的访问' });
    }

    const mockUser = {
      id: 'admin-001',
      email: '1065499853@qq.com',
      name: '项目主理人',
      avatar: ''
    };

    // 生成 JWT Token
    const appToken = jwt.sign(mockUser, JWT_SECRET, { expiresIn: '7d' });

    res.json({ code: 0, data: { token: appToken, user: mockUser } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ code: -1, msg: '登录异常' });
  }
});

module.exports = router;
