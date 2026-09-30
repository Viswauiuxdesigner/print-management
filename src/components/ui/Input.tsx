"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

/**
 * Reusable Input component with label, error state and accessible attributes.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          className={cn(
            // Base styles
            "w-full rounded-lg border bg-white px-4 py-3 text-sm text-slate-900",
            "placeholder:text-slate-400",
            "transition-colors duration-150",
            // Focus styles
            "outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-0 focus:border-brand-500",
            // Default border
            "border-slate-200",
            // Error styles
            error && "border-red-400 focus:ring-red-400 focus:border-red-400",
            // Disabled styles
            "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500",
            // Min height for mobile touch targets
            "min-h-[48px]",
            className
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error && id ? `${id}-error` : undefined}
          ref={ref}
          {...props}
        />
        {error && (
          <p
            id={id ? `${id}-error` : undefined}
            role="alert"
            className="mt-1.5 text-xs sm:text-sm text-red-600 flex items-start gap-1.5 leading-snug break-words"
          >
            <svg
              className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="break-words">{error}</span>
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
