import jwt from "jsonwebtoken"

export const runtime = "nodejs"

const JWT_SECRET = process.env.JWT_SECRET

function getAuthError(message, status = 401) {
  return Response.json({ code: -1, msg: message }, { status })
}

export async function POST(request) {
  if (!JWT_SECRET) {
    return getAuthError("Server auth config missing", 500)
  }

  try {
    const { token } = await request.json()
    if (!token) {
      return getAuthError("缺少 Google Token", 400)
    }

    const userInfoRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${encodeURIComponent(token)}`,
      { cache: "no-store" }
    )
    const payload = await userInfoRes.json()

    if (!userInfoRes.ok || !payload?.sub) {
      return getAuthError("Google 验证失败")
    }

    const userData = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      avatar: payload.picture,
    }

    const appToken = jwt.sign(userData, JWT_SECRET, { expiresIn: "7d" })
    return Response.json({ code: 0, data: { token: appToken, user: userData } })
  } catch (error) {
    console.error("Google Auth Error:", error)
    return getAuthError("Google 验证失败")
  }
}
