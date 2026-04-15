const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ================= 配置区 =================
const NANO_API_KEY = '你的_NANO_BANANA_API_KEY';
const GOOGLE_CLIENT_ID = '你的_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const JWT_SECRET = 'banana-auth-secret-key-2024'; // 建议更换为随机字符串
const NANO_BASE_URL = 'https://grsai.dakka.com.cn'; // 根据文档地址填写

// 延迟函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 分辨率映射：前端数字 -> Nano 规格
function mapResolution(res) {
  if (res >= 4096) return '4K';
  if (res >= 2048) return '2K';
  return '1K';
}

// ================= 1. Google 登录接口 =================
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    
    const userData = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
    };

    const appToken = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
    res.json({ code: 0, data: { token: appToken, user: userData } });
  } catch (error) {
    res.status(401).json({ code: -1, msg: 'Google 验证失败' });
  }
});

// ================= 2. AI 绘图接口 (带轮询逻辑) =================
app.post('/api/generate', async (req, res) => {
  // 验证 JWT
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: '请先登录' });

  try {
    const { prompt, model, ratio, resolution, quantity, images } = req.body;

    // 提交任务的函数
    const runTask = async () => {
      const submitRes = await fetch(`${NANO_BASE_URL}/v1/draw/nano-banana`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NANO_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model || 'nano-banana-pro',
          prompt,
          aspectRatio: ratio || '1:1',
          imageSize: mapResolution(resolution),
          webHook: "-1", // 使用轮询模式
          urls: images // 垫图
        })
      });
      const submitData = await submitRes.json();
      if (submitData.code !== 0) throw new Error(submitData.msg);

      const taskId = submitData.data.id;
      
      // 轮询结果
      while (true) {
        await sleep(3000);
        const resultRes = await fetch(`${NANO_BASE_URL}/v1/draw/result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: taskId })
        });
        const resultData = await resultRes.json();
        
        if (resultData.code === 0 && resultData.data.status === 'succeeded') {
          return resultData.data.results[0].url;
        } else if (resultData.data.status === 'failed') {
          throw new Error(resultData.data.error || '生成失败');
        }
      }
    };

    // 支持多张同时生成
    const urls = await Promise.all(Array.from({ length: quantity }).map(() => runTask()));
    res.json({ images: urls });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Backend running on port 3001'));
