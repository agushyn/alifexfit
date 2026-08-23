import React, { ReactNode } from 'react';
import { Dumbbell } from 'lucide-react';
import { FlashMessage } from '@/Components/FlashMessage';

export interface GuestLayoutProps {
    children: ReactNode;
}

export const GuestLayout: React.FC<GuestLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
            {/* Background grid ambient effect */}
            <div className="absolute inset-0 bg-[radial-gradient(#2a2a2a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

            {/* Glowing brand voltage orb */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#faff69]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                {/* Header Brand */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] text-[#faff69] mb-4 shadow-xl shadow-black/60">
                        <Dumbbell className="w-8 h-8 stroke-[2.5]" />
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
                        EXFITS <span className="text-[#faff69]">GYM</span>
                    </h1>
                    <p className="text-xs uppercase tracking-widest text-[#888888] font-semibold mt-1">
                        Management System • Architecture v1.0
                    </p>
                </div>

                {/* Card Container */}
                {children}

                {/* Footer Copyright */}
                <div className="text-center mt-8 text-xs text-[#5a5a5a]">
                    © {new Date().getFullYear()} EXFITS Gym System. Enterprise Multi-Tenant Architecture.
                </div>
            </div>

            <FlashMessage />
        </div>
    );
};