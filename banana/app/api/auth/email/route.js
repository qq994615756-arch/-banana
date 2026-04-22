import jwt from "jsonwebtoken"

export const runtime = "nodejs"

const JWT_SECRET = process.env.JWT_SECRET

// Test credentials: email and password
const TEST_CREDENTIALS = {
  "1065499853@qq.com": "123456",
  "kevqi1010@gmail.com": "123456",
}

// Emails that get plan: "pro"
const PRO_TEST_EMAILS = [
  "kevqi1010@gmail.com",
  "1065499853@qq.com",
]

// Simple in-memory rate limiter
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
    return getAuthError("Server auth config missing", 500)
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
    const { email, password } = body ?? {}

    if (!email || !password) {
      return getAuthError("邮箱和密码不能为空", 400)
    }

    const normalizedEmail = email.toLowerCase().trim()
    const storedPassword = TEST_CREDENTIALS[normalizedEmail]

    if (!storedPassword || storedPassword !== password) {
      return getAuthError("邮箱或密码错误", 401)
    }

    const userData = {
      id: normalizedEmail,
      email: normalizedEmail,
      name: normalizedEmail,
      avatar: "",
      plan: PRO_TEST_EMAILS.includes(normalizedEmail) ? "pro" : "free",
    }

    const appToken = jwt.sign(userData, JWT_SECRET, { expiresIn: "7d" })
    return Response.json({ code: 0, data: { token: appToken, user: userData } })
  } catch (error) {
    console.error("Email Auth Error:", error)
    return getAuthError("认证失败")
  }
}
