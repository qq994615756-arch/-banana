"use client"

import { useState, useEffect } from "react"
import {
  Plus,
  FolderOpen,
  Clock,
  Settings,
  ChevronLeft,
  Search,
  MoreHorizontal,
  Trash2,
  Edit3,
  Copy,
  Moon,
  Sun,
  Layers,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/lib/store"
import { UserProfileDropdown } from "@/components/user-profile-dropdown"
import { PricingDialog } from "@/components/pricing-dialog"
import type { Project } from "@/lib/types"

function formatRelativeTime(date: Date | string): string {
  const now = new Date()
  const d = date instanceof Date ? date : new Date(date)
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "刚刚"
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString("zh-CN")
}

function ProjectItem({
  project,
  isActive,
  onClick,
}: {
  project: Project
  isActive: boolean
  onClick: () => void
}) {
  const { deleteProject, updateProject, addProject, setCurrentProject } = useAppStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(project.name)

  const handleClick = (e: React.MouseEvent) => {
    // 防止在点击菜单按钮时触发项目切换
    if ((e.target as HTMLElement).closest('[data-menu-trigger]')) {
      return
    }
    if (isRenaming) return
    onClick()
  }

  const handleRename = () => {
    setMenuOpen(false)
    setRenameValue(project.name)
    setIsRenaming(true)
  }

  const handleRenameSubmit = () => {
    if (renameValue.trim()) {
      updateProject(project.id, { name: renameValue.trim() })
    }
    setIsRenaming(false)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleRenameSubmit()
    } else if (e.key === "Escape") {
      setIsRenaming(false)
      setRenameValue(project.name)
    }
  }

  const handleDuplicate = () => {
    setMenuOpen(false)
    const newProject = {
      id: `proj-${Date.now()}`,
      name: `${project.name} (副本)`,
      description: project.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      nodes: [...project.nodes],
    }
    addProject(newProject)
    setCurrentProject(newProject)
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 transition-all duration-200 cursor-pointer",
        isActive
          ? "bg-muted/60 border border-border/50 text-primary shadow-sm"
          : "hover:bg-muted/40 text-foreground border border-transparent hover:border-border/50"
      )}
    >
      {/* 内容 */}
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameKeyDown}
            className="h-7 text-sm px-2"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <>
            <p className="font-medium truncate text-sm">{project.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {formatRelativeTime(project.updatedAt)}
            </p>
          </>
        )}
      </div>

      {/* 菜单按钮 */}
      {!isRenaming && (
        <div data-menu-trigger>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                handleRename()
              }}>
                <Edit3 className="h-4 w-4 mr-2" />
                重命名
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation()
                handleDuplicate()
              }}>
                <Copy className="h-4 w-4 mr-2" />
                复制
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteProject(project.id)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const {
    projects,
    currentProject,
    setCurrentProject,
    sidebarOpen,
    setSidebarOpen,
    setSettingsOpen,
    setSettingsTab,
    addProject,
    user,
  } = useAppStore()

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

  const [searchQuery, setSearchQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [pricingOpen, setPricingOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!sidebarOpen) {
    return (
      <div className="w-16 h-full bg-gradient-to-b from-sidebar to-sidebar/95 border-r border-sidebar-border/50 flex flex-col items-center py-4 gap-3 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-10 w-10 rounded-lg"
        >
          <ChevronLeft className="h-5 w-5 rotate-180" />
        </Button>
        <div className="h-px w-8 bg-border/30" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNewProject}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-10 w-10 rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-10 w-10 rounded-lg transition-colors"
        >
          <FolderOpen className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <div className="h-px w-8 bg-border/30" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-10 w-10 rounded-lg"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    )
  }

  return (
    <div className="w-[264px] h-full bg-gradient-to-b from-sidebar to-sidebar/95 border-r border-sidebar-border/50 flex flex-col backdrop-blur-sm">
      {/* Header - Refined */}
      <div className="p-5 border-b border-sidebar-border/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-foreground/90 flex items-center justify-center shadow-lg">
              <Layers className="w-5 h-5 text-background" />
            </div>
            <div>
              <span className="font-bold text-lg text-foreground">Dynastream</span>
              <p className="text-xs text-muted-foreground">AI Creative Studio</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <Button
          className="w-full justify-start gap-2 h-10 rounded-xl bg-foreground hover:bg-foreground/90 text-background shadow-md"
          onClick={handleNewProject}
        >
          <Plus className="h-4 w-4" />
          新建项目
        </Button>
      </div>

      {/* Search - Enhanced */}
      <div className="p-4 border-b border-sidebar-border/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目..."
            className="pl-9 bg-sidebar-accent/50 border-sidebar-border/30 rounded-xl h-9 focus:border-primary/50 focus:ring-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Projects List - Modern */}
      <ScrollArea className="flex-1 px-3 py-3 [&_[data-slot=scroll-area-scrollbar]]:hidden">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <div className="p-1.5 rounded-lg bg-muted/50">
              <Clock className="h-3 w-3" />
            </div>
            最近项目
          </div>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project, idx) => (
              <div
                key={project.id}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <ProjectItem
                  project={project}
                  isActive={currentProject?.id === project.id}
                  onClick={() => setCurrentProject(project)}
                />
              </div>
            ))
          ) : (
            <div className="px-3 py-8 text-center text-muted-foreground text-sm">
              {searchQuery ? "未找到匹配的项目" : "暂无项目"}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer - User Profile */}
      <div className="p-3 border-t border-sidebar-border/30">
        <div className="flex items-center gap-1.5">
          <UserProfileDropdown
            onOpenSettings={(tab) => {
              if (tab) setSettingsTab(tab)
              setSettingsOpen(true)
            }}
          />
          <Button
            variant="ghost"
            onClick={() => setPricingOpen(true)}
            className="h-8 py-1.5 px-2.5 rounded-full border border-border/50 hover:bg-muted/50 transition-colors text-xs font-medium text-foreground"
          >
            升级套餐
          </Button>
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full border border-border/50"
            >
              {theme === "dark" ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* Pricing Dialog */}
      <PricingDialog open={pricingOpen} onOpenChange={setPricingOpen} />
    </div>
  )
}
