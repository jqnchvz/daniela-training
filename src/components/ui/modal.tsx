"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Card } from "./card"

interface ModalProps {
  open: boolean
  onClose?: () => void
  children: React.ReactNode
  className?: string
}

function Modal({ open, onClose, children, className }: ModalProps) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/95 backdrop-blur-sm px-6"
      onClick={onClose}
    >
      <Card
        className={cn("w-full max-w-sm", className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </Card>
    </div>
  )
}

export { Modal }
export type { ModalProps }
