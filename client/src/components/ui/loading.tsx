
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  useText?: boolean;
  text?: string;
}

export function Loading({ 
  size = "md", 
  className, 
  useText = false,
  text = "Furry Nexus" 
}: LoadingProps) {
  const imageSizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };
  
  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={cn("relative", className)}>
        {useText ? (
          <span
            className={cn(
              "font-bold text-[#BD00FF] animate-spin-slow inline-block",
              textSizeClasses[size]
            )}
          >
            {text}
          </span>
        ) : (
          <img
            src="/Furry_Nexus_Circular_Logo-modified_1740863203668.png"
            alt="Loading..."
            className={cn(
              "animate-spin-slow rounded-full",
              imageSizeClasses[size]
            )}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#BD00FF] to-transparent opacity-50 rounded-full animate-pulse" />
      </div>
    </div>
  );
}
