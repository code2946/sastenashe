"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
// import { useChat } from "ai/react" // Not available in AI v5.x
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Bot, User, Sparkles, Film, RotateCcw, AlertCircle, X, Minimize2, Maximize2, Brain, Zap, Stars } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

const SUGGESTED_PROMPTS = [
  "Recommend me a thriller like Gone Girl",
  "What's a good comedy for tonight?",
  "Best sci-fi movies of 2024",
  "Movies similar to Inception",
  "Hidden gem movies I should watch",
  "Best movies for a date night",
]

// Simple function to convert basic markdown to HTML
function parseMarkdown(text: string): string {
  return text
    // Bold text: **text** -> <strong>text</strong>
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    // Italic text: *text* -> <em>text</em>  
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Line breaks
    .replace(/\n/g, '<br />')
}

export function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [authUser, setAuthUser] = useState<any | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Simple chat state replacement for useChat
  const [messages, setMessages] = useState<Array<{id: string, role: 'user' | 'assistant', content: string}>>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const userMessage = { id: Date.now().toString(), role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)
    setShowSuggestions(false)

    // Create placeholder assistant message for streaming
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage = { 
      id: assistantMessageId, 
      role: 'assistant' as const, 
      content: "" 
    }
    setMessages(prev => [...prev, assistantMessage])

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage], stream: true })
      })
      
      if (!response.ok) throw new Error('Failed to get response')
      
      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      setIsLoading(false) // Stop loading, start streaming
      let accumulatedContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.error) {
                throw new Error(data.error)
              }
              
              if (data.text) {
                accumulatedContent += data.text
                // Update the assistant message content
                setMessages(prev => 
                  prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                )
              }
              
              if (data.done) {
                return // Streaming complete
              }
            } catch (parseError) {
              // Ignore malformed JSON chunks
            }
          }
        }
      }
    } catch (err) {
      setError(err as Error)
      console.error("Chat error:", err)
      // Update the assistant message with error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: "Sorry, I couldn't process that request." }
            : msg
        )
      )
      setIsLoading(false)
    }
  }

  const reload = () => {
    setMessages([])
    setError(null)
    setShowSuggestions(true)
  }

  // Check authentication
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSuggestedPrompt = (prompt: string) => {
    handleInputChange({ target: { value: prompt } } as any)
    setShowSuggestions(false)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      handleSubmit(e)
      setShowSuggestions(false)
    }
  }

  const resetChat = () => {
    window.location.reload() // Simple way to reset chat
  }

  // Add smooth opening effect
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll immediately for smooth experience
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 h-14 w-14 sm:h-16 sm:w-16 rounded-2xl shadow-xl bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white z-50 transition-all duration-200 active:scale-95 border-0"
        >
          <div className="relative flex items-center justify-center">
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
          </div>
        </Button>
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[90vh] sm:h-[85vh] flex flex-col gap-0 bg-slate-950 text-white border-slate-800 p-0 animate-in slide-in-from-bottom-2 fade-in-0 duration-200">
        {/* Header */}
        <SheetHeader className="relative p-3 sm:p-4 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-lg">
          <div className="relative flex items-center justify-between">
            <SheetTitle className="text-base sm:text-lg font-semibold text-white flex items-center gap-2.5 sm:gap-3">
              {/* Clean Avatar */}
              <div className="relative">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" strokeWidth={2.5} />
                </div>
                {/* Status indicator */}
                <div className="absolute -bottom-0.5 -right-0.5">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                </div>
              </div>

              <div className="flex flex-col">
                <div className="text-sm sm:text-base font-semibold text-white">
                  CineSensei
                </div>
                <div className="text-xs font-normal text-slate-400">
                  AI Movie Expert
                </div>
              </div>
            </SheetTitle>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={resetChat}
                className="h-9 w-9 sm:h-8 sm:w-8 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors active:scale-95"
                title="New Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!authUser && (
            <div className="relative mt-2.5 sm:mt-3 bg-slate-800/50 border border-slate-700/50 rounded-lg p-2.5 sm:p-3 backdrop-blur-sm">
              <div className="relative flex items-start gap-2">
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Film className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    <span className="font-medium text-white">Guest Mode</span> - <span className="hidden sm:inline">Chat without signing in! Sign in later for personalized recommendations.</span><span className="sm:hidden">Sign in for personalized recs.</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </SheetHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 px-3 sm:px-6 bg-slate-950" ref={scrollAreaRef}>
          <div className="space-y-3 sm:space-y-4 py-4 sm:py-6">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="text-center py-6 sm:py-8 px-3 sm:px-4 max-w-2xl mx-auto">
                {/* Clean Hero Avatar */}
                <div className="relative mx-auto mb-4 sm:mb-6 w-14 h-14 sm:w-16 sm:h-16">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-xl">
                    <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8 text-white" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Welcome Text */}
                <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Welcome to CineSensei
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-md mx-auto px-2">
                    Get personalized movie recommendations, detailed reviews, and discover your next favorite film.
                  </p>
                </div>

                {/* Suggested Prompts */}
                {showSuggestions && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium mb-3 sm:mb-4">
                      <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-500" />
                      <span>Try asking</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                      {SUGGESTED_PROMPTS.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={() => handleSuggestedPrompt(prompt)}
                          className="group bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-yellow-500/40 hover:bg-slate-800 active:scale-98 text-left justify-start h-auto py-3 sm:py-3 px-3 sm:px-3.5 rounded-lg transition-all duration-200 touch-manipulation"
                        >
                          <div className="flex items-center gap-2 sm:gap-2.5 w-full">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-slate-800 group-hover:bg-yellow-500/10 flex items-center justify-center flex-shrink-0 transition-colors">
                              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-yellow-500" />
                            </div>
                            <span className="text-xs font-medium leading-relaxed">{prompt}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-2 sm:gap-3 group",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                )}

                <div className="flex flex-col max-w-[85%] sm:max-w-[80%] min-w-0">
                  <div
                    className={cn(
                      "rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm shadow-lg",
                      message.role === "user"
                        ? "bg-yellow-500 text-white ml-auto"
                        : "bg-slate-900 text-slate-100 border border-slate-800",
                    )}
                  >
                    {message.content ? (
                      <div
                        className="leading-relaxed [&>strong]:font-semibold [&>strong]:text-white [&>em]:italic text-xs sm:text-sm"
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" />
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <span className="text-xs ml-1.5">Thinking...</span>
                      </div>
                    )}
                  </div>

                  {message.role === "assistant" && message.content && (
                    <div className="flex items-center gap-1.5 mt-1.5 ml-1">
                      <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-600" />
                      <span className="text-xs text-slate-600">AI</span>
                    </div>
                  )}
                </div>

                {message.role === "user" && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 shadow-md border border-slate-700">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                  </div>
                )}
              </div>
            ))}

            {/* Loading State */}
            {isLoading && (
              <div className="flex gap-2 sm:gap-3 justify-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md">
                    <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-pulse" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className="text-xs sm:text-sm text-slate-300">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-950/50 border border-red-900/50 rounded-lg p-3 sm:p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400" />
                  </div>
                  <p className="text-red-300 text-xs sm:text-sm font-medium">Something went wrong</p>
                </div>
                <p className="text-red-400/80 text-xs mb-3 max-w-sm mx-auto">
                  {error.message || "Please try again"}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => reload()}
                  className="border-red-800 text-red-300 hover:bg-red-950 hover:border-red-700 rounded-lg active:scale-95 touch-manipulation"
                >
                  <RotateCcw className="w-3 h-3 mr-1.5" />
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Form */}
        <div className="relative border-t border-slate-800 bg-slate-900/95 backdrop-blur-lg p-3 sm:p-4 pb-safe">
          <div className="relative">
            <form onSubmit={handleFormSubmit} className="flex items-end gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about movies..."
                  className="bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 resize-none min-h-[44px] sm:min-h-[48px] max-h-32 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-colors shadow-sm touch-manipulation"
                  rows={1}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleFormSubmit(e)
                    }
                  }}
                />
              </div>

              {/* Send button */}
              <Button
                type="submit"
                size="icon"
                className="bg-gradient-to-br from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 active:scale-95 text-white rounded-xl h-11 w-11 sm:h-12 sm:w-12 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation flex-shrink-0"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4 sm:h-4.5 sm:w-4.5" strokeWidth={2.5} />
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="flex items-center justify-between mt-2 sm:mt-3">
              <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  <span className="text-xs">Ready</span>
                </div>
                <span className="text-slate-700 hidden sm:inline">•</span>
                <span className="hidden sm:inline text-xs">Enter to send • Shift+Enter for new line</span>
              </div>

              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reload}
                  className="h-7 px-2 text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800 active:scale-95 rounded-lg touch-manipulation"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
