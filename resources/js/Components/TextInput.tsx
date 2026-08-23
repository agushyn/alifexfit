import React, { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: ReactNode;
    helperText?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
    label,
    error,
    icon,
    helperText,
    className,
    id,
    ...props
}, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                    {label}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#888888]">
                        {icon}
                    </div>
                )}
                <input
                    id={inputId}
                    ref={ref}
                    className={twMerge(
                        clsx(
                            "w-full h-10 px-3 bg-[#1a1a1a] text-white placeholder-[#5a5a5a] text-sm rounded-lg border transition-colors",
                            "focus:outline-none focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]",
                            icon ? "pl-10" : "pl-3",
                            error ? "border-[#ef4444] focus:ring-[#ef4444] focus:border-[#ef4444]" : "border-[#2a2a2a] hover:border-[#3a3a3a]",
                            className
                        )
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="mt-1 text-xs text-[#ef4444] font-medium">{error}</p>
            )}
            {helperText && !error && (
                <p className="mt-1 text-xs text-[#888888]">{helperText}</p>
            )}
        </div>
    );
});

TextInput.displayName = 'TextInput';