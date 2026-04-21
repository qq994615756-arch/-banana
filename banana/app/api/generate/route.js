import jwt from "jsonwebtoken"

export const runtime = "nodejs"

const NANO_API_KEY = process.env.NANO_API_KEY
const JWT_SECRET = process.env.JWT_SECRET
const NANO_BASE_URL = process.env.NANO_BASE_URL || "https://grsai.dakka.com.cn"
const DEFAULT_MODEL = process.env.NANO_MODEL || "nano-banana-pro"
const MAX_POLL_MS = 120_000

function mapResolution(resolution) {
  if (resolution >= 4096) return "4K"
  if (resolution >= 2048) return "2K"
  return "1K"
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  return authHeader.slice("Bearer ".length).trim()
}

export async function POST(request) {
  if (!NANO_API_KEY) {
    console.error("NANO_API_KEY is not configured")
    return Response.json({ error: "图像生成服务未配置，请联系管理员" }, { status: 500 })
  }
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not configured")
    return Response.json({ error: "认证服务未配置，请联系管理员" }, { status: 500 })
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

  let body
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: "请求格式错误" }, { status: 400 })
  }

  const { prompt, model, ratio, resolution, quantity, images } = body

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return Response.json({ error: "请输入生成描述" }, { status: 400 })
  }

  try {
    const runTask = async () => {
      const submitRes = await fetch(`${NANO_BASE_URL}/v1/draw/nano-banana`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${NANO_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model || DEFAULT_MODEL,
          prompt: prompt.trim(),
          aspectRatio: ratio || "1:1",
          imageSize: mapResolution(resolution || 1024),
          webHook: "-1",
          urls: images || [],
        }),
      })

      const submitData = await submitRes.json()
      if (!submitRes.ok || submitData.code !== 0 || !submitData?.data?.id) {
        throw new Error(submitData?.msg || "提交任务失败")
      }

      const taskId = submitData.data.id
      const deadline = Date.now() + MAX_POLL_MS

      while (Date.now() < deadline) {
        await sleep(3000)

        const resultRes = await fetch(`${NANO_BASE_URL}/v1/draw/result`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: taskId }),
        })
        const resultData = await resultRes.json()

        if (!resultRes.ok) {
          throw new Error(resultData?.msg || "查询任务失败")
        }

        if (resultData?.code === 0 && resultData?.data?.status === "succeeded") {
          const url = resultData?.data?.results?.[0]?.url
          if (!url) throw new Error("生成成功但未返回图片地址")
          return url
        }

        if (resultData?.data?.status === "failed") {
          throw new Error(resultData?.data?.error || "生成失败")
        }
      }

      throw new Error("生成超时，请重试")
    }

    const total = Number.isInteger(quantity) && quantity > 0 && quantity <= 8 ? quantity : 1
    const urls = await Promise.all(Array.from({ length: total }).map(() => runTask()))
    return Response.json({ images: urls })
  } catch (error) {
    console.error("Generate Error:", error)
    return Response.json({ error: error?.message || "生成失败，请重试" }, { status: 500 })
  }
}
