/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Send,
  Image as ImageIcon,
  Sparkles,
  ChevronDown,
  Paperclip,
  X,
  Zap,
  Brain,
  Wand2,
  RatioIcon,
  Hash,
  Download,
  Loader2,
  Copy,
  RefreshCw,
  Expand,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAppStore, type ChatMessage } from "@/lib/store"
import type { AIModel } from "@/lib/types"
import { ImageLightbox } from "@/components/image-lightbox"
import { toast } from "sonner"

const modelIcons: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="h-4 w-4" />,
  zap: <Zap className="h-4 w-4" />,
  brain: <Brain className="h-4 w-4" />,
  image: <Wand2 className="h-4 w-4" />,
}

// Image aspect ratio options
const aspectRatios = [
  { label: "1:1", value: "1:1" },
  { label: "1:4", value: "1:4" },
  { label: "4:1", value: "4:1" },
  { label: "1:8", value: "1:8" },
  { label: "8:1", value: "8:1" },
  { label: "2:3", value: "2:3" },
  { label: "3:2", value: "3:2" },
  { label: "3:4", value: "3:4" },
  { label: "4:3", value: "4:3" },
  { label: "4:5", value: "4:5" },
  { label: "5:4", value: "5:4" },
  { label: "9:16", value: "9:16" },
  { label: "16:9", value: "16:9" },
  { label: "21:9", value: "21:9" },
]

// Resolution options
const resolutions = [
  { label: "512", value: 512 },
  { label: "1K", value: 1024 },
  { label: "2K", value: 2048 },
  { label: "4K", value: 4096 },
]

// Quantity options
const quantities = [1, 2, 3, 4, 5, 6, 7, 8]

// Download image
async function downloadImage(url: string, filename: string) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = objectUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(objectUrl)
    toast.success("Image downloaded successfully")
  } catch {
    toast.error("Download failed, opening in new tab")
    window.open(url, "_blank")
  }
}

