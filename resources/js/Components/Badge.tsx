import React, { ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
    variant?: 'yellow' | 'active' | 'inactive' | 'emerald' | 'rose' | 'blue' | 'pill' | 'phase';
    size?: 'sm' | 'md';
    children: ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    variant = 'pill',
    size = 'md',
    children,
    className,
}) => {
    const variantStyles = {
        yellow: "bg-[#faff69] text-[#0a0a0a] font-semibold",
        active: "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 font-medium",
        inactive: "bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 font-medium",
        emerald: "bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 font-medium",
        rose: "bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 font-medium",
        blue: "bg-[#3b82f6]/15 text-[#3b82f6] border border-[#3b82f6]/30 font-medium",
        pill: "bg-[#1a1a1a] text-[#e6e6e6] border border-[#2a2a2a] font-medium",
        phase: "bg-[#242424] text-[#faff69] border border-[#faff69]/30 font-mono font-semibold uppercase tracking-wider",
    };

    const sizeStyles = {
        sm: "px-2 py-0.5 text-[11px] rounded-full",
        md: "px-2.5 py-1 text-xs rounded-full",
    };

    return (
        <span className={twMerge(clsx("inline-flex items-center gap-1.5 select-none", variantStyles[variant], sizeStyles[size], className))}>
            {children}
        </span>
    );
};