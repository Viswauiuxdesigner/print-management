"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

/**
 * Reusable Button component with variants, sizes, and loading state.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        className={cn(
          // Base
          "inline-flex items-center justify-center gap-2",
          "font-medium rounded-lg",
          "transition-all duration-150",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60",
          // Sizes — flexible min-height to prevent multi-word Tamil text clipping
          size === "sm" && "min-h-[34px] px-3 py-1.5 text-xs sm:text-sm leading-tight text-center",
          size === "md" && "min-h-[44px] px-4 sm:px-5 py-2 sm:py-2.5 text-sm leading-normal text-center",
          size === "lg" && "min-h-[48px] px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base leading-normal text-center",
          // Variants
          variant === "primary" && [
            "bg-brand-600 text-white",
            "hover:bg-brand-700 active:bg-brand-800",
            "focus-visible:ring-brand-500",
            "shadow-sm hover:shadow",
          ],
          variant === "secondary" && [
            "bg-white text-slate-700 border border-slate-200",
            "hover:bg-slate-50 active:bg-slate-100",
            "focus-visible:ring-brand-500",
          ],
          variant === "ghost" && [
            "text-slate-600",
            "hover:bg-slate-100 active:bg-slate-200",
            "focus-visible:ring-brand-500",
          ],
          variant === "danger" && [
            "bg-red-600 text-white",
            "hover:bg-red-700 active:bg-red-800",
            "focus-visible:ring-red-500",
          ],
          className
        )}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
