
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function Loading({ size = "md", className, text = "Furry Nexus" }: LoadingProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={cn("relative", className)}>
        <span
          className={cn(
            "font-bold text-[#BD00FF] animate-spin-slow inline-block",
            sizeClasses[size]
          )}
        >
          {text}
        </span>
        <div className="absolute inset-0 bg-gradient-to-t from-[#BD00FF] to-transparent opacity-50 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
