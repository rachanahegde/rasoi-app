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
        "flex h-11 w-full rounded-lg border-b-2 border-stone-200 border-t-0 border-x-0 bg-stone-50/50 px-3 py-2 text-sm placeholder:text-stone-400 focus-visible:outline-none focus-visible:border-stone-800 focus-visible:bg-white transition-colors",
        className
      )}
      {...props} />
  );
}

export { Input }
