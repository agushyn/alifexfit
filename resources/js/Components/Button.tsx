import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    children,
    ...props
}, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none";

    const variantStyles = {
        primary: "bg-[#faff69] text-[#0a0a0a] hover:bg-[#e6eb52] active:bg-[#d8dd45] focus:ring-[#faff69]",
        secondary: "bg-[#1a1a1a] text-white border border-[#2a2a2a] hover:bg-[#242424] hover:border-[#3a3a3a] focus:ring-[#faff69]",
        outline: "bg-transparent text-white border border-[#2a2a2a] hover:bg-[#1a1a1a] hover:border-[#3a3a3a] focus:ring-[#faff69]",
        danger: "bg-[#ef4444] text-white hover:bg-[#dc2626] focus:ring-[#ef4444]",
        ghost: "bg-transparent text-[#cccccc] hover:text-white hover:bg-[#1a1a1a] focus:ring-[#faff69]",
    };

    const sizeStyles = {
        sm: "h-8 px-3 text-xs rounded-md gap-1.5",
        md: "h-10 px-4 text-sm rounded-lg gap-2",
        lg: "h-12 px-6 text-base rounded-lg gap-2.5",
    };

    return (
        <button
            ref={ref}
            disabled={disabled || isLoading}
            className={twMerge(clsx(baseStyles, variantStyles[variant], sizeStyles[size], className))}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {children}
        </button>
    );
});

Button.displayName = 'Button';