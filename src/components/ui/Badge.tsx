import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "neutral" | "warning" | "danger" | "brand";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center font-medium rounded-full",
        // Size
        size === "sm" && "px-2 py-0.5 text-xs",
        size === "md" && "px-2.5 py-1 text-xs",
        // Variants
        variant === "success" && "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20",
        variant === "neutral" && "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/10",
        variant === "warning" && "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20",
        variant === "danger" && "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20",
        variant === "brand" && "bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-600/20",
        className
      )}
    >
      {children}
    </span>
  );
}
