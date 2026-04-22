"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Mail, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { useAppStore } from "@/lib/store"
import { useGoogleLogin } from "@react-oauth/google"

// 社交登录图标组件
function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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

type AuthStep = "choose" | "login" | "register"

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>("choose")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // 表单状态
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  
  const { setUser } = useAppStore()

  // 检查环境是否允许 Google 登录
  const isGoogleLoginEnabled = useMemo(() => {
    if (typeof window === "undefined") return true
    return true
  }, [])

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setInviteCode("")
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleBack = () => {
    if (step === "choose") {
      onOpenChange(false)
    } else {
      setStep("choose")
      resetForm()
    }
  }

  // Google 登录成功处理
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse: any) => {
      setIsLoading(true)
      try {
        const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
        const fallbackApiUrl = typeof window !== "undefined" ? window.location.origin : ""
        const apiBaseUrl = (configuredApiUrl || fallbackApiUrl).replace(/\/$/, "")
        const res = await fetch(`${apiBaseUrl}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenResponse.access_token }) 
        });
        
        const data = await res.json();
        
        if (data.code === 0) {
          setUser(data.data.user, data.data.token);
          toast.success("登录成功！");
          onOpenChange(false);
          resetForm();
          setStep("choose");
        } else {
          throw new Error(data.msg || "Google 验证失败");
        }
      } catch (err) {
        const error = err as Error;
        toast.error(error.message || "连接失败");
      } finally {
        setIsLoading(false)
      }
    },
    onError: () => toast.error("Google 登录失败")
  });

  const handleSocialLogin = async (provider: string) => {
    if (provider === "google") {
      if (!isGoogleLoginEnabled) {
        toast.info("当前环境建议使用邮箱登录进行测试。")
        return
      }
      loginWithGoogle();
    } else {
      toast.info("此方式暂未开放");
    }
  }

  // 特定邮箱快捷登录逻辑
  const handleEmailLogin = async () => {
    setIsLoading(true)
    try {
      const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim()
      const fallbackApiUrl = typeof window !== "undefined" ? window.location.origin : ""
      const apiBaseUrl = (configuredApiUrl || fallbackApiUrl).replace(/\/$/, "")

      const res = await fetch(`${apiBaseUrl}/api/auth/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await res.json();

      if (data.code === 0) {
        setUser(data.data.user, data.data.token);
        toast.success("登录成功！");
        onOpenChange(false);
        resetForm();
        setStep("choose");
      } else {
        throw new Error(data.msg || "账号或密码错误");
      }
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "服务器连接失败，请检查网络");
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    toast.info("注册系统维护中，请联系管理员获取邀请码或直接登录。");
  }

  const renderChooseStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-1">欢迎回来</h2>
        <p className="text-sm text-muted-foreground">请选择登录方式</p>
      </div>
      <div className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">快捷登录</p>
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="lg"
            className="w-14 h-12 rounded-xl border-border hover:bg-muted transition-colors"
            onClick={() => handleSocialLogin("google")}
            disabled={isLoading || !isGoogleLoginEnabled}
          >
            <GoogleIcon />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-14 h-12 rounded-xl border-border hover:bg-muted transition-colors"
            onClick={() => handleSocialLogin("x")}
            disabled={isLoading}
          >
            <XIcon />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-14 h-12 rounded-xl border-border hover:bg-muted transition-colors"
            onClick={() => handleSocialLogin("other")}
            disabled={isLoading}
          >
            <CatIcon />
          </Button>
        </div>
        {!isGoogleLoginEnabled && (
          <p className="text-center text-xs text-amber-600">
            检测到非正式域名环境，建议使用邮箱登录测试。
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">或</span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <Button
        variant="outline"
        className="w-full h-12 rounded-xl text-base font-medium"
        onClick={() => setStep("login")}
        disabled={isLoading}
      >
        <Mail className="h-5 w-5 mr-2" />
        使用邮箱账号登录
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        没有账号？{" "}
        <button
          onClick={() => setStep("register")}
          className="font-semibold text-blue-500 hover:text-blue-400 transition-colors"
          disabled={isLoading}
        >
          立即注册
        </button>
      </p>
    </div>
  )

  const renderLoginStep = () => (
    <div className="space-y-6">
      <div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-1">账号登录</h2>
          <p className="text-sm text-muted-foreground">请输入邮箱和密码</p>
        </div>
      </div>
      <div className="space-y-4">
        <Input
          type="email"
          placeholder="邮箱地址 (例如: 1065499853@qq.com)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-xl bg-muted/50 border-border focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
        />
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="登录密码 (例如: 123456)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl bg-muted/50 border-border focus:border-blue-500 focus:ring-blue-500 pr-12"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <Button
        className="w-full h-12 rounded-xl text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
        onClick={handleEmailLogin}
        disabled={isLoading || !email || !password}
      >
        {isLoading ? "正在登录..." : "登录"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        <button className="hover:text-foreground transition-colors">
          忘记密码？请联系客服。
        </button>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        没有账号？{" "}
        <button
          onClick={() => {
            setStep("register")
            resetForm()
          }}
          className="font-semibold text-blue-500 hover:text-blue-400 transition-colors"
          disabled={isLoading}
        >
          立即注册
        </button>
      </p>
    </div>
  )

  const renderRegisterStep = () => (
    <div className="space-y-6">
      <div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-1">注册账号</h2>
          <p className="text-sm text-blue-500">创建新账号或使用特定邮箱登录</p>
        </div>
      </div>
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="邀请码（可选）"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          className="h-12 rounded-xl bg-muted/50 border-border focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
        />
        <Input
          type="email"
          placeholder="邮箱地址"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-xl bg-muted/50 border-border focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
        />
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="设置密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 rounded-xl bg-muted/50 border-border focus:border-blue-500 focus:ring-blue-500 pr-12"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="确认密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-12 rounded-xl bg-muted/50 border-border focus:border-blue-500 focus:ring-blue-500 pr-12"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <Button
        className="w-full h-12 rounded-xl text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
        onClick={handleRegister}
        disabled={isLoading || !email || !password || !confirmPassword}
      >
        {isLoading ? "处理中..." : "注册"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        已有账号？{" "}
        <button
          onClick={() => {
            setStep("login")
            resetForm()
          }}
          className="font-semibold text-blue-500 hover:text-blue-400 transition-colors"
          disabled={isLoading}
        >
          立即登录
        </button>
      </p>
    </div>
  )

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setStep("choose")
      resetForm()
      setIsLoading(false)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-md p-8 bg-card/95 backdrop-blur-xl border-border rounded-2xl"
        showCloseButton={false}
      >
        <VisuallyHidden>
          <DialogTitle>
            {step === "choose" ? "登录方式选择" : step === "login" ? "账号登录" : "注册账号"}
          </DialogTitle>
          <DialogDescription>
            {step === "choose" ? "选择您的登录方式" : step === "login" ? "输入登录凭据" : "创建新账户"}
          </DialogDescription>
        </VisuallyHidden>
        {step === "choose" && renderChooseStep()}
        {step === "login" && renderLoginStep()}
        {step === "register" && renderRegisterStep()}
      </DialogContent>
    </Dialog>
  )
}