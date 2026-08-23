import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { WebsiteBranding } from '@/types';
import { 
    Sparkles, 
    ArrowRight, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    Users,
    Award,
    ShieldCheck
} from 'lucide-react';

interface TrainersProps {
    branding: WebsiteBranding;
    trainers: Array<{
        id: number;
        name: string;
        role?: string | null;
        specialization: string;
        certification?: string | null;
        bio: string;
        profile_photo_url?: string | null;
        is_available_now: boolean;
        schedules: Array<{
            day_name: string;
            formatted_time_range: string;
        }>;
    }>;
}

export default function Trainers({ branding, trainers }: TrainersProps) {
    const { gym } = branding;
    const [selectedSpec, setSelectedSpec] = useState<string>('all');

    // Extract unique specializations
    const specializations = ['all', ...Array.from(new Set(trainers.map((t) => t.specialization).filter(Boolean)))];

    const filteredTrainers = trainers.filter((t) => {
        if (selectedSpec === 'all') return true;
        return t.specialization === selectedSpec;
    });

    return (
        <PublicLayout
            branding={branding}
            title="Certified Strength & Fitness Coaches"
            description={`Meet the certified personal trainers and fitness coaches at ${gym.name}. World-class coaching for strength, bodybuilding, hypertrophy, and functional endurance.`}
        >
            {/* Header Banner */}
            <section className="py-16 sm:py-24 border-b border-[#2a2a2a] bg-[#0c0c0c] relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#faff69]/10 blur-[150px] pointer-events-none rounded-full" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161616] border border-[#2a2a2a] text-xs font-semibold text-[#faff69] shadow-md">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>WORLD-CLASS CERTIFIED STRENGTH COACHES</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
                        PERSONAL TRAINERS
                    </h1>
                    <p className="text-sm sm:text-base text-[#cccccc] max-w-2xl mx-auto leading-relaxed">
                        Work with passionate, credentialed coaches dedicated to maximizing your physical performance through progressive overload and individualized biomechanics.
                    </p>

                    {/* Specialization Filter Tabs */}
                    {specializations.length > 2 && (
                        <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
                            {specializations.map((spec) => (
                                <button
                                    key={spec}
                                    type="button"
                                    onClick={() => setSelectedSpec(spec)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                                        selectedSpec === spec
                                            ? 'bg-[#faff69] text-[#0a0a0a] shadow-[0_0_15px_rgba(250,255,105,0.35)]'
                                            : 'bg-[#181818] text-[#888888] hover:text-white border border-[#2a2a2a]'
                                    }`}
                                >
                                    {spec === 'all' ? 'All Coaches' : spec}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Trainers Large 4:5 Photocard Grid */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {filteredTrainers.length === 0 ? (
                    <div className="text-center py-20 bg-[#141414] rounded-2xl border border-[#2a2a2a]">
                        <Users className="w-12 h-12 text-[#5a5a5a] mx-auto mb-3" />
                        <p className="text-sm text-[#888888]">No personal trainers found in this specialization category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredTrainers.map((coach) => (
                            <Link
                                key={coach.id}
                                href={route('public.trainers.show', coach.id)}
                                className="group relative rounded-3xl overflow-hidden bg-[#141414] border border-[#2a2a2a] hover:border-[#faff69]/70 transition-all duration-500 shadow-2xl flex flex-col justify-end aspect-[4/5]"
                            >
                                {/* Portrait Background Photo */}
                                <div className="absolute inset-0 z-0 bg-[#1a1a1a]">
                                    {coach.profile_photo_url ? (
                                        <img
                                            src={coach.profile_photo_url}
                                            alt={coach.name}
                                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#222222] to-[#111111] text-[#5a5a5a]">
                                            <Users className="w-20 h-20 mb-3 text-[#333333]" />
                                            <span className="text-3xl font-black text-[#faff69]/40 font-mono">
                                                {coach.name.slice(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                    )}

                                    {/* High Contrast Gradient Vignette */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/65 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
                                </div>

                                {/* Top Badge: Live Shift Status */}
                                <div className="absolute top-5 left-5 right-5 z-10 flex items-center justify-between">
                                    {coach.is_available_now ? (
                                        <span className="px-3.5 py-1.5 rounded-full bg-[#22c55e] text-[#0a0a0a] text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                            AVAILABLE NOW
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1.5 rounded-full bg-black/70 border border-white/10 text-[#cccccc] text-[11px] font-mono uppercase tracking-wider backdrop-blur-md">
                                            SCHEDULED
                                        </span>
                                    )}

                                    <div className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white group-hover:bg-[#faff69] group-hover:text-[#0a0a0a] transition-all">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Bottom Photocard Info */}
                                <div className="relative z-10 p-6 space-y-2.5">
                                    {/* Role Tag */}
                                    <div className="text-xs font-mono font-bold tracking-wider text-[#faff69] uppercase">
                                        {coach.role || 'Certified Strength Coach'}
                                    </div>

                                    {/* Trainer Name */}
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-[#faff69] transition-colors">
                                        {coach.name}
                                    </h2>

                                    {/* Specialization */}
                                    <div className="text-xs text-[#dddddd] flex items-center gap-1.5">
                                        <Award className="w-4 h-4 text-[#faff69] flex-shrink-0" />
                                        <span className="truncate">{coach.specialization || 'Strength & Conditioning'}</span>
                                    </div>

                                    {/* Certifications */}
                                    {coach.certification && (
                                        <div className="text-[11px] text-[#888888] font-mono truncate">
                                            {coach.certification}
                                        </div>
                                    )}

                                    {/* Active Weekly Shifts Summary */}
                                    {coach.schedules && coach.schedules.length > 0 && (
                                        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#888888]">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-[#5a5a5a]" />
                                                <span>{coach.schedules.length} shifts scheduled</span>
                                            </span>
                                            <span className="text-[#faff69] font-bold">View Hours &rarr;</span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </PublicLayout>
    );
}
