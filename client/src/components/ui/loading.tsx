import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Loading({ size = "md", className }: LoadingProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={cn("relative", className)}>
        <img
          src="/logo.png"
          alt="Loading..."
          className={cn(
            "animate-spin-slow rounded-full",
            sizeClasses[size]
          )}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#BD00FF] to-transparent opacity-50 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
