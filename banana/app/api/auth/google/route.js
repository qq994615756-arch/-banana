import jwt from "jsonwebtoken"

export const runtime = "nodejs"

const JWT_SECRET = process.env.JWT_SECRET
// Optional: comma-separated allowed emails, e.g. "a@b.com,c@d.com"
const ALLOWED_EMAILS = process.env.ALLOWED_EMAILS
  ? process.env.ALLOWED_EMAILS.split(",").map((e) => e.trim().toLowerCase())
  : null

// Emails that get plan: "pro" — replace with your own email(s)
const PRO_TEST_EMAILS = [
  "kevqi1010@gmail.com",
]

// Simple in-memory rate limiter: max 10 attempts per IP per 15 minutes
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
    const { token } = body ?? {}
    if (!token || typeof token !== "string") {
      return getAuthError("缺少 Google Token", 400)
    }

    const userInfoRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${encodeURIComponent(token)}`,
      { cache: "no-store" }
    )
    const payload = await userInfoRes.json()

    if (!userInfoRes.ok || !payload?.sub || !payload?.email) {
      return getAuthError("Google 验证失败")
    }

    // Email allowlist check (if ALLOWED_EMAILS env var is configured)
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
    console.error("Google Auth Error:", error)
    return getAuthError("Google 验证失败")
  }
}
