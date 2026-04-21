import jwt from "jsonwebtoken"

export const runtime = "nodejs"

const NANO_BASE_URL = process.env.NANO_BASE_URL || "https://grsai.dakka.com.cn"
const JWT_SECRET = process.env.JWT_SECRET

function getBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  return authHeader.slice("Bearer ".length).trim()
}

export async function GET(request) {
  if (!JWT_SECRET) {
    return Response.json({ error: "认证服务未配置" }, { status: 500 })
  }

  const authHeader = request.headers.get("authorization")
  const token = getBearerToken(authHeader)
  if (!token) {
    return Response.json({ error: "请先登录" }, { status: 401 })
  }

  try {
    jwt.verify(token, JWT_SECRET)
  } catch {
    return Response.json({ error: "登录状态已失效，请重新登录" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const taskId = searchParams.get("taskId")
  if (!taskId) {
    return Response.json({ error: "缺少 taskId" }, { status: 400 })
  }

  try {
    const resultRes = await fetch(`${NANO_BASE_URL}/v1/draw/result`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId }),
    })
    const resultData = await resultRes.json()

    if (!resultRes.ok) {
      return Response.json({ status: "failed", error: resultData?.msg || "查询失败" })
    }

    const taskStatus = resultData?.data?.status

    if (taskStatus === "succeeded") {
      const url = resultData?.data?.results?.[0]?.url
      if (!url) return Response.json({ status: "failed", error: "生成成功但未返回图片地址" })
      return Response.json({ status: "succeeded", images: [url] })
    }

    if (taskStatus === "failed") {
      return Response.json({ status: "failed", error: resultData?.data?.error || "生成失败" })
    }

    return Response.json({ status: "processing" })
  } catch (error) {
    console.error("Status Poll Error:", error)
    return Response.json({ status: "failed", error: error?.message || "查询失败" })
  }
}
