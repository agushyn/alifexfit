import { Link } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { WebsiteBranding } from '@/types';
import { 
    Sparkles, 
    ShieldCheck, 
    Zap, 
    Target, 
    Dumbbell, 
    Users, 
    ArrowRight,
    CheckCircle2
} from 'lucide-react';

interface AboutProps {
    branding: WebsiteBranding;
    sections: Record<string, any>;
    facilities: Array<{
        id: number;
        name: string;
        description: string;
        image_url?: string | null;
    }>;
}

export default function About({ branding, sections, facilities }: AboutProps) {
    const { gym, settings } = branding;
    const aboutSection = sections?.about_preview;

    return (
        <PublicLayout
            branding={branding}
            title={`About ${gym.name}`}
            description={`Learn more about ${gym.name} - our training philosophy, certified strength coaches, and world-class equipment standard.`}
        >
            {/* Header Banner */}
            <section className="py-16 sm:py-24 border-b border-[#2a2a2a] bg-[#0f0f0f] relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#faff69]/10 blur-[130px] pointer-events-none rounded-full" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-xs font-semibold text-[#faff69]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>OUR STORY & PHILOSOPHY</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white uppercase leading-[1.05]">
                        ABOUT {gym.name}
                    </h1>
                    <p className="text-sm sm:text-base text-[#cccccc] max-w-2xl mx-auto leading-relaxed">
                        Built for lifters, athletes, and anyone committed to physical excellence. We provide the equipment, coaching, and atmosphere you need to surpass your limits.
                    </p>
                </div>
            </section>

            {/* Core Mission Section */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#faff69]">
                            HIGH VOLTAGE STANDARDS
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight leading-tight">
                            {aboutSection?.title || 'ENGINEERED FOR SERIOUS RESULTS'}
                        </h2>
                        <p className="text-sm text-[#cccccc] leading-relaxed">
                            {aboutSection?.content || `${gym.name} was established with a singular focus: eliminate the gimmicks of commercial fitness and build a dedicated strength and athletic training ground. We combine heavy iron, precision machines, and top-tier coaching in an intense yet welcoming environment.`}
                        </p>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-[#faff69] flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-sm font-bold text-white">No Crowds, No Waiting</div>
                                    <div className="text-xs text-[#888888]">Multiple power racks, Olympic platforms, and dumbbell sets up to 50kg.</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-[#faff69] flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-sm font-bold text-white">Certified Strength Coaches</div>
                                    <div className="text-xs text-[#888888]">Professional guidance for posture correction, periodized training, and hypertrophy.</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-[#faff69] flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-sm font-bold text-white">Full Hygiene & Recovery</div>
                                    <div className="text-xs text-[#888888]">Finnish sauna, hot showers, and filtered water refill stations.</div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Link
                                href={route('public.membership')}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#faff69] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider hover:bg-[#e6eb52] transition-all shadow-lg"
                            >
                                <span>VIEW MEMBERSHIP PLANS</span>
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8 space-y-6">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">GYM LOCATION & OPERATING HOURS</h3>
                        <div className="space-y-4 text-xs text-[#cccccc]">
                            <div>
                                <div className="font-bold text-white uppercase mb-1">Address:</div>
                                <p>{gym.address}</p>
                            </div>
                            <div>
                                <div className="font-bold text-white uppercase mb-1">Phone / WhatsApp:</div>
                                <p>{gym.phone}</p>
                            </div>
                            <div>
                                <div className="font-bold text-white uppercase mb-1">Email:</div>
                                <p>{gym.email}</p>
                            </div>
                            <div>
                                <div className="font-bold text-white uppercase mb-1">Operating Hours:</div>
                                <p>{settings.operating_hours}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
