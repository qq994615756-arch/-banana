"use client"

import { useState, useEffect } from "react"
import { Plus, FolderOpen, Sparkles, ArrowRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"

function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj.toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
  })
}

export function WelcomeScreen() {
  const [mounted, setMounted] = useState(false)
  const { projects, setCurrentProject, addProject } = useAppStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const recentProjects = projects.slice(0, 3)

  const handleNewProject = () => {
    const newProject = {
      id: `proj-${Date.now()}`,
      name: `新项目 ${projects.length + 1}`,
      description: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      nodes: [],
    }
    addProject(newProject)
    setCurrentProject(newProject)
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
      <div className="w-full max-w-3xl">
        {/* Header - More Sophisticated */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-8 rounded-3xl bg-muted/60 border border-border/50 backdrop-blur-sm">
            <div className="relative">
              <Sparkles className="h-12 w-12 text-foreground/80" />
            </div>
          </div>
          <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
            FlowAI
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            智能创意工作台。让 AI 助力你的想象力，从灵感到成品只需一步
          </p>
        </div>

        {/* Quick Actions - Elegant Grid */}
        <div className="grid md:grid-cols-2 gap-5 mb-12 lg:mb-16">
          <button
            onClick={handleNewProject}
            className="group relative overflow-hidden p-8 rounded-2xl border border-border/50 hover:border-border transition-all duration-300 bg-card/40 hover:bg-card/60 backdrop-blur-sm hover:shadow-lg text-left"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-5 group-hover:bg-muted/80 transition-all">
                <Plus className="h-7 w-7 text-foreground/80" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">新建项目</h3>
              <p className="text-sm text-muted-foreground">
                创建一个新的画布，开启你的创意之旅
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              if (recentProjects.length > 0) {
                setCurrentProject(recentProjects[0])
              }
            }}
            disabled={recentProjects.length === 0}
            className="group relative overflow-hidden p-8 rounded-2xl border border-border/50 hover:border-border transition-all duration-300 bg-card/40 hover:bg-card/60 backdrop-blur-sm hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-5 group-hover:bg-muted/80 transition-all">
                <FolderOpen className="h-7 w-7 text-foreground/80" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">继续上次</h3>
              <p className="text-sm text-muted-foreground">
                {recentProjects.length > 0
                  ? `打开 "${recentProjects[0].name}"`
                  : "暂无最近项目"}
              </p>
            </div>
          </button>
        </div>

        {/* Recent Projects - Refined */}
        {recentProjects.length > 0 && (
          <div className="mb-12 lg:mb-16">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-lg bg-muted/50">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                最近项目
              </h2>
            </div>
            <div className="space-y-3">
              {recentProjects.map((project, idx) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setCurrentProject(project)}
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 bg-card/30 hover:bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-md group text-left"
                  style={{
                    animationDelay: `${idx * 100}ms`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    {mounted && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(project.updatedAt)}
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Features - Statistics Grid */}
        <div className="border-t border-border/30 pt-12 lg:pt-16">
          <div className="grid grid-cols-3 gap-6 lg:gap-8">
            {[
              { value: "4+", label: "AI 模型", icon: "✨" },
              { value: "无限", label: "画布空间", icon: "🎨" },
              { value: "实时", label: "自动保存", icon: "⚡" },
            ].map((item, idx) => (
              <div key={idx} className="text-center group">
                <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform">{item.icon}</div>
                <div className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                  {item.value}
                </div>
                <div className="text-sm text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
