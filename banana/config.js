// ================= 共享配置 =================
const NANO_API_KEY = 'sk-2728e945f2e24039b3b0f33186339d0d';
const GOOGLE_CLIENT_ID = '751867797576-7fq3t616j5r0s69ls93d36s2mitevi73.apps.googleusercontent.com';
const JWT_SECRET = 'a587670ae1ba2e8fc2cc91c6df3844eab3d38cdbeaf106b515025ed75ed0afb4';
const NANO_BASE_URL = 'https://grsai.dakka.com.cn';

// 延迟函数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 分辨率映射：前端数字 -> Nano 规格
function mapResolution(res) {
  if (res >= 4096) return '4K';
  if (res >= 2048) return '2K';
  return '1K';
}

module.exports = {
  NANO_API_KEY,
  GOOGLE_CLIENT_ID,
  JWT_SECRET,
  NANO_BASE_URL,
  sleep,
  mapResolution,
};
