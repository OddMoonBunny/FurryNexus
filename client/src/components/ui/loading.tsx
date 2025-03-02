
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({ size = "md", className }: LoadingProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-24 h-24",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative">
        <img
          src="/paw-circuit-logo.png"
          alt="Loading..."
          className={cn(
            "rounded-full",
            sizeClasses[size]
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#BD00FF] to-transparent opacity-70 rounded-full animate-pulse" />
      </div>
    </div>
  );
}

export default Loading;
