"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "./utils";

interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  htmlFor?: string;
  required?: boolean;
  visuallyHidden?: boolean;
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, htmlFor, required = false, visuallyHidden = false, ...props }, ref) => {
  return (
    <LabelPrimitive.Root
      ref={ref}
      data-slot="label"
      htmlFor={htmlFor}
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        visuallyHidden && "sr-only",
        className,
      )}
      {...props}
    >
      {props.children}
      {required && (
        <span 
          className="text-destructive" 
          aria-label="required"
          title="This field is required"
        >
          *
        </span>
      )}
    </LabelPrimitive.Root>
  );
});

Label.displayName = "Label";

export { Label };
