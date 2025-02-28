"use client"
import * as React from "react"
import { cn } from "@/app/components/lib/shadcn"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger>
>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <CollapsiblePrimitive.Trigger
      ref={ref}
      className={cn("select-none", className)}
      {...rest}
    />
  );
});

CollapsibleTrigger.displayName = "CollapsibleTrigger";

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
