import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-[16px] border border-border bg-card p-4",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
Card.displayName = "Card"

export { Card }
