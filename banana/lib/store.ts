"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Project, CanvasNode, AIModel, User, Settings } from "./types"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  images?: string[]
  timestamp: string
  isGenerating?: boolean
}

interface AppState {
  projects: Project[]
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  projectMessages: Record<string, ChatMessage[]>
  setProjectMessages: (projectId: string, messages: ChatMessage[] | ((prev: ChatMessage[] | undefined) => ChatMessage[])) => void
  getProjectMessages: (projectId: string) => ChatMessage[]
  models: AIModel[]
  selectedModel: AIModel | null
  setSelectedModel: (model: AIModel) => void
  user: User | null
  token: string | null
  setUser: (user: User | null, token?: string | null) => void
  clearUserData: () => void
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  authDialogOpen: boolean
  setAuthDialogOpen: (open: boolean) => void
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
  settingsTab: string
  setSettingsTab: (tab: string) => void
  libraryOpen: boolean
  setLibraryOpen: (open: boolean) => void
}

const defaultModels: AIModel[] = [
  { id: "nano-banana-pro", name: "Nano Banana Pro", provider: "Nano", description: "专业级画图模型", icon: "zap", capabilities: ["图像生成"] },
  { id: "nano-banana-2", name: "Nano Banana 2", provider: "Nano", description: "平衡性能与速度", icon: "sparkles", capabilities: ["文本生成", "图像生成"] },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      setCurrentProject: (project) => set({ currentProject: project }),
      addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
      updateProject: (id, updates) => set((state) => ({
          projects: state.projects.map((p) => p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p)
      })),
      deleteProject: (id) => set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),
      projectMessages: {},
      setProjectMessages: (projectId, messagesOrUpdater) => set((state) => {
          const next = typeof messagesOrUpdater === "function" ? messagesOrUpdater(state.projectMessages[projectId]) : messagesOrUpdater;
          return { projectMessages: { ...state.projectMessages, [projectId]: next } };
      }),
      getProjectMessages: (projectId) => get().projectMessages[projectId] ?? [],
      models: defaultModels,
      selectedModel: defaultModels[0],
      setSelectedModel: (model) => set({ selectedModel: model }),
      user: null,
      token: null,
      clearUserData: () => set({ projects: [], currentProject: null, projectMessages: {} }),
      setUser: (user, token = null) => {
        const currentId = get().user?.id
        if (user === null || user.id !== currentId) {
          get().clearUserData()
        }
        set({ user, token: token !== undefined ? token : get().token })
      },
      settings: { theme: "light", language: "zh-CN", defaultModel: "nano-banana-pro", autoSave: true, gridSnap: true },
      updateSettings: (updates) => set((state) => ({ settings: { ...state.settings, ...updates } })),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      authDialogOpen: false,
      setAuthDialogOpen: (open) => set({ authDialogOpen: open }),
      settingsOpen: false,
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      settingsTab: "general",
      setSettingsTab: (tab) => set({ settingsTab: tab }),
      libraryOpen: false,
      setLibraryOpen: (open) => set({ libraryOpen: open, currentProject: open ? null : get().currentProject }),
    }),
    { name: "banana-storage" }
  )
)
