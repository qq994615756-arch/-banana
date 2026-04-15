"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Project, CanvasNode, AIModel, User, Settings } from "./types"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  images?: string[]
  timestamp: string // ISO string for serialization
  isGenerating?: boolean
}

interface AppState {
  // Projects
  projects: Project[]
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  addProject: (project: Project) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void

  // Per-project chat messages (persisted)
  projectMessages: Record<string, ChatMessage[]>
  setProjectMessages: (projectId: string, messages: ChatMessage[] | ((prev: ChatMessage[] | undefined) => ChatMessage[])) => void
  getProjectMessages: (projectId: string) => ChatMessage[]

  // Canvas
  selectedNode: CanvasNode | null
  setSelectedNode: (node: CanvasNode | null) => void
  addNode: (node: CanvasNode) => void
  updateNode: (id: string, updates: Partial<CanvasNode>) => void
  deleteNode: (id: string) => void

  // AI Models
  models: AIModel[]
  selectedModel: AIModel | null
  setSelectedModel: (model: AIModel) => void

  // User
  user: User | null
  setUser: (user: User | null) => void

  // Settings
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void

  // UI State
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void
  settingsTab: string
  setSettingsTab: (tab: string) => void
  newProjectDialogOpen: boolean
  setNewProjectDialogOpen: (open: boolean) => void
  authDialogOpen: boolean
  setAuthDialogOpen: (open: boolean) => void
}

const defaultModels: AIModel[] = [
  {
    id: "nano-banana-2",
    name: "Nano Banana 2",
    provider: "Nano",
    description: "强大的多模态模型，支持文本和图像生成",
    icon: "sparkles",
    capabilities: ["文本生成", "图像生成", "多模态"],
  },
  {
    id: "nano-banana-pro",
    name: "Nano Banana Pro",
    provider: "Nano",
    description: "专业级模型，更强的推理能力",
    icon: "zap",
    capabilities: ["高级推理", "代码编写", "分析"],
  },
]

const defaultSettings: Settings = {
  theme: "light",
  language: "zh-CN",
  defaultModel: "nano-banana-2",
  autoSave: true,
  gridSnap: true,
}

// No default user - start logged out
const defaultUser: User | null = null

// No sample projects - start with empty projects
const sampleProjects: Project[] = []

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Projects
      projects: sampleProjects,
      currentProject: null,
      setCurrentProject: (project) => set({ currentProject: project }),
      addProject: (project) =>
        set((state) => ({ projects: [project, ...state.projects] })),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, ...updates, updatedAt: new Date() }
              : state.currentProject,
        })),
      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject:
            state.currentProject?.id === id ? null : state.currentProject,
          projectMessages: Object.fromEntries(
            Object.entries(state.projectMessages).filter(([k]) => k !== id)
          ),
        })),

      // Per-project messages
      projectMessages: {},
      setProjectMessages: (projectId, messagesOrUpdater) =>
        set((state) => {
          const current = state.projectMessages[projectId]
          const next = typeof messagesOrUpdater === "function"
            ? messagesOrUpdater(current)
            : messagesOrUpdater
          return {
            projectMessages: {
              ...state.projectMessages,
              [projectId]: next,
            },
          }
        }),
      getProjectMessages: (projectId) => {
        return get().projectMessages[projectId] ?? []
      },

      // Canvas
      selectedNode: null,
      setSelectedNode: (node) => set({ selectedNode: node }),
      addNode: (node) =>
        set((state) => {
          if (!state.currentProject) return state
          const updatedProject = {
            ...state.currentProject,
            nodes: [...state.currentProject.nodes, node],
            updatedAt: new Date(),
          }
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
          }
        }),
      updateNode: (id, updates) =>
        set((state) => {
          if (!state.currentProject) return state
          const updatedProject = {
            ...state.currentProject,
            nodes: state.currentProject.nodes.map((n) =>
              n.id === id ? { ...n, ...updates } : n
            ),
            updatedAt: new Date(),
          }
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
          }
        }),
      deleteNode: (id) =>
        set((state) => {
          if (!state.currentProject) return state
          const updatedProject = {
            ...state.currentProject,
            nodes: state.currentProject.nodes.filter((n) => n.id !== id),
            updatedAt: new Date(),
          }
          return {
            currentProject: updatedProject,
            projects: state.projects.map((p) =>
              p.id === updatedProject.id ? updatedProject : p
            ),
            selectedNode:
              state.selectedNode?.id === id ? null : state.selectedNode,
          }
        }),

      // AI Models
      models: defaultModels,
      selectedModel: defaultModels[0],
      setSelectedModel: (model) => set({ selectedModel: model }),

      // User
      user: defaultUser,
      setUser: (user) => set({ user }),

      // Settings
      settings: defaultSettings,
      updateSettings: (updates) =>
        set((state) => ({ settings: { ...state.settings, ...updates } })),

      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      settingsOpen: false,
      setSettingsOpen: (open) => set({ settingsOpen: open }),
      settingsTab: "general",
      setSettingsTab: (tab) => set({ settingsTab: tab }),
      newProjectDialogOpen: false,
      setNewProjectDialogOpen: (open) => set({ newProjectDialogOpen: open }),
      authDialogOpen: false,
      setAuthDialogOpen: (open) => set({ authDialogOpen: open }),
    }),
    {
      name: "dynastream-storage",
      partialize: (state) => ({
        projects: state.projects,
        currentProject: state.currentProject,
        projectMessages: state.projectMessages,
        user: state.user,
        settings: state.settings,
        selectedModel: state.selectedModel,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
)
