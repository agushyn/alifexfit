import { Link } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { WebsiteBranding } from '@/types';
import { 
    Calendar, 
    Clock, 
    ArrowLeft, 
    Sparkles, 
    CheckCircle2, 
    Phone, 
    Award,
    ShieldCheck,
    Users,
    Building2
} from 'lucide-react';

interface TrainerShowProps {
    branding: WebsiteBranding;
    trainer: {
        id: number;
        name: string;
        role?: string | null;
        specialization: string;
        certification?: string | null;
        bio: string;
        profile_photo_url?: string | null;
        schedules: Array<{
            day_of_week: number;
            day_name: string;
            formatted_time_range: string;
        }>;
    };
}

export default function TrainerShow({ branding, trainer }: TrainerShowProps) {
    const { gym, settings } = branding;

    return (
        <PublicLayout
            branding={branding}
            title={`${trainer.name} - ${trainer.role || 'Personal Trainer'}`}
            description={`Book personal training sessions with Coach ${trainer.name} at ${gym.name}. Specializing in ${trainer.specialization || 'Strength & Conditioning'}.`}
        >
            <div className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <div className="mb-8">
                    <Link
                        href={route('public.trainers')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#888888] hover:text-[#faff69] transition-colors uppercase tracking-wider"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>BACK TO ALL COACHES</span>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Large Portrait 4:5 Photocard & Action Card */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* 4:5 Portrait Photocard */}
                        <div className="relative rounded-3xl overflow-hidden bg-[#141414] border border-[#2a2a2a] shadow-2xl aspect-[4/5] flex flex-col justify-end">
                            {/* Background Photo */}
                            <div className="absolute inset-0 z-0 bg-[#1c1c1c]">
                                {trainer.profile_photo_url ? (
                                    <img 
                                        src={trainer.profile_photo_url} 
                                        alt={trainer.name} 
                                        className="w-full h-full object-cover object-top"
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#222222] to-[#111111] text-[#5a5a5a]">
                                        <Users className="w-20 h-20 mb-3 text-[#333333]" />
                                        <span className="text-4xl font-black text-[#faff69]/40 font-mono">
                                            {trainer.name.slice(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                            </div>

                            {/* Photocard Overlay Info */}
                            <div className="relative z-10 p-6 space-y-2">
                                <div className="text-xs font-mono font-bold tracking-wider text-[#faff69] uppercase">
                                    {trainer.role || 'Certified Strength Coach'}
                                </div>
                                <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
                                    {trainer.name}
                                </h1>
                                <div className="text-xs text-[#cccccc] flex items-center gap-1.5">
                                    <Award className="w-3.5 h-3.5 text-[#faff69] flex-shrink-0" />
                                    <span>{trainer.specialization || 'Strength & Conditioning'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Booking & Actions Card */}
                        <div className="bg-[#141414] rounded-2xl border border-[#2a2a2a] p-6 space-y-4 shadow-xl">
                            <div className="flex items-center gap-2 text-xs text-[#888888]">
                                <Building2 className="w-4 h-4 text-[#faff69]" />
                                <span>{gym.name}</span>
                            </div>

                            {settings.contact_whatsapp && (
                                <a
                                    href={`https://wa.me/${settings.contact_whatsapp.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(gym.name)},%20saya%20ingin%20latihan%20dengan%20Coach%20${encodeURIComponent(trainer.name)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-[#0a0a0a] font-extrabold text-xs text-center uppercase tracking-wider block transition-all shadow-lg flex items-center justify-center gap-2"
                                >
                                    <Phone className="w-4 h-4" />
                                    <span>BOOK COACH VIA WHATSAPP</span>
                                </a>
                            )}

                            <Link
                                href={route('public.membership')}
                                className="w-full py-3 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] border border-[#2a2a2a] text-white text-xs font-bold text-center uppercase tracking-wider block transition-all"
                            >
                                VIEW PT MEMBERSHIP PACKAGES
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Profile Dossier & Weekly Schedule */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Credentials Banner */}
                        <div className="bg-[#141414] rounded-2xl border border-[#2a2a2a] p-8 space-y-6">
                            <div className="flex items-center justify-between border-b border-[#242424] pb-4">
                                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2.5">
                                    <Sparkles className="w-4 h-4 text-[#faff69]" />
                                    Coach Dossier & Background
                                </h2>
                                <span className="text-[11px] font-mono text-[#faff69] uppercase font-bold">
                                    {trainer.role || 'Coach'}
                                </span>
                            </div>

                            {trainer.certification && (
                                <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-[#faff69] flex-shrink-0" />
                                    <div>
                                        <div className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">Certifications & Accreditations</div>
                                        <div className="text-xs font-mono font-bold text-white mt-0.5">{trainer.certification}</div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">Public Biography</h3>
                                <p className="text-sm text-[#cccccc] leading-relaxed whitespace-pre-line">
                                    {trainer.bio || 'Coach is a dedicated fitness professional committed to progressive overload, biomechanics, and personalized workout guidance tailored to each client’s lifestyle and athletic goals.'}
                                </p>
                            </div>
                        </div>

                        {/* Weekly Availability Shifts */}
                        <div className="bg-[#141414] rounded-2xl border border-[#2a2a2a] p-8 space-y-6">
                            <div className="flex items-center justify-between border-b border-[#242424] pb-4">
                                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2.5">
                                    <Calendar className="w-4 h-4 text-[#faff69]" />
                                    Weekly Shift Timetable
                                </h2>
                                <span className="text-[11px] font-mono text-[#888888]">{gym.timezone}</span>
                            </div>

                            {trainer.schedules.length === 0 ? (
                                <p className="text-xs text-[#888888]">No regular weekly schedule currently published for this coach.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {trainer.schedules.map((slot, idx) => (
                                        <div
                                            key={idx}
                                            className="bg-[#1a1a1a] rounded-xl p-4 border border-[#242424] flex items-center justify-between"
                                        >
                                            <div>
                                                <div className="text-xs font-bold text-white">{slot.day_name}</div>
                                                <div className="text-xs font-mono text-[#faff69] mt-0.5">
                                                    {slot.formatted_time_range}
                                                </div>
                                            </div>
                                            <span className="px-2.5 py-1 rounded-full bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] text-[10px] font-bold uppercase">
                                                AVAILABLE
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
