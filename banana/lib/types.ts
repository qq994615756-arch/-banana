export interface Project {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  nodes: CanvasNode[]
  thumbnail?: string
}

export interface CanvasNode {
  id: string
  type: "text" | "image" | "ai-response"
  position: { x: number; y: number }
  size: { width: number; height: number }
  content: string
  model?: string
  createdAt: Date
}

export interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  icon: string
  capabilities: string[]
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  plan: "free" | "pro" | "enterprise"
}

export interface Settings {
  theme: "dark" | "light" | "system"
  language: "zh-CN" | "en-US"
  defaultModel: string
  autoSave: boolean
  gridSnap: boolean
}
