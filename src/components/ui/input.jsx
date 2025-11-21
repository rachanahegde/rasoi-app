import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-lg border-b-2 border-input border-t-0 border-x-0 bg-muted/50 px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:bg-background transition-colors",
        className
      )}
      {...props} />
  );
}

export { Input }
