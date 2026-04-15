"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Settings,
  Users,
  BarChart3,
  UserCircle,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"

type SettingsTab = "general" | "invite" | "usage" | "account" | "report" | "upgrade"

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "通用", icon: <Settings className="h-4 w-4" /> },
  { id: "invite", label: "邀请好友", icon: <Users className="h-4 w-4" /> },
  { id: "usage", label: "使用情况", icon: <BarChart3 className="h-4 w-4" /> },
  { id: "account", label: "账户", icon: <UserCircle className="h-4 w-4" /> },
  { id: "report", label: "报告问题", icon: <AlertCircle className="h-4 w-4" /> },
]

interface SettingsPageProps {
  initialTab?: string
  onBack: () => void
}

export function SettingsPage({ initialTab, onBack }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(
    (initialTab as SettingsTab) || "general"
  )
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const { user } = useAppStore()

  useEffect(() => {
    if (initialTab && tabs.some((t) => t.id === initialTab)) {
      setActiveTab(initialTab as SettingsTab)
    } else if (initialTab === "upgrade") {
      setActiveTab("invite") // Redirect upgrade to invite for now
    }
  }, [initialTab])

  const referralCode = "AXQUIGX7IIXFAJXO"

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://flowith.io/invite?code=${referralCode}`)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-56 border-r border-border flex flex-col">
        <div className="p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left",
                activeTab === tab.id
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          {activeTab === "invite" && (
            <InviteFriendsTab
              referralCode={referralCode}
              copiedCode={copiedCode}
              copiedLink={copiedLink}
              onCopyCode={handleCopyCode}
              onCopyLink={handleCopyLink}
            />
          )}
          {activeTab === "general" && <GeneralTab />}
          {activeTab === "usage" && <UsageTab />}
          {activeTab === "account" && <AccountTab user={user} />}
          {activeTab === "report" && <ReportTab />}
        </div>
      </div>
    </div>
  )
}

function InviteFriendsTab({
  referralCode,
  copiedCode,
  copiedLink,
  onCopyCode,
  onCopyLink,
}: {
  referralCode: string
  copiedCode: boolean
  copiedLink: boolean
  onCopyCode: () => void
  onCopyLink: () => void
}) {
  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">邀请好友</h1>

      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 p-8">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10">
          <h2 className="text-3xl font-bold text-white mb-2">
            分享 Flowith，赚取收益
          </h2>
          <p className="text-sm text-zinc-300">
            Gift friends{" "}
            <span className="text-amber-400 font-medium">4,000 Credits</span> |
            Unlock <span className="text-amber-400 font-medium">Unlimited Access</span>{" "}
            for yourself | Build a{" "}
            <span className="text-amber-400 font-medium">20% Passive Income</span>{" "}
            stream
          </p>

          {/* Referral Code & Link */}
          <div className="mt-8 grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-amber-400 mb-2">推荐码</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white tracking-wide">
                  {referralCode}
                </span>
                <button
                  onClick={onCopyCode}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {copiedCode ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                推荐码仅在新用户注册时使用有效
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-400 mb-2">推荐链接</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">复制链接</span>
                <button
                  onClick={onCopyLink}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {copiedLink ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
              <p className="text-xs text-zinc-400 mt-2">
                分享上方链接，推荐码将自动应用
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div>
        <h3 className="text-lg font-semibold mb-4">收益看板</h3>
        <div className="rounded-xl border border-border p-6">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-2">总邀请数</p>
              <p className="text-4xl font-bold">0</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">已获积分</p>
              <p className="text-4xl font-bold">0</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">佣金</p>
              <p className="text-4xl font-bold text-amber-500">$0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <p className="text-xs text-muted-foreground mb-1">当前等级</p>
          <p className="text-2xl font-bold">Level 0 · 创作者</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">累计获得</p>
          <p className="text-2xl font-bold">-</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={0} className="h-1.5" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Level 0 · 开始邀请</span>
          <span>Level 1 · 7 次邀请</span>
          <span>Level 2 · 50 次邀请</span>
        </div>
      </div>

      {/* Level 1 Card */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-zinc-900 to-zinc-800 p-6">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <p className="text-2xl font-bold text-white mb-2">
              Level 1 · 先锋者
            </p>
            <p className="text-xs text-zinc-400 mb-1">您将获得</p>
            <p className="text-2xl font-bold text-amber-400">
              每位好友 2,000 积分
            </p>
          </div>
          <div className="text-7xl font-bold text-white/20">7</div>
        </div>
      </div>
    </div>
  )
}

function GeneralTab() {
  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">通用设置</h1>
      <div className="space-y-6">
        <div className="rounded-xl border border-border p-6">
          <h3 className="font-medium mb-4">主题</h3>
          <p className="text-sm text-muted-foreground">
            系统会自动跟随您的设备主题设置。
          </p>
        </div>
        <div className="rounded-xl border border-border p-6">
          <h3 className="font-medium mb-4">语言</h3>
          <p className="text-sm text-muted-foreground">当前语言：简体中文</p>
        </div>
      </div>
    </div>
  )
}

function UsageTab() {
  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">使用情况</h1>
      <div className="rounded-xl border border-border p-6">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-muted-foreground mb-2">本月已用</p>
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-muted-foreground mt-1">次生成</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">剩余配额</p>
            <p className="text-3xl font-bold">100</p>
            <p className="text-xs text-muted-foreground mt-1">次生成</p>
          </div>
        </div>
        <Progress value={0} className="mt-6 h-2" />
      </div>
    </div>
  )
}

function AccountTab({ user }: { user: { name: string; email: string; plan: string } | null }) {
  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">账户</h1>
      <div className="rounded-xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-pink-400 flex items-center justify-center text-white text-2xl font-medium">
            {user?.name?.charAt(0)?.toLowerCase() || "u"}
          </div>
          <div>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-1">当前套餐</p>
          <p className="font-medium">
            {user?.plan === "free" ? "免费版" : user?.plan === "pro" ? "专业版" : "企业版"}
          </p>
        </div>
      </div>
    </div>
  )
}

function ReportTab() {
  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">报告问题</h1>
      <div className="rounded-xl border border-border p-6">
        <p className="text-sm text-muted-foreground mb-4">
          如果您在使用过程中遇到任何问题，请通过以下方式联系我们：
        </p>
        <ul className="space-y-2 text-sm">
          <li>邮箱：support@flowith.io</li>
          <li>Discord：加入我们的社区</li>
        </ul>
      </div>
    </div>
  )
}
