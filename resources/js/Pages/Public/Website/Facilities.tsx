import { PublicLayout } from '@/Layouts/PublicLayout';
import { WebsiteBranding } from '@/types';
import { 
    Dumbbell, 
    Sparkles, 
    CheckCircle2, 
    Shield, 
    Zap, 
    HeartHandshake,
    Flame
} from 'lucide-react';

interface FacilitiesProps {
    branding: WebsiteBranding;
    facilities: Array<{
        id: number;
        name: string;
        description: string;
        image_url?: string | null;
        icon: string;
    }>;
}

export default function Facilities({ branding, facilities }: FacilitiesProps) {
    const { gym } = branding;

    return (
        <PublicLayout
            branding={branding}
            title="World-Class Gym Facilities & Amenities"
            description={`Explore the state-of-the-art training equipment, Olympic platforms, sauna, and locker amenities at ${gym.name}.`}
        >
            {/* Header Banner */}
            <section className="py-16 sm:py-24 border-b border-[#2a2a2a] bg-[#0f0f0f] relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#faff69]/10 blur-[130px] pointer-events-none rounded-full" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-xs font-semibold text-[#faff69]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>PREMIUM TRAINING ENVIRONMENT</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white uppercase leading-[1.05]">
                        GYM FACILITIES
                    </h1>
                    <p className="text-sm sm:text-base text-[#cccccc] max-w-2xl mx-auto leading-relaxed">
                        Engineered for serious lifters and fitness enthusiasts. Clean, spacious zones equipped with industry-leading commercial machines and recovery amenities.
                    </p>
                </div>
            </section>

            {/* Facilities Grid */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {facilities.length === 0 ? (
                    <div className="text-center py-16 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]">
                        <Dumbbell className="w-12 h-12 text-[#888888] mx-auto mb-3" />
                        <p className="text-sm text-[#888888]">No facilities listed yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {facilities.map((fac) => (
                            <div
                                key={fac.id}
                                className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] overflow-hidden group hover:border-[#3a3a3a] transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="h-56 bg-[#242424] relative overflow-hidden flex items-center justify-center">
                                        {fac.image_url ? (
                                            <img
                                                src={fac.image_url}
                                                alt={fac.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <Dumbbell className="w-16 h-16 text-[#333333]" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent opacity-90" />
                                    </div>

                                    <div className="p-6 space-y-3">
                                        <h3 className="text-xl font-bold text-white group-hover:text-[#faff69] transition-colors">
                                            {fac.name}
                                        </h3>
                                        <p className="text-xs text-[#cccccc] leading-relaxed">
                                            {fac.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 pt-0">
                                    <div className="pt-4 border-t border-[#242424] flex items-center gap-2 text-xs font-semibold text-[#faff69]">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Included in All Memberships</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </PublicLayout>
    );
}
