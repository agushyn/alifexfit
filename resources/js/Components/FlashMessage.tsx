import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { PageProps } from '@/types';

export const FlashMessage: React.FC = () => {
    const { flash } = usePage<PageProps>().props;
    const [visible, setVisible] = useState(false);
    const [currentMessage, setCurrentMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

    useEffect(() => {
        if (flash.success) {
            setCurrentMessage({ type: 'success', text: flash.success });
            setVisible(true);
        } else if (flash.error) {
            setCurrentMessage({ type: 'error', text: flash.error });
            setVisible(true);
        } else if (flash.info) {
            setCurrentMessage({ type: 'info', text: flash.info });
            setVisible(true);
        }
    }, [flash]);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible || !currentMessage) return null;

    const styles = {
        success: "bg-[#1a1a1a] border-[#22c55e]/50 text-[#22c55e]",
        error: "bg-[#1a1a1a] border-[#ef4444]/50 text-[#ef4444]",
        info: "bg-[#1a1a1a] border-[#3b82f6]/50 text-[#3b82f6]",
    };

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#22c55e]" />,
        error: <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#ef4444]" />,
        info: <Info className="w-5 h-5 flex-shrink-0 text-[#3b82f6]" />,
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md ${styles[currentMessage.type]}`}>
                {icons[currentMessage.type]}
                <div className="flex-1 text-sm font-medium text-white">
                    {currentMessage.text}
                </div>
                <button
                    onClick={() => setVisible(false)}
                    className="text-[#888888] hover:text-white transition-colors cursor-pointer"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};