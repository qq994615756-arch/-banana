"use client"

import { Sidebar } from "@/components/sidebar"
import { GeneratorView } from "@/components/generator-view"
import { WelcomeScreen } from "@/components/welcome-screen"
import { SettingsPage } from "@/components/settings-page"
import { AuthModal } from "@/components/auth-modal"
import { useAppStore } from "@/lib/store"

export default function Home() {
  const { currentProject, user, settingsOpen, setSettingsOpen, settingsTab, authDialogOpen, setAuthDialogOpen } = useAppStore()

  // If settings page is open, show full screen settings
  if (settingsOpen) {
    return (
      <SettingsPage
        initialTab={settingsTab}
        onBack={() => setSettingsOpen(false)}
      />
    )
  }

  return (
    <main className="h-screen flex overflow-hidden bg-background">
      {/* Auth Modal - shown as overlay with blurred background */}
      <AuthModal 
        open={!user || authDialogOpen} 
        onOpenChange={(open) => {
          setAuthDialogOpen(open)
        }} 
      />
      
      <Sidebar />
      <div className="flex-1 relative flex flex-col bg-background">
        {currentProject ? <GeneratorView /> : <WelcomeScreen />}
      </div>
    </main>
  )
}
