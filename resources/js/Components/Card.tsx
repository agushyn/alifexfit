import React, { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'yellow' | 'outline';
    children: ReactNode;
}

export const Card: React.FC<CardProps> = ({
    variant = 'default',
    className,
    children,
    ...props
}) => {
    const variantStyles = {
        default: "bg-[#1a1a1a] border border-[#2a2a2a] text-white",
        elevated: "bg-[#242424] border border-[#3a3a3a] text-white",
        yellow: "bg-[#faff69] text-[#0a0a0a] border border-[#faff69]",
        outline: "bg-transparent border border-[#2a2a2a] text-white",
    };

    return (
        <div
            className={twMerge(
                clsx(
                    "rounded-xl p-5 sm:p-6 transition-all duration-150",
                    variantStyles[variant],
                    className
                )
            )}
            {...props}
        >
            {children}
        </div>
    );
};