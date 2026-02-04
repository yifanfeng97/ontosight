import * as React from "react"

import { cn } from "@/utils"

const Spinner = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    size?: "sm" | "md" | "lg"
  }
>(({ className, size = "md", ...props }, ref) => {
  const sizeClasses = {
    sm: "h-4 w-4 border",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-2",
  }[size]

  return (
    <div
      ref={ref}
      className={cn(
        "animate-spin rounded-full border-current border-t-transparent",
        sizeClasses,
        className
      )}
      {...props}
    />
  )
})
Spinner.displayName = "Spinner"

export { Spinner }
