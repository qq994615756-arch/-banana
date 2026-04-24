"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/lib/store"
import { Skeleton } from "@/components/ui/skeleton"

interface ProjectCard {
  id: string
  name: string
  thumbnail: string
  updatedAt: string
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })
}

export function ProjectLibrary() {
  const { setLibraryOpen, setCurrentProject } = useAppStore()
  const [projects, setProjects] = useState<ProjectCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace this mock fetch with a real external DB query.
    // Currently hits the local Next.js API route at /api/projects.
    // To integrate a real backend, change the URL to your server endpoint
    // and ensure it returns the same JSON shape: { data: ProjectCard[] }
    fetch("/api/projects")
      .then((res) => res.json())
      .then((json) => setProjects(json.data ?? []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false))
  }, [])

  const handleBack = () => {
    setLibraryOpen(false)
  }

  const handleOpenProject = (card: ProjectCard) => {
    const project = {
      id: card.id,
      name: card.name,
      description: "",
      createdAt: new Date(card.updatedAt),
      updatedAt: new Date(card.updatedAt),
      nodes: [],
    }
    setCurrentProject(project)
    setLibraryOpen(false)
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-8 py-6 border-b border-border/30">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">项目库</h1>
          <p className="text-sm text-muted-foreground mt-0.5">浏览所有项目</p>
        </div>
      </div>

      {/* Card Grid */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full aspect-[4/3] rounded-2xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-4 opacity-40" />
            <p className="text-sm">暂无项目</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleOpenProject(project)}
                className="group text-left rounded-2xl border border-border/40 bg-card/50 hover:bg-card/80 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="relative w-full aspect-[4/3] bg-muted/40 overflow-hidden">
                  <img
                    src={project.thumbnail}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.style.display = "none"
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                </div>
                {/* Info */}
                <div className="px-4 py-3.5">
                  <h3 className="text-sm font-semibold text-foreground truncate">{project.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1.5">更新日期：{formatDate(project.updatedAt)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
