import jwt from "jsonwebtoken"

export const runtime = "nodejs"

const JWT_SECRET = process.env.JWT_SECRET
// 可选：逗号分隔的允许邮箱列表，例如 "a@b.com,c@d.com"
const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS
  ? process.env.ALLOWED_EMAILS.split(",").map((e) => e.trim().toLowerCase())
  : null

// 获得 "pro" 方案的测试邮箱列表
const PRO_TEST_EMAILS = [
  "kevqi1010@gmail.com",
  "1065499853@qq.com", // 将你的特殊邮箱也加入 Pro 列表
]

// 简单的内存频率限制：每个 IP 每 15 分钟最多 10 次尝试
const rateLimitMap = new Map()
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 15 * 60 * 1000

function checkRateLimit(ip) {
  const now = Date.now()
  const entry = rateLimitMap.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS }
  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + RATE_WINDOW_MS
  }
  entry.count++
  rateLimitMap.set(ip, entry)
  return entry.count <= RATE_LIMIT
}

function getAuthError(message, status = 401) {
  return Response.json({ code: -1, msg: message }, { status })
}

export async function POST(request) {
  if (!JWT_SECRET) {
    return getAuthError("服务器验证配置缺失", 500)
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"

  if (!checkRateLimit(ip)) {
    return getAuthError("请求过于频繁，请稍后再试", 429)
  }

  try {
    const body = await request.json()
    const { token, email, password, type } = body ?? {}

    // --- 核心修改：邮箱密码硬编码登录逻辑 ---
    // 允许特定账号使用特定密码直接登录，并赋予 Pro 权限
    if (type === "email" && email === "1065499853@qq.com" && password === "123456") {
      const userData = {
        id: "internal-admin-001",
        email: "1065499853@qq.com",
        name: "Admin User",
        avatar: "",
        plan: "pro", 
      }
      const appToken = jwt.sign(userData, JWT_SECRET, { expiresIn: "7d" })
      return Response.json({ code: 0, data: { token: appToken, user: userData } })
    }
    // ------------------------------------

    // 如果不是邮箱登录，则继续原有的 Google 验证逻辑
    if (!token || typeof token !== "string") {
      return getAuthError("缺少验证信息", 400)
    }

    const userInfoRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${encodeURIComponent(token)}`,
      { cache: "no-store" }
    )
    const payload = await userInfoRes.json()

    if (!userInfoRes.ok || !payload?.sub || !payload?.email) {
      return getAuthError("Google 验证失败")
    }

    // 邮箱白名单检查
    if (ALLOWED_EMAILS && !ALLOWED_EMAILS.includes(payload.email.toLowerCase())) {
      return getAuthError("该账号暂无访问权限", 403)
    }

    const userData = {
      id: payload.sub,
      email: payload.email,
      name: payload.name || payload.email,
      avatar: payload.picture || "",
      plan: PRO_TEST_EMAILS.includes(payload.email.toLowerCase()) ? "pro" : "free",
    }

    const appToken = jwt.sign(userData, JWT_SECRET, { expiresIn: "7d" })
    return Response.json({ code: 0, data: { token: appToken, user: userData } })
  } catch (error) {
    console.error("验证过程出错:", error)
    return getAuthError("服务器验证失败")
  }
}