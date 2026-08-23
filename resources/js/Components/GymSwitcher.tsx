import React, { useState, useRef, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { Building2, ChevronDown, Check, ShieldCheck } from 'lucide-react';
import { PageProps, Gym } from '@/types';

export const GymSwitcher: React.FC = () => {
    const { gym, auth } = usePage<PageProps>().props;
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const isSuperAdmin = auth.user?.is_super_admin ?? false;
    const currentGym = gym.current;
    const availableGyms = gym.available || [];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSwitchGym = (targetGym: Gym) => {
        if (!isSuperAdmin || targetGym.id === currentGym?.id) {
            setIsOpen(false);
            return;
        }

        router.post(route('admin.gyms.switch', targetGym.id), {}, {
            preserveScroll: true,
            onFinish: () => setIsOpen(false),
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => isSuperAdmin && setIsOpen(!isOpen)}
                disabled={!isSuperAdmin}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-left transition-all border ${
                    isSuperAdmin
                        ? 'bg-[#1a1a1a] hover:bg-[#242424] border-[#2a2a2a] hover:border-[#3a3a3a] cursor-pointer'
                        : 'bg-[#121212] border-[#2a2a2a] cursor-default'
                }`}
            >
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-[#242424] text-[#faff69] border border-[#faff69]/20 font-bold text-xs">
                    <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate max-w-[150px] sm:max-w-[200px]">
                            {currentGym ? currentGym.name : 'All Gyms (Global)'}
                        </span>
                        {isSuperAdmin && (
                            <span className="text-[10px] bg-[#faff69]/15 text-[#faff69] px-1.5 py-0.5 rounded font-mono font-medium">
                                Cross-Gym
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#888888]">
                        <span className="font-mono">{currentGym ? currentGym.code : 'ROOT'}</span>
                        <span>•</span>
                        <span className="capitalize">{currentGym?.status ?? 'Active'}</span>
                    </div>
                </div>
                {isSuperAdmin && (
                    <ChevronDown className={`w-4 h-4 text-[#888888] transition-transform duration-150 ${isOpen ? 'rotate-180 text-white' : ''}`} />
                )}
            </button>

            {isOpen && isSuperAdmin && (
                <div className="absolute left-0 mt-2 w-72 origin-top-left rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-2 border-b border-[#2a2a2a]">
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-[#888888]">Select Active Gym Context</p>
                        <p className="text-xs text-[#cccccc] mt-0.5">Switch tenant scope across branches</p>
                    </div>

                    <div className="max-h-60 overflow-y-auto py-1 divide-y divide-[#2a2a2a]/40">
                        {availableGyms.map((g) => {
                            const isSelected = g.id === currentGym?.id;
                            return (
                                <button
                                    key={g.id}
                                    type="button"
                                    onClick={() => handleSwitchGym(g)}
                                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors hover:bg-[#242424] cursor-pointer ${
                                        isSelected ? 'bg-[#242424] text-[#faff69]' : 'text-white'
                                    }`}
                                >
                                    <div>
                                        <div className="font-semibold">{g.name}</div>
                                        <div className="text-[11px] text-[#888888] font-mono mt-0.5">
                                            {g.code} • <span className={g.status === 'active' ? 'text-[#22c55e]' : 'text-[#ef4444]'}>{g.status}</span>
                                        </div>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-[#faff69]" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};