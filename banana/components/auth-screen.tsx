"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Sparkles } from "lucide-react"
import { useAppStore } from "@/lib/store"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function CatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-4-8c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm8 0c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-4 4c2.21 0 4-1.79 4-4h-8c0 2.21 1.79 4 4 4z" />
    </svg>
  )
}

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(false)
  const [inviteCode, setInviteCode] = useState("")
  const { setUser } = useAppStore()

  const handleSignIn = () => {
    setUser({
      id: "user-1",
      name: "用户",
      email: "user@example.com",
      plan: "pro",
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-muted/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-muted/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-10">
          {/* Header - Premium */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-5 rounded-2xl bg-muted/60 border border-border/50">
              <Sparkles className="w-8 h-8 text-foreground/80" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dynastream
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin ? "欢迎回来" : "开启你的 AI 创意之旅"}
            </p>
          </div>

          {/* Invite Code */}
          {!isLogin && (
            <div className="mb-6">
              <Input
                placeholder="邀请码（可选）"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl h-11 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Social Login - Enhanced */}
          <div className="mb-6">
            <p className="text-center text-sm text-muted-foreground mb-4 font-medium">
              快速开始
            </p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="lg"
                className="w-14 h-12 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                onClick={handleSignIn}
              >
                <GoogleIcon />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-14 h-12 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                onClick={handleSignIn}
              >
                <XIcon />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-14 h-12 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                onClick={handleSignIn}
              >
                <CatIcon />
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
            <span className="text-xs text-muted-foreground font-medium">或</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent" />
          </div>

          {/* Email Button - Primary */}
          <Button
            className="w-full h-12 rounded-xl text-base font-medium bg-foreground hover:bg-foreground/90 text-background shadow-lg"
            onClick={handleSignIn}
          >
            <Mail className="h-5 w-5 mr-2" />
            {isLogin ? "登录" : "邮箱注册"}
          </Button>

          {/* Toggle Login/Register */}
          <p className="text-center mt-7 text-sm text-muted-foreground">
            {isLogin ? "没有账户？" : "已有账户？"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
            >
              {isLogin ? "创建账户" : "立即登录"}
            </button>
          </p>

          {/* Terms */}
          <p className="text-center mt-5 text-xs text-muted-foreground leading-relaxed">
            继续表示你同意我们的{" "}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
              服务条款
            </a>{" "}
            和{" "}
            <a href="#" className="text-blue-600 dark:text-blue-400 hover:underline">
              隐私政策
            </a>
          </p>
        </div>

        {/* Footer - Trust Indicators */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>✨ 由 AI 赋能的创意工作室</p>
        </div>
      </div>
    </div>
  )
}
