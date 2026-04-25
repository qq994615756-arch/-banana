"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { cn } from "../lib/utils"
import { useAppStore } from "../lib/store"
import { useTheme } from "next-themes"
// 引入 Select 组件
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"

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
    // 【修改点】将这里的链接替换成你自己的网站域名
    navigator.clipboard.writeText(`https://yourdomain.com/invite?code=${referralCode}`)
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

      {/* Hero Banner (保留) */}
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
          {/* 【修改点】修改文案 */}
          <h2 className="text-3xl font-bold text-white mb-2">
            邀请好友，共享无限可能
          </h2>
          <p className="text-sm text-zinc-300">
            赠送好友 <span className="text-amber-400 font-medium">免费额度</span> | 
            自己获取 <span className="text-amber-400 font-medium">积分奖励</span>
          </p>

          {/* Referral Code & Link */}
          <div className="mt-8 grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs text-amber-400 mb-2">专属推荐码</p>
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
                新用户注册时填写生效
              </p>
            </div>
            <div>
              <p className="text-xs text-amber-400 mb-2">专属推荐链接</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">点击复制链接</span>
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
                好友通过此链接注册，自动绑定推荐关系
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 【修改点】使用 hidden 类名将不需要的部分暂时隐藏 */}
      <div className="hidden">
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
      {/* 🚀 隐藏层结束 */}

    </div>
  )
}

function GeneralTab() {
  const { theme, setTheme } = useTheme()
  const [language, setLanguage] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("app-language") || "zh"
    }
    return "zh"
  })

  const handleLanguageChange = useCallback((value: string) => {
    setLanguage(value)
    localStorage.setItem("app-language", value)
    // 触发自定义事件，通知其他组件语言变更
    window.dispatchEvent(new CustomEvent("language-change", { detail: value }))
  }, [])

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">通用设置</h1>
      <div className="space-y-4">
        {/* 主题设置单行显示 + Select 组件 */}
        <div className="flex items-center justify-between rounded-xl border border-border p-5">
          <div>
            <h3 className="font-medium">主题外观</h3>
            <p className="text-sm text-muted-foreground">
              系统会自动跟随您的设备主题设置。
            </p>
          </div>
          <Select value={theme || "system"} onValueChange={setTheme}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="选择主题" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">跟随系统</SelectItem>
              <SelectItem value="light">浅色模式</SelectItem>
              <SelectItem value="dark">深色模式</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 语言设置单行显示 + Select 组件 */}
        <div className="flex items-center justify-between rounded-xl border border-border p-5">
          <div>
            <h3 className="font-medium">界面语言</h3>
            <p className="text-sm text-muted-foreground">
              选择您偏好的系统展示语言。
            </p>
          </div>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="选择语言" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="zh">简体中文</SelectItem>
              <SelectItem value="en">English (US)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

function UsageTab() {
  // 🚀 TODO [后端对接说明]: 
  // 当配置好真实后端时，你可以使用 useEffect 请求用户使用量接口。
  // 示例代码：
  // const [usageData, setUsageData] = useState({ used: 0, limit: 100 });
  // useEffect(() => {
  //   fetch('/api/user/usage')
  //     .then(res => res.json())
  //     .then(data => setUsageData(data));
  // }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">使用情况</h1>
      <div className="rounded-xl border border-border p-6">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm text-muted-foreground mb-2">本月已用</p>
            {/* 🚀 TODO: 这里替换成 {usageData.used} */}
            <p className="text-3xl font-bold">0</p>
            <p className="text-xs text-muted-foreground mt-1">次生成</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">剩余配额</p>
            {/* 🚀 TODO: 这里替换成 {usageData.limit} */}
            <p className="text-3xl font-bold">100</p>
            <p className="text-xs text-muted-foreground mt-1">次生成</p>
          </div>
        </div>
        {/* 🚀 TODO: 这里的 value 替换成 (usageData.used / usageData.limit) * 100 */}
        <Progress value={0} className="mt-6 h-2" />
      </div>
    </div>
  )
}

function AccountTab({ user }: { user: { name: string; email: string; plan: string } | null }) {
  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">账户</h1>
      {/* 【修改点】重构的账户信息卡片 (图二样式) */}
      <div className="rounded-xl border border-border p-8">
        <div className="flex items-center gap-6">
          {/* 头像 */}
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-medium shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          {/* 昵称、邮箱与套餐 */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold text-foreground">
              {user?.name || "未命名用户"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {user?.email || "未绑定邮箱"}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {user?.plan === "free" ? "免费版" : user?.plan === "pro" ? "PRO 专业版" : "企业版"}
              </span>
            </div>
          </div>
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
        {/* 【修改点】修改文案 */}
        <p className="text-sm font-medium text-foreground mb-4">
          遇到 Bug 了？或者有好的产品建议？快来联系我们：
        </p>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            客服邮箱：support@yourdomain.com
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            官方社群：添加微信小助手获取入群链接
          </li>
        </ul>
      </div>
    </div>
  )
}