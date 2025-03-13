"use client"

import React, { createContext, useContext, useState } from "react"
import { Toast, ToastProps } from "./toast"

interface ToastContextType {
  toast: (props: ToastProps) => void
  toasts: ToastProps[]
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([])

  const toast = (props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...props, id }])
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast, toasts, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            status={toast.status}
            onClick={() => removeToast(toast.id)}
            className="cursor-pointer"
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

// Función para crear un toast sin necesidad de hooks
export const toast = (props: ToastProps) => {
  // Fallback para cuando ToastProvider no está disponible
  const toastDiv = document.createElement("div")
  toastDiv.className = `fixed top-4 right-4 z-50 p-4 rounded-md shadow-md ${
    props.status === "success" ? "bg-green-100 text-green-800" :
    props.status === "error" ? "bg-red-100 text-red-800" :
    props.status === "warning" ? "bg-yellow-100 text-yellow-800" :
    props.status === "info" ? "bg-blue-100 text-blue-800" :
    "bg-white text-gray-800"
  }`
  
  const titleDiv = document.createElement("div")
  titleDiv.className = "font-semibold"
  titleDiv.textContent = props.title || ""
  toastDiv.appendChild(titleDiv)
  
  if (props.description) {
    const descDiv = document.createElement("div")
    descDiv.className = "text-sm mt-1"
    descDiv.textContent = props.description
    toastDiv.appendChild(descDiv)
  }
  
  document.body.appendChild(toastDiv)
  
  setTimeout(() => {
    toastDiv.style.opacity = "0"
    toastDiv.style.transition = "opacity 0.3s ease"
    setTimeout(() => {
      document.body.removeChild(toastDiv)
    }, 300)
  }, 5000)
} 