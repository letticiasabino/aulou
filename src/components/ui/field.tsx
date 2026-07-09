import * as React from "react";
import { cn } from "@/lib/utils";

function FieldGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-4", className)} {...props} />;
}

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { orientation?: "vertical" | "horizontal" }) {
  return (
    <div
      className={cn(
        "flex gap-2 data-[invalid=true]:text-destructive",
        orientation === "horizontal" ? "items-center justify-between" : "flex-col",
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-6 text-muted-foreground", className)} {...props} />;
}

function FieldError({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-6 text-destructive", className)} {...props} />;
}

export { Field, FieldDescription, FieldError, FieldGroup };
