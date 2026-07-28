import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"

import { cn } from "@/lib/utils"

function Collapsible({ className, ...props }: CollapsiblePrimitive.Root.Props) {
  return (
    <CollapsiblePrimitive.Root
      data-slot="collapsible"
      className={cn("flex flex-col", className)}
      {...props}
    />
  )
}

function CollapsibleTrigger({
  className,
  ...props
}: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        "group flex w-full items-center justify-between gap-2 text-left",
        className
      )}
      {...props}
    />
  )
}

function CollapsiblePanel({
  className,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-panel"
      className={cn(
        "overflow-hidden data-[ending-style]:h-0 data-[starting-style]:h-0",
        className
      )}
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsiblePanel }
