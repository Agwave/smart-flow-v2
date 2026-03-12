"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { ChatHeader } from "@/components/chat-header"
import { MessageList } from "@/components/message-list"
import { ChatInput } from "@/components/chat-input"
import { QuickReplies } from "@/components/quick-replies"
import { ServiceSidebar } from "@/components/service-sidebar"
import { WelcomeBanner } from "@/components/welcome-banner"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

export default function Home() {
  const [chatKey, setChatKey] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const handleSend = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return
      
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
      }
      setMessages(prev => [...prev, userMessage])
      setIsLoading(true)

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "",
      }
      setMessages(prev => [...prev, assistantMessage])

      abortRef.current = new AbortController()
      
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({
              id: m.id,
              role: m.role,
              content: m.content,
            })),
          }),
          signal: abortRef.current.signal,
        })

        if (!response.ok) throw new Error("API error")
        
        const reader = response.body?.getReader()
        if (!reader) throw new Error("No reader")

        const decoder = new TextDecoder()
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === "content" && data.text) {
                  setMessages(prev => {
                    const last = prev[prev.length - 1]
                    if (last?.role === "assistant") {
                      return [
                        ...prev.slice(0, -1),
                        { ...last, content: last.content + data.text },
                      ]
                    }
                    return prev
                  })
                }
              } catch {}
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error(err)
        }
      } finally {
        setIsLoading(false)
        abortRef.current = null
      }
    },
    [messages, isLoading]
  )

  const handleReset = useCallback(() => {
    abortRef.current?.abort()
    setChatKey(k => k + 1)
    setMessages([])
    setIsLoading(false)
  }, [])

  const hasMessages = messages.length > 0

  return (
    <div className="flex h-dvh flex-col bg-background">
      <ChatHeader onReset={handleReset} />
      <div className="flex flex-1 overflow-hidden">
        <main className="flex flex-1 flex-col overflow-hidden">
          {!hasMessages ? (
            <div className="flex flex-1 flex-col overflow-y-auto">
              <WelcomeBanner />
              <QuickReplies onSelect={handleSend} disabled={isLoading} />
            </div>
          ) : (
            <MessageList messages={messages} isLoading={isLoading} />
          )}
          {hasMessages && (
            <QuickReplies onSelect={handleSend} disabled={isLoading} />
          )}
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </main>
        <ServiceSidebar />
      </div>
    </div>
  )
}
