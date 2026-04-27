const express = require('express');
const router = express.Router();
const { NANO_API_KEY, NANO_BASE_URL, mapResolution } = require('../config');

// ================= 提交生图任务接口 (第一步：只发号牌，秒回) =================
router.post('/', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: '请先登录' });

  try {
    const { prompt, model, ratio, resolution, quantity = 1, images } = req.body;
    console.log('🚀 前端来派单了，准备提交给第三方...');

    // 直接提交给第三方 API
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
        webHook: "-1",
        urls: images
      })
    });

    const submitData = await submitRes.json();
    if (submitData.code !== 0) throw new Error(submitData.msg);

    const taskId = submitData.data.id;
    console.log(`✅ 接单成功，发给前端的号牌: ${taskId}`);

    // 【关键】不再死等，把真实 ID 包装好，立刻扔给前端
    res.json({
      code: 0,
      msg: 'success',
      taskId: taskId,            // 格式1
      data: { taskId: taskId }   // 格式2 (双重保险)
    });

  } catch (error) {
    console.error('❌ 提交任务发生致命错误:', error);
    res.status(500).json({ error: error.message });
  }
});

// ================= 查询任务状态接口 (第二步：专门接待前端的轮询) =================
router.get('/status', async (req, res) => {
  try {
    const taskId = req.query.taskId; // 获取前端带来的号牌
    if (!taskId) return res.status(400).json({ error: '缺少 taskId' });

    // 拿着号牌去问第三方 API 画好了没
    const resultRes = await fetch(`${NANO_BASE_URL}/v1/draw/result`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NANO_API_KEY}`
      },
      body: JSON.stringify({ id: taskId })
    });

    const resultData = await resultRes.json();

    // 如果还没画完 (processing)
    if (!resultData.data || resultData.data.status === 'processing' || resultData.data.status === 'starting') {
      return res.json({
        code: 0,
        status: 'processing',
        data: { status: 'processing' }
      });
    }

    // 如果画成功了 (succeeded)
    if (resultData.data.status === 'succeeded') {
      const imageUrls = resultData.data.results.map(img => img.url);
      console.log('🎉 画完啦！把图片交给前端:', imageUrls);
      return res.json({
        code: 0,
        msg: 'success',
        status: 'succeeded',
        images: imageUrls,
        data: {
          status: 'succeeded',
          images: imageUrls,
          results: resultData.data.results, // 完美还原 Grsai 原生格式 [{url: '...'}]
          url: imageUrls[0]                 // 满足直接读 url 的前端需求
        }
      });
    }

    // 如果失败了 (failed)
    return res.json({ code: -1, msg: resultData.data.error || '生成失败' });

  } catch (error) {
    console.error('❌ 查询状态报错:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
