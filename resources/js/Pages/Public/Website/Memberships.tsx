import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { WebsiteBranding } from '@/types';
import { 
    Check, 
    Zap, 
    ArrowRight, 
    ShieldCheck, 
    HelpCircle,
    Building2,
    Sparkles,
    X
} from 'lucide-react';

interface MembershipsProps {
    branding: WebsiteBranding;
    plans: Array<{
        id: number;
        name: string;
        description: string;
        price: number;
        formatted_price: string;
        duration_days: number;
        formatted_duration: string;
        trainer_quota_total: number;
        features: string[];
        is_featured: boolean;
    }>;
    faqs: Array<{
        id: number;
        question: string;
        answer: string;
    }>;
}

export default function Memberships({ branding, plans, faqs }: MembershipsProps) {
    const { gym, settings } = branding;
    const [selectedDuration, setSelectedDuration] = useState<string>('all');
    const [selectedPlanForModal, setSelectedPlanForModal] = useState<any | null>(null);

    const filteredPlans = plans.filter((p) => {
        if (selectedDuration === 'all') return true;
        if (selectedDuration === 'monthly') return p.duration_days <= 31;
        if (selectedDuration === 'quarterly') return p.duration_days > 31 && p.duration_days <= 93;
        if (selectedDuration === 'yearly') return p.duration_days >= 360;
        return true;
    });

    return (
        <PublicLayout 
            branding={branding}
            title="Membership Packages & Transparent Pricing"
            description={`Explore flexible gym memberships at ${gym.name}. Unlimited gym access, personal trainer quotas, and no hidden fees.`}
        >
            {/* Header Banner */}
            <section className="py-16 sm:py-24 border-b border-[#2a2a2a] bg-[#0f0f0f] relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#faff69]/10 blur-[130px] pointer-events-none rounded-full" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-xs font-semibold text-[#faff69]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>NO HIDDEN FEES • ALL INCLUSIVE ACCESS</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white uppercase leading-[1.05]">
                        MEMBERSHIP PACKAGES
                    </h1>
                    <p className="text-sm sm:text-base text-[#cccccc] max-w-2xl mx-auto leading-relaxed">
                        Choose the right training package for your fitness goals. Every membership includes full facility access, locker amenities, and professional coaching guidance.
                    </p>

                    {/* Filter Tabs */}
                    <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
                        {[
                            { id: 'all', label: 'All Plans' },
                            { id: 'monthly', label: '1 Month' },
                            { id: 'quarterly', label: '3 Months' },
                            { id: 'yearly', label: '1 Year' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setSelectedDuration(tab.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                    selectedDuration === tab.id
                                        ? 'bg-[#faff69] text-[#0a0a0a] shadow-[0_0_15px_rgba(250,255,105,0.3)]'
                                        : 'bg-[#1a1a1a] text-[#888888] hover:text-white border border-[#2a2a2a]'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Plans Grid */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {filteredPlans.length === 0 ? (
                    <div className="text-center py-16 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]">
                        <p className="text-sm text-[#888888]">No packages found for this duration filter.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
                        {filteredPlans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 ${
                                    plan.is_featured
                                        ? 'bg-[#faff69] text-[#0a0a0a] shadow-[0_0_40px_rgba(250,255,105,0.25)] scale-105 z-10'
                                        : 'bg-[#1a1a1a] text-white border border-[#2a2a2a] hover:border-[#3a3a3a]'
                                }`}
                            >
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-2xl font-extrabold uppercase tracking-tight">
                                            {plan.name}
                                        </h3>
                                        {plan.is_featured && (
                                            <span className="px-3 py-1 rounded-full bg-[#0a0a0a] text-[#faff69] text-[10px] font-black uppercase tracking-wider">
                                                MOST POPULAR
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <div className="text-3xl sm:text-4xl font-black font-mono">
                                            {plan.formatted_price}
                                        </div>
                                        <div className={`text-xs font-semibold mt-1 ${plan.is_featured ? 'text-[#333333]' : 'text-[#888888]'}`}>
                                            Valid for: {plan.formatted_duration} ({plan.duration_days} days)
                                        </div>
                                    </div>

                                    <p className={`text-xs leading-relaxed ${plan.is_featured ? 'text-[#222222]' : 'text-[#cccccc]'}`}>
                                        {plan.description}
                                    </p>

                                    <div className="pt-6 border-t border-current/15 space-y-3 text-xs font-medium">
                                        {plan.trainer_quota_total > 0 && (
                                            <div className="flex items-center gap-2.5 font-bold">
                                                <Zap className="w-4 h-4 flex-shrink-0" />
                                                <span>Includes {plan.trainer_quota_total} PT Sessions with Certified Coach</span>
                                            </div>
                                        )}
                                        {plan.features?.map((feat, idx) => (
                                            <div key={idx} className="flex items-center gap-2.5">
                                                <Check className="w-4 h-4 flex-shrink-0" />
                                                <span>{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 flex flex-col gap-2">
                                    <Link
                                        href={route('public.membership.register', { plan: plan.id, gym: gym.slug })}
                                        className={`w-full py-3.5 rounded-lg text-xs font-extrabold tracking-wider uppercase flex items-center justify-center gap-2 transition-all ${
                                            plan.is_featured
                                                ? 'bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white'
                                                : 'bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a]'
                                        }`}
                                    >
                                        <span>DAFTAR SEKARANG</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        href={route('public.leads.create', { plan_id: plan.id, gym: gym.slug })}
                                        className={`w-full py-2 rounded-lg text-[11px] font-bold tracking-wider uppercase text-center transition-colors ${
                                            plan.is_featured
                                                ? 'text-[#0a0a0a] bg-black/10 hover:bg-black/20'
                                                : 'text-[#faff69] hover:bg-[#222222]'
                                        }`}
                                    >
                                        TANYA MEMBERSHIP / KONSULTASI
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Value Guarantees Strip */}
            <section className="py-16 bg-[#121212] border-y border-[#2a2a2a]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="space-y-2">
                        <ShieldCheck className="w-8 h-8 text-[#faff69] mx-auto" />
                        <h3 className="text-base font-bold text-white uppercase">100% Guaranteed Facilities</h3>
                        <p className="text-xs text-[#cccccc] max-w-xs mx-auto">
                            Modern biomechanic strength equipment and sanitized sanitary facilities.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Zap className="w-8 h-8 text-[#faff69] mx-auto" />
                        <h3 className="text-base font-bold text-white uppercase">Certified Personal Coaching</h3>
                        <p className="text-xs text-[#cccccc] max-w-xs mx-auto">
                            Workout safely and reach your fitness PRs with professional coach guidance.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Building2 className="w-8 h-8 text-[#faff69] mx-auto" />
                        <h3 className="text-base font-bold text-white uppercase">Multi-Branch Ecosystem</h3>
                        <p className="text-xs text-[#cccccc] max-w-xs mx-auto">
                            Train conveniently at our flagship and regional gym locations across Indonesia.
                        </p>
                    </div>
                </div>
            </section>

            {/* Membership Modal (Phase 5 Information Flow) */}
            {selectedPlanForModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] max-w-md w-full p-6 text-white space-y-5 shadow-2xl relative">
                        <button
                            type="button"
                            onClick={() => setSelectedPlanForModal(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#242424] hover:bg-[#3a3a3a] text-[#888888] hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="space-y-2">
                            <span className="px-2.5 py-0.5 rounded bg-[#faff69]/10 text-[#faff69] text-[10px] font-mono font-bold uppercase">
                                HOW TO ACTIVATE MEMBERSHIP
                            </span>
                            <h3 className="text-xl font-bold uppercase">{selectedPlanForModal.name}</h3>
                            <div className="text-2xl font-extrabold font-mono text-[#faff69]">
                                {selectedPlanForModal.formatted_price}
                            </div>
                        </div>

                        <div className="bg-[#0f0f0f] rounded-xl p-4 border border-[#2a2a2a] text-xs text-[#cccccc] space-y-3">
                            <div className="font-semibold text-white">Join at Front Desk or via WhatsApp:</div>
                            <ol className="list-decimal list-inside space-y-1.5 text-[#cccccc]">
                                <li>Visit our front desk at <strong className="text-white">{gym.name}</strong>.</li>
                                <li>Show valid ID card (KTP / Passport) to our staff.</li>
                                <li>Get your instant QR access & membership activation.</li>
                            </ol>
                        </div>

                        <div className="flex flex-col gap-2 pt-2">
                            {settings.contact_whatsapp && (
                                <a
                                    href={`https://wa.me/${settings.contact_whatsapp.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(gym.name)},%20saya%20tertarik%20dengan%20paket%20${encodeURIComponent(selectedPlanForModal.name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold text-center uppercase tracking-wider transition-all"
                                >
                                    CHAT FRONT DESK VIA WHATSAPP
                                </a>
                            )}
                            <button
                                type="button"
                                onClick={() => setSelectedPlanForModal(null)}
                                className="w-full py-2.5 rounded-lg bg-[#242424] hover:bg-[#333333] text-xs font-semibold text-[#cccccc]"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
