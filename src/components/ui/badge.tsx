import * as React from "react"

import { cn } from "@/lib/utils"

type BadgeVariant = "sage" | "gold" | "muted"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantClasses: Record<BadgeVariant, string> = {
  sage: "bg-sage-bg text-sage",
  gold: "bg-gold-bg text-gold",
  muted: "bg-muted text-muted-foreground",
}

function Badge({ className, variant = "muted", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge }
export type { BadgeProps, BadgeVariant }
