import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { WebsiteBranding, WebsiteHero } from '@/types';
import { 
    ArrowRight, 
    Check, 
    Sparkles, 
    Dumbbell, 
    Users, 
    Flame, 
    ShieldCheck, 
    Zap, 
    ChevronDown, 
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Clock,
    Phone,
    Award,
    ExternalLink
} from 'lucide-react';

interface HomeProps {
    branding: WebsiteBranding;
    heroes: WebsiteHero[];
    sections: Record<string, any>;
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
    workouts: Array<{
        id: number;
        name: string;
        category: string;
        description: string;
    }>;
    facilities: Array<{
        id: number;
        name: string;
        description: string;
        image_url?: string | null;
        icon: string;
    }>;
    faqs: Array<{
        id: number;
        question: string;
        answer: string;
        category: string;
    }>;
}

export default function Home({
    branding,
    heroes = [],
    sections,
    plans = [],
    trainers = [],
    workouts = [],
    facilities = [],
    faqs = [],
}: HomeProps) {
    const { gym, settings } = branding;
    const ctaSection = sections?.cta_banner;

    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const [openFaq, setOpenFaq] = useState<number | null>(faqs[0]?.id || null);

    const activeHeroes = heroes.length > 0 ? heroes : [
        {
            id: 0,
            gym_id: gym.id,
            title: settings.hero_headline || 'HIGH VOLTAGE FITNESS & ELITE TRAINING',
            subtitle: settings.hero_subheadline || 'ENGINEERED FOR PEAK PERFORMANCE',
            description: 'State-of-the-art equipment, certified strength coaches, and results-driven training plans engineered for your transformation.',
            cta_label: settings.hero_cta_text || 'EXPLORE MEMBERSHIPS',
            cta_url: route('public.membership'),
            media_type: 'image' as const,
            media_url: null,
            poster_url: null,
            sort_order: 0,
            is_active: true,
        }
    ];

    // Carousel auto-advance if multiple slides
    useEffect(() => {
        if (activeHeroes.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentHeroIndex((prev) => (prev + 1) % activeHeroes.length);
        }, 7000);
        return () => clearInterval(timer);
    }, [activeHeroes.length]);

    const currentHero = activeHeroes[currentHeroIndex] || activeHeroes[0];

    const prevSlide = () => {
        setCurrentHeroIndex((prev) => (prev === 0 ? activeHeroes.length - 1 : prev - 1));
    };

    const nextSlide = () => {
        setCurrentHeroIndex((prev) => (prev + 1) % activeHeroes.length);
    };

    return (
        <PublicLayout branding={branding}>
            {/* 1. DYNAMIC HOME HERO CAROUSEL */}
            <section className="relative overflow-hidden min-h-[620px] lg:min-h-[750px] flex items-center justify-center border-b border-[#2a2a2a] bg-[#070707]">
                {/* Background Media (Video or Image) */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    {currentHero.media_type === 'video' && currentHero.media_url ? (
                        <video
                            key={currentHero.id}
                            src={currentHero.media_url}
                            poster={currentHero.poster_url || undefined}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover scale-105 animate-fade-in"
                        />
                    ) : currentHero.media_url ? (
                        <img
                            key={currentHero.id}
                            src={currentHero.media_url}
                            alt={currentHero.title}
                            className="w-full h-full object-cover scale-105 animate-fade-in"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#181818] via-[#0d0d0d] to-[#050505] flex items-center justify-center">
                            <div className="w-[800px] h-[400px] bg-[#faff69]/8 blur-[160px] pointer-events-none rounded-full" />
                        </div>
                    )}

                    {/* Gradient Overlays for High Legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-[#0a0a0a]/50 z-10" />
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]/90 z-10" />
                </div>

                {/* Hero Foreground Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 py-20 lg:py-28 text-center">
                    <div className="max-w-4xl mx-auto space-y-6">
                        {/* Brand Logo & Branch Tag */}
                        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#121212]/90 backdrop-blur-md border border-[#2a2a2a] text-xs font-semibold text-[#cccccc] shadow-lg">
                            <img src="/images/LogoEX.png" alt="EXFIT" className="h-4 w-4 object-contain" />
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                            <span className="font-mono uppercase tracking-wider text-white">{gym.name}</span>
                        </div>

                        {/* Subtitle / Kicker */}
                        {currentHero.subtitle && (
                            <div className="text-xs sm:text-sm font-mono font-bold tracking-[0.25em] text-[#faff69] uppercase">
                                {currentHero.subtitle}
                            </div>
                        )}

                        {/* High Voltage Headline */}
                        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white uppercase leading-[1.05] drop-shadow-2xl">
                            {currentHero.title}
                        </h1>

                        {/* Description */}
                        {currentHero.description && (
                            <p className="text-sm sm:text-base lg:text-lg text-[#dddddd] max-w-2xl mx-auto leading-relaxed font-normal drop-shadow">
                                {currentHero.description}
                            </p>
                        )}

                        {/* Hero CTA Action Group */}
                        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href={currentHero.cta_url || route('public.membership')}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-black tracking-wider uppercase shadow-[0_0_30px_rgba(250,255,105,0.35)] transition-all hover:scale-105"
                            >
                                <span>{currentHero.cta_label || 'EXPLORE MEMBERSHIPS'}</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>

                            <Link
                                href={route('public.leads.create')}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#141414]/90 backdrop-blur hover:bg-[#202020] border border-[#faff69]/50 hover:border-[#faff69] text-xs font-black tracking-wider text-[#faff69] uppercase transition-all shadow-lg hover:scale-105"
                            >
                                <Sparkles className="w-4 h-4 text-[#faff69]" />
                                <span>SAYA TERTARIK</span>
                            </Link>

                            <Link
                                href={route('public.trainers')}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#141414]/90 backdrop-blur hover:bg-[#202020] border border-[#2a2a2a] hover:border-[#3a3a3a] text-xs font-bold tracking-wider text-white uppercase transition-all"
                            >
                                <Users className="w-4 h-4 text-[#888888]" />
                                <span>OUR COACHES</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Carousel Navigation Controls (When multiple slides exist) */}
                {activeHeroes.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={prevSlide}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-[#121212]/80 backdrop-blur border border-[#2a2a2a] text-white hover:bg-[#faff69] hover:text-[#0a0a0a] transition-all shadow-xl"
                            aria-label="Previous Slide"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={nextSlide}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-[#121212]/80 backdrop-blur border border-[#2a2a2a] text-white hover:bg-[#faff69] hover:text-[#0a0a0a] transition-all shadow-xl"
                            aria-label="Next Slide"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        {/* Indicators */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                            {activeHeroes.map((h, i) => (
                                <button
                                    key={h.id || i}
                                    type="button"
                                    onClick={() => setCurrentHeroIndex(i)}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        i === currentHeroIndex
                                            ? 'w-8 bg-[#faff69] shadow-[0_0_10px_rgba(250,255,105,0.8)]'
                                            : 'w-2 bg-white/30 hover:bg-white/60'
                                    }`}
                                    aria-label={`Go to slide ${i + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </section>

            {/* 2. FEATURED MEMBERSHIP TIERS */}
            <section className="py-20 lg:py-28 border-b border-[#2a2a2a] bg-[#0d0d0d]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div>
                            <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#faff69] mb-2">
                                TRANSPARENT PRICING
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
                                MEMBERSHIP PACKAGES
                            </h2>
                        </div>
                        <Link
                            href={route('public.membership')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#faff69] hover:underline uppercase tracking-wider"
                        >
                            <span>VIEW ALL PACKAGES & BENEFITS</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
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
                                        <h3 className="text-xl font-extrabold tracking-tight uppercase">
                                            {plan.name}
                                        </h3>
                                        {plan.is_featured && (
                                            <span className="px-2.5 py-1 rounded-full bg-[#0a0a0a] text-[#faff69] text-[10px] font-black uppercase tracking-wider">
                                                MOST POPULAR
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <div className="text-3xl sm:text-4xl font-black font-mono">
                                            {plan.formatted_price}
                                        </div>
                                        <div className={`text-xs font-semibold mt-1 ${plan.is_featured ? 'text-[#333333]' : 'text-[#888888]'}`}>
                                            Duration: {plan.formatted_duration}
                                        </div>
                                    </div>

                                    <p className={`text-xs leading-relaxed ${plan.is_featured ? 'text-[#222222]' : 'text-[#cccccc]'}`}>
                                        {plan.description}
                                    </p>

                                    <div className="pt-4 border-t border-current/15 space-y-2.5 text-xs font-medium">
                                        {plan.trainer_quota_total > 0 && (
                                            <div className="flex items-center gap-2 font-bold">
                                                <Zap className="w-4 h-4 flex-shrink-0" />
                                                <span>Includes {plan.trainer_quota_total} PT Sessions</span>
                                            </div>
                                        )}
                                        {plan.features?.map((feat, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <Check className="w-4 h-4 flex-shrink-0" />
                                                <span>{feat}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <Link
                                        href={route('public.membership')}
                                        className={`w-full py-3 rounded-lg text-xs font-extrabold tracking-wider uppercase flex items-center justify-center gap-2 transition-all ${
                                            plan.is_featured
                                                ? 'bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white'
                                                : 'bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a]'
                                        }`}
                                    >
                                        <span>CHOOSE {plan.name}</span>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. PERSONAL TRAINERS (LARGE 4:5 PORTRAIT PHOTOCARDS) */}
            <section className="py-20 lg:py-28 border-b border-[#2a2a2a]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div>
                            <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#faff69] mb-2 flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-[#faff69]" />
                                CERTIFIED STRENGTH COACHES & ROSTER
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
                                MEET OUR PERSONAL TRAINERS
                            </h2>
                        </div>
                        <Link
                            href={route('public.trainers')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#faff69] hover:underline uppercase tracking-wider"
                        >
                            <span>VIEW FULL COACH ROSTER</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* 4:5 Portrait Photocards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {trainers.map((coach) => (
                            <Link
                                key={coach.id}
                                href={route('public.trainers.show', coach.id)}
                                className="group relative rounded-2xl overflow-hidden bg-[#141414] border border-[#2a2a2a] hover:border-[#faff69]/70 transition-all duration-500 shadow-2xl flex flex-col justify-end aspect-[4/5]"
                            >
                                {/* Portrait Background Photo */}
                                <div className="absolute inset-0 z-0 bg-[#1c1c1c]">
                                    {coach.profile_photo_url ? (
                                        <img
                                            src={coach.profile_photo_url}
                                            alt={coach.name}
                                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#242424] to-[#121212] text-[#5a5a5a]">
                                            <Users className="w-16 h-16 mb-2 text-[#3a3a3a]" />
                                            <span className="text-2xl font-black text-[#faff69]/40 font-mono">
                                                {coach.name.slice(0, 2).toUpperCase()}
                                            </span>
                                        </div>
                                    )}

                                    {/* High Contrast Gradient Vignette */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />
                                </div>

                                {/* Top Badge: Live Shift Status */}
                                <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                                    {coach.is_available_now ? (
                                        <span className="px-3 py-1 rounded-full bg-[#22c55e]/90 text-[#0a0a0a] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                            ON SHIFT
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-1 rounded-full bg-black/60 border border-white/10 text-[#cccccc] text-[10px] font-mono uppercase tracking-wider backdrop-blur-md">
                                            SCHEDULED
                                        </span>
                                    )}

                                    <div className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white group-hover:bg-[#faff69] group-hover:text-[#0a0a0a] transition-colors">
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Bottom Photocard Info */}
                                <div className="relative z-10 p-5 space-y-2">
                                    {/* Role Badge */}
                                    <div className="text-[11px] font-mono font-bold tracking-wider text-[#faff69] uppercase">
                                        {coach.role || 'Certified Strength Coach'}
                                    </div>

                                    {/* Trainer Full Name */}
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-[#faff69] transition-colors">
                                        {coach.name}
                                    </h3>

                                    {/* Specialization */}
                                    <div className="text-xs text-[#cccccc] flex items-center gap-1.5">
                                        <Award className="w-3.5 h-3.5 text-[#faff69] flex-shrink-0" />
                                        <span className="truncate">{coach.specialization || 'Strength & Conditioning'}</span>
                                    </div>

                                    {/* Certifications */}
                                    {coach.certification && (
                                        <div className="text-[10px] text-[#888888] font-mono truncate pt-0.5">
                                            {coach.certification}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. WORKOUT CATEGORIES */}
            <section className="py-20 lg:py-28 border-b border-[#2a2a2a] bg-[#0d0d0d]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#faff69] mb-2">
                            TRAINING METHODOLOGY
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
                            PROGRAMS & WORKOUT CATEGORIES
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {workouts.map((w) => (
                            <div
                                key={w.id}
                                className="bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] hover:border-[#faff69]/40 transition-all space-y-3"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-1 rounded bg-[#242424] text-[#faff69] text-[10px] font-mono font-bold uppercase">
                                        {w.category}
                                    </span>
                                    <Flame className="w-4 h-4 text-[#faff69]" />
                                </div>
                                <h3 className="text-lg font-bold text-white">{w.name}</h3>
                                <p className="text-xs text-[#cccccc] leading-relaxed">
                                    {w.description || 'Focused training module designed for progressive overload and metabolic conditioning.'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 5. FACILITIES SHOWCASE */}
            {facilities.length > 0 && (
                <section className="py-20 lg:py-28 border-b border-[#2a2a2a]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                            <div>
                                <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#faff69] mb-2">
                                    PREMIUM ENVIRONMENT
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
                                    WORLD-CLASS FACILITIES
                                </h2>
                            </div>
                            <Link
                                href={route('public.facilities')}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#faff69] hover:underline uppercase tracking-wider"
                            >
                                <span>EXPLORE ALL GYM ZONES</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {facilities.map((fac) => (
                                <div
                                    key={fac.id}
                                    className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] overflow-hidden group hover:border-[#3a3a3a] transition-all"
                                >
                                    <div className="h-48 bg-[#242424] relative overflow-hidden flex items-center justify-center">
                                        {fac.image_url ? (
                                            <img
                                                src={fac.image_url}
                                                alt={fac.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <Dumbbell className="w-12 h-12 text-[#3a3a3a]" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] to-transparent opacity-80" />
                                    </div>
                                    <div className="p-6 space-y-2">
                                        <h3 className="text-lg font-bold text-white group-hover:text-[#faff69] transition-colors">
                                            {fac.name}
                                        </h3>
                                        <p className="text-xs text-[#cccccc] leading-relaxed">
                                            {fac.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 6. FAQ PREVIEW */}
            {faqs.length > 0 && (
                <section className="py-20 lg:py-28 border-b border-[#2a2a2a] bg-[#0d0d0d]">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#faff69] mb-2">
                                GOT QUESTIONS?
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">
                                FREQUENTLY ASKED QUESTIONS
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {faqs.map((faq) => {
                                const isOpen = openFaq === faq.id;
                                return (
                                    <div
                                        key={faq.id}
                                        className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden transition-colors"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                                            className="w-full px-6 py-4 text-left flex items-center justify-between text-sm font-bold text-white hover:text-[#faff69]"
                                        >
                                            <span>{faq.question}</span>
                                            {isOpen ? (
                                                <ChevronUp className="w-4 h-4 text-[#faff69] flex-shrink-0" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-[#888888] flex-shrink-0" />
                                            )}
                                        </button>
                                        {isOpen && (
                                            <div className="px-6 pb-5 pt-1 text-xs text-[#cccccc] leading-relaxed border-t border-[#242424]">
                                                {faq.answer}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 text-center">
                            <Link
                                href={route('public.faq')}
                                className="inline-flex items-center gap-2 text-xs font-bold text-[#faff69] hover:underline uppercase tracking-wider"
                            >
                                <span>VIEW ALL FAQS</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* 7. HIGH VOLTAGE CTA BAND */}
            <section className="py-16 sm:py-24 bg-[#faff69] text-[#0a0a0a]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
                    <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-[1.05]">
                        {ctaSection?.title || 'READY TO TRANSFORM YOUR BODY & MIND?'}
                    </h2>
                    <p className="text-sm sm:text-base font-semibold max-w-xl mx-auto text-[#222222]">
                        {ctaSection?.subtitle || 'Join today and get access to world-class coaching, functional training equipment, and a passionate fitness community.'}
                    </p>
                    <div className="pt-2">
                        <Link
                            href={route('public.membership')}
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#0a0a0a] hover:bg-[#1a1a1a] text-white text-sm font-extrabold tracking-wider uppercase transition-all hover:scale-105 shadow-2xl"
                        >
                            <span>GET STARTED NOW</span>
                            <ArrowRight className="w-4 h-4 text-[#faff69]" />
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
