"use client"

import { useState, useRef, useEffect } from "react"
import { SendHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ChatInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setInput("")
  }

  return (
    <div className="border-t border-border bg-card px-4 py-3 lg:px-6">
      <div className="mx-auto flex max-w-2xl items-end gap-2">
        <div className="flex-1 rounded-xl border border-input bg-background px-3 py-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-ring/30">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder={"请描述您的售后问题..."}
            disabled={disabled}
            className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={disabled || !input.trim()}
          className="h-10 w-10 shrink-0 rounded-xl"
        >
          <SendHorizontal className="h-4 w-4" />
          <span className="sr-only">{"发送消息"}</span>
        </Button>
      </div>
    </div>
  )
}
