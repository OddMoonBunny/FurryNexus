
import React from "react";
import { cn } from "@/lib/utils";

interface SiteTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  variant?: "default" | "small";
}

export function SiteTitle({
  className,
  variant = "default",
  ...props
}: SiteTitleProps) {
  return (
    <h1
      className={cn(
        "font-bold tracking-tight text-primary",
        variant === "default" ? "text-3xl" : "text-xl",
        className
      )}
      {...props}
    >
      Furrys Nexus
    </h1>
  );
}
