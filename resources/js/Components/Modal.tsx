import React, { Fragment, ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    maxWidth = 'md',
}) => {
    if (!isOpen) return null;

    const maxWidthClass = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    }[maxWidth];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />

                {/* Modal panel */}
                <div className={`relative w-full ${maxWidthClass} transform rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] p-6 text-left shadow-2xl transition-all`}>
                    <div className="flex items-center justify-between pb-4 border-b border-[#2a2a2a]">
                        <div>
                            {title && <h3 className="text-lg font-bold text-white">{title}</h3>}
                            {description && <p className="text-xs text-[#888888] mt-1">{description}</p>}
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-lg p-1 text-[#888888] hover:bg-[#242424] hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="mt-4">{children}</div>
                </div>
            </div>
        </div>
    );
};