// Download AI message content (text + images)
async function downloadMessageContent(message: ChatMessage) {
  if (message.images && message.images.length > 0) {
    toast.info(`Downloading ${message.images.length} images...`)
    message.images.forEach((img, idx) => {
      downloadImage(img, `ai-image-${idx + 1}.jpg`)
    })
  } else {
    const blob = new Blob([message.content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ai-response.txt"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Text downloaded")
  }
}

// Loading Skeleton Component for image generation
function GeneratingImagesSkeleton({ quantity }: { quantity: number }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        <span className="text-sm">AI is creating your masterpiece...</span>
      </div>
      <div className={cn(
        "grid gap-3",
        quantity === 1 && "grid-cols-1 max-w-xs",
        quantity === 2 && "grid-cols-2",
        quantity >= 3 && "grid-cols-2 md:grid-cols-3",
        quantity >= 4 && "grid-cols-2 md:grid-cols-4"
      )}>
        {Array.from({ length: quantity }).map((_, idx) => (
          <div key={idx} className="relative aspect-square">
            <Skeleton className="w-full h-full rounded-xl" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-muted-foreground/30 border-t-blue-500 animate-spin" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Input Panel Component
interface InputPanelProps {
  input: string
  setInput: (v: string) => void
  attachmentPreviews: string[]
  removeAttachment: (i: number) => void
  isLoading: boolean
  selectedModel: AIModel | null
  models: AIModel[]
  setSelectedModel: (model: AIModel) => void
  selectedRatio: string
  setSelectedRatio: (v: string) => void
  selectedResolution: number
  setSelectedResolution: (v: number) => void
  selectedQuantity: number
  setSelectedQuantity: (v: number) => void
  onSubmit: () => void
  onFileClick: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

function InputPanel({
  input,
  setInput,
  attachmentPreviews,
  removeAttachment,
  isLoading,
  selectedModel,
  models,
  setSelectedModel,
  selectedRatio,
  setSelectedRatio,
  selectedResolution,
  setSelectedResolution,
  selectedQuantity,
  setSelectedQuantity,
  onSubmit,
  onFileClick,
  onKeyDown,
}: InputPanelProps) {
  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
      {/* Attachments Preview */}
      {attachmentPreviews.length > 0 && (
        <div className="px-5 pt-4 flex flex-wrap gap-3 border-b border-slate-200/30 dark:border-slate-700/30 pb-4">
          {attachmentPreviews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview}
                alt={`Attachment ${index + 1}`}
                className="h-20 w-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
              />
              <button
                onClick={() => removeAttachment(index)}
                className="absolute -top-3 -right-3 bg-destructive text-destructive-foreground rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-5">
        <Textarea
          placeholder="Describe the image you want to create, e.g.: A sunset over an ancient city, realistic photography style..."
          className="min-h-[80px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 text-base placeholder:text-muted-foreground/60 font-medium"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isLoading}
        />
      </div>

      {/* Bottom Bar */}
      <div className="px-5 pb-5 flex items-center justify-between border-t border-slate-200/30 dark:border-slate-700/30 pt-4">
        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:text-foreground text-xs px-3 h-9 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                disabled={isLoading}
              >
                {selectedModel && modelIcons[selectedModel.icon]}
                <span className="hidden sm:inline">{selectedModel?.name || "Select Model"}</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {models.map((model) => (
                <DropdownMenuItem
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={cn(
                    "flex items-start gap-3 py-3",
                    selectedModel?.id === model.id && "bg-muted border-l-2 border-foreground"
                  )}
                >
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0 text-foreground">
                    {modelIcons[model.icon]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{model.name}</span>
                      <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                        {model.provider}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{model.description}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Attachment Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-9 w-9 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            onClick={onFileClick}
            disabled={isLoading}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Divider */}
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

          {/* Quick Controls */}
          <div className="flex items-center gap-1">
            {/* Aspect Ratio */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground hover:text-foreground text-xs px-2 h-9 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  disabled={isLoading}
                >
                  <RatioIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{selectedRatio}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-32 max-h-64 overflow-y-auto">
                {aspectRatios.map((ratio) => (
                  <DropdownMenuItem
                    key={ratio.value}
                    onClick={() => setSelectedRatio(ratio.value)}
                    className={cn(
                      "justify-center text-sm",
                      selectedRatio === ratio.value && "bg-muted border-l-2 border-foreground"
                    )}
                  >
                    {ratio.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Resolution */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground hover:text-foreground text-xs px-2 h-9 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  disabled={isLoading}
                >
                  <span className="hidden sm:inline font-medium">
                    {resolutions.find((r) => r.value === selectedResolution)?.label}
                  </span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-28">
                {resolutions.map((res) => (
                  <DropdownMenuItem
                    key={res.value}
                    onClick={() => setSelectedResolution(res.value)}
                    className={cn(
                      "justify-center text-sm",
                      selectedResolution === res.value && "bg-muted border-l-2 border-foreground"
                    )}
                  >
                    {res.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Quantity */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-muted-foreground hover:text-foreground text-xs px-2 h-9 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                  disabled={isLoading}
                >
                  <Hash className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{selectedQuantity}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-20">
                {quantities.map((qty) => (
                  <DropdownMenuItem
                    key={qty}
                    onClick={() => setSelectedQuantity(qty)}
                    className={cn(
                      "justify-center text-sm",
                      selectedQuantity === qty && "bg-muted border-l-2 border-foreground"
                    )}
                  >
                    {qty}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          size="sm"
          className="gap-2 h-9 rounded-lg bg-foreground hover:bg-foreground/90 text-background shadow-md disabled:opacity-50"
          onClick={onSubmit}
          disabled={isLoading || (!input.trim())}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">Generating...</span>
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Generate</span>
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export function GeneratorView() {
  const { models, selectedModel, setSelectedModel, currentProject, projectMessages, setProjectMessages, token, setAuthDialogOpen } = useAppStore()

  const messages: ChatMessage[] = currentProject ? (projectMessages[currentProject.id] ?? []) : []

  const [input, setInput] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRatio, setSelectedRatio] = useState("1:1")
  const [selectedResolution, setSelectedResolution] = useState(1024)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const hasMessages = messages.length > 0

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const openLightbox = useCallback((images: string[], index: number) => {
    setLightboxImages(images)
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!input.trim() && attachments.length === 0) return
    if (!currentProject) return
    
    if (!token) {
      toast.error("请先登录后使用 AI 绘画功能")
      setAuthDialogOpen(true)
      return
    }

    if (isLoading) return 

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      images: attachmentPreviews.length > 0 ? [...attachmentPreviews] : undefined,
      timestamp: new Date().toISOString(),
    }

    const aiPlaceholder: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      role: "assistant",
      content: "Generating images...",
      timestamp: new Date().toISOString(),
      isGenerating: true,
    }

    const currentMessages = projectMessages[currentProject.id] ?? []
    const withUserAndPlaceholder = [...currentMessages, userMessage, aiPlaceholder]
    setProjectMessages(currentProject.id, withUserAndPlaceholder)
    setInput("")
    setAttachments([])
    setAttachmentPreviews([])
    setIsLoading(true)

    try {
      let generatedImages: string[] = [];
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          model: selectedModel?.id,
          ratio: selectedRatio,
          resolution: selectedResolution,
          quantity: selectedQuantity,
          images: userMessage.images,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || "API 请求失败");
      }

      const responseData = await response.json();
      generatedImages = responseData.images;

      if (!generatedImages || generatedImages.length === 0) {
        throw new Error("服务器未返回有效的图片");
      }

      const latestMessages = useAppStore.getState().projectMessages[currentProject.id] ?? withUserAndPlaceholder
      const updatedMessages = [...latestMessages]
      const lastIndex = updatedMessages.length - 1
      updatedMessages[lastIndex] = {
        ...updatedMessages[lastIndex],
        content: `Generated ${selectedQuantity} image${selectedQuantity > 1 ? 's' : ''}\nRatio: ${selectedRatio} | Resolution: ${resolutions.find((r) => r.value === selectedResolution)?.label}`,
        images: generatedImages,
        isGenerating: false,
      }
      setProjectMessages(currentProject.id, updatedMessages)
      toast.success(`Successfully generated ${selectedQuantity} image${selectedQuantity > 1 ? 's' : ''}!`)
    } catch (error) {
      const err = error as Error
      const latestMessages = useAppStore.getState().projectMessages[currentProject.id] ?? withUserAndPlaceholder
      const updatedMessages = [...latestMessages]
      const lastIndex = updatedMessages.length - 1
      updatedMessages[lastIndex] = {
        ...updatedMessages[lastIndex],
        content: err.message || "Image generation failed. Please try again.",
        isGenerating: false,
      }
      setProjectMessages(currentProject.id, updatedMessages)
      toast.error(err.message || "Generation failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }, [input, attachments, attachmentPreviews, currentProject, selectedQuantity, selectedRatio, selectedResolution, projectMessages, setProjectMessages, isLoading, token, setAuthDialogOpen, selectedModel])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments((prev) => [...prev, ...files])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAttachmentPreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
    setAttachmentPreviews((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }, [handleSubmit])

  const handleFileClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const inputPanelProps: InputPanelProps = {
    input,
    setInput,
    attachmentPreviews,
    removeAttachment,
    isLoading,
    selectedModel,
    models,
    setSelectedModel,
    selectedRatio,
    setSelectedRatio,
    selectedResolution,
    setSelectedResolution,
    selectedQuantity,
    setSelectedQuantity,
    onSubmit: handleSubmit,
    onFileClick: handleFileClick,
    onKeyDown: handleKeyDown,
  }

  // Empty state - no messages yet
  if (!hasMessages) {
    return (
      <>
        <div className="flex-1 flex items-center justify-center bg-background p-6 lg:p-12">
          <div className="w-full max-w-2xl">
            {/* Hero Section */}
            <div className="text-center space-y-6 mb-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-muted/60 border border-border/50">
                <ImageIcon className="h-10 w-10 text-foreground/80" />
              </div>
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-4">
                  AI Image Generation
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                  Describe your creative vision with words, and AI will generate stunning images for you. Unlimited possibilities at your fingertips.
                </p>
              </div>
            </div>
            <InputPanel {...inputPanelProps} />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>
        
        {/* Lightbox */}
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
        />
      </>
    )
  }

  // Chat state with messages
  return (
    <>
      <div className="flex-1 flex flex-col bg-background overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-8 w-full">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message, idx) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* AI Message - Left */}
                {message.role === "assistant" && (
                  <div className="max-w-[80%]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-muted/60 border border-border/50 flex items-center justify-center flex-shrink-0">
                        <Wand2 className="h-4 w-4 text-foreground/80" />
                      </div>
                      <span className="text-sm font-medium text-foreground">AI Studio</span>
                    </div>
                    <div className="relative group bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl rounded-tl-none p-5 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                      {/* Download button */}
                      {!message.isGenerating && message.images && message.images.length > 0 && (
                        <button
                          onClick={() => downloadMessageContent(message)}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Download all"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {message.isGenerating ? (
                        <GeneratingImagesSkeleton quantity={selectedQuantity} />
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground mb-4 pr-6">{message.content}</p>
                          {message.images && message.images.length > 0 && (
                            <div
                              className={cn(
                                "grid gap-3",
                                message.images.length === 1 && "grid-cols-1 max-w-xs",
                                message.images.length === 2 && "grid-cols-2",
                                message.images.length >= 3 && "grid-cols-2 md:grid-cols-3",
                                message.images.length >= 4 && "grid-cols-2 md:grid-cols-4"
                              )}
                            >
                              {message.images.map((img, imgIdx) => (
                                <div key={imgIdx} className="relative group/img">
                                  <img
                                    src={img}
                                    alt={`Generated image ${imgIdx + 1}`}
                                    className="w-full aspect-square object-cover rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => openLightbox(message.images!, imgIdx)}
                                  />
                                  {/* Image action buttons */}
                                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover/img:opacity-100 transition-opacity">
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="h-8 w-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 shadow-md hover:shadow-lg transition-all"
                                      title="Expand"
                                      onClick={() => openLightbox(message.images!, imgIdx)}
                                    >
                                      <Expand className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="h-8 w-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 shadow-md hover:shadow-lg transition-all"
                                      title="Download"
                                      onClick={() => downloadImage(img, `ai-image-${imgIdx + 1}.jpg`)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="h-8 w-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 shadow-md hover:shadow-lg transition-all"
                                      title="Copy"
                                      onClick={() => {
                                        navigator.clipboard.writeText(img)
                                        toast.success("Image URL copied to clipboard")
                                      }}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="h-8 w-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 shadow-md hover:shadow-lg transition-all"
                                      title="Regenerate"
                                      onClick={() => toast.info("Regenerate feature coming soon")}
                                    >
                                      <RefreshCw className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* User Message - Right */}
                {message.role === "user" && (
                  <div className="max-w-[80%]">
                    <div className="flex items-center gap-3 mb-3 justify-end">
                      <span className="text-sm font-medium text-foreground">You</span>
                      <div className="w-9 h-9 rounded-xl bg-muted/80 border border-border/50 flex items-center justify-center text-foreground font-medium text-sm flex-shrink-0">
                        U
                      </div>
                    </div>
                    <div className="bg-muted text-foreground rounded-2xl rounded-tr-none p-5 shadow-sm border border-border/30">
                      {/* User uploaded images */}
                      {message.images && message.images.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {message.images.map((img, imgIdx) => (
                            <img
                              key={imgIdx}
                              src={img}
                              alt={`Uploaded image ${imgIdx + 1}`}
                              className="h-16 w-16 object-cover rounded-lg border border-border/50 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => openLightbox(message.images!, imgIdx)}
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Input */}
        <div className="border-t border-slate-200/30 dark:border-slate-700/30 bg-background p-6 shrink-0">
          <div className="max-w-2xl mx-auto">
            <InputPanel {...inputPanelProps} />
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        initialIndex={lightboxIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </>
  )
}
