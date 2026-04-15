"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { Mail, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"

// Social Icons
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
  
  // Form fields
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  
  const { setUser } = useAppStore()

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

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setUser({
        id: "user-1",
        name: "User",
        email: `user@${provider}.com`,
        plan: "free",
      })
      toast.success("Login successful!")
      onOpenChange(false)
      resetForm()
      setStep("choose")
    } catch {
      toast.error("Login failed, please try again")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter email and password")
      return
    }
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setUser({
        id: "user-1",
        name: "User",
        email: email,
        plan: "pro",
      })
      toast.success("Welcome back!")
      onOpenChange(false)
      resetForm()
      setStep("choose")
    } catch {
      toast.error("Login failed, please check your credentials")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      toast.error("Please fill in all required fields")
      return
    }
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setUser({
        id: "user-1",
        name: "New User",
        email: email,
        plan: "free",
      })
      toast.success("Registration successful!")
      onOpenChange(false)
      resetForm()
      setStep("choose")
    } catch {
      toast.error("Registration failed, please try again")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 1: Choose login method
  const renderChooseStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-1">Welcome Back</h2>
        <p className="text-sm text-muted-foreground">Log in to continue your journey</p>
      </div>

      {/* Social Login */}
      <div className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">Quick sign in with</p>
        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="lg"
            className="w-14 h-12 rounded-xl border-border hover:bg-muted transition-colors"
            onClick={() => handleSocialLogin("google")}
            disabled={isLoading}
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
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Email Button */}
      <Button
        variant="outline"
        className="w-full h-12 rounded-xl text-base font-medium"
        onClick={() => setStep("login")}
        disabled={isLoading}
      >
        <Mail className="h-5 w-5 mr-2" />
        Email
      </Button>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <button
          onClick={() => setStep("register")}
          className="font-semibold text-blue-500 hover:text-blue-400 transition-colors"
          disabled={isLoading}
        >
          Sign Up
        </button>
      </p>

      {/* Terms */}
      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to our{" "}
        <a href="#" className="text-blue-500 hover:underline">Terms</a>
        {" & "}
        <a href="#" className="text-blue-500 hover:underline">Privacy</a>
      </p>
    </div>
  )

  // Step 2: Email Login
  const renderLoginStep = () => (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-1">Welcome Back</h2>
          <p className="text-sm text-muted-foreground">Log in to continue your journey</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-xl bg-muted/50 border-border focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
        />
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
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

      {/* Login Button */}
      <Button
        className="w-full h-12 rounded-xl text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
        onClick={handleEmailLogin}
        disabled={isLoading || !email || !password}
      >
        {isLoading ? "Logging in..." : "Login"}
      </Button>

      {/* Forgot Password */}
      <p className="text-center text-sm text-muted-foreground">
        <button className="hover:text-foreground transition-colors">
          Forgot Password?
        </button>
      </p>

      {/* Sign Up Link */}
      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <button
          onClick={() => {
            setStep("register")
            resetForm()
          }}
          className="font-semibold text-blue-500 hover:text-blue-400 transition-colors"
          disabled={isLoading}
        >
          Sign Up
        </button>
      </p>

      {/* Terms */}
      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to our{" "}
        <a href="#" className="text-blue-500 hover:underline">Terms</a>
        {" & "}
        <a href="#" className="text-blue-500 hover:underline">Privacy</a>
      </p>
    </div>
  )

  // Step 3: Register
  const renderRegisterStep = () => (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-1">Register</h2>
          <p className="text-sm text-blue-500">Create an account to get started</p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        <Input
          type="text"
          placeholder="Invite Code (optional)"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          className="h-12 rounded-xl bg-muted/50 border-border focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
        />
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 rounded-xl bg-muted/50 border-border focus:border-blue-500 focus:ring-blue-500"
          disabled={isLoading}
        />
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
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
            placeholder="Confirm Password"
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

      {/* Register Button */}
      <Button
        className="w-full h-12 rounded-xl text-base font-medium bg-blue-600 hover:bg-blue-700 text-white"
        onClick={handleRegister}
        disabled={isLoading || !email || !password || !confirmPassword}
      >
        {isLoading ? "Registering..." : "Register"}
      </Button>

      {/* Sign In Link */}
      <p className="text-center text-sm text-muted-foreground">
        Have an account?{" "}
        <button
          onClick={() => {
            setStep("login")
            resetForm()
          }}
          className="font-semibold text-blue-500 hover:text-blue-400 transition-colors"
          disabled={isLoading}
        >
          Sign In
        </button>
      </p>

      {/* Terms */}
      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to our{" "}
        <a href="#" className="text-blue-500 hover:underline">Terms</a>
        {" & "}
        <a href="#" className="text-blue-500 hover:underline">Privacy</a>
      </p>
    </div>
  )

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
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
            {step === "choose" ? "Sign In" : step === "login" ? "Login" : "Register"}
          </DialogTitle>
          <DialogDescription>
            {step === "choose" ? "Choose your login method" : step === "login" ? "Enter your credentials" : "Create a new account"}
          </DialogDescription>
        </VisuallyHidden>
        {step === "choose" && renderChooseStep()}
        {step === "login" && renderLoginStep()}
        {step === "register" && renderRegisterStep()}
      </DialogContent>
    </Dialog>
  )
}
