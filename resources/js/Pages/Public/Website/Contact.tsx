import { Link } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { WebsiteBranding } from '@/types';
import { 
    Sparkles, 
    MapPin, 
    Phone, 
    Mail, 
    Clock, 
    ExternalLink,
    Building2,
    MessageSquare,
    Send
} from 'lucide-react';

interface ContactProps {
    branding: WebsiteBranding;
}

export default function Contact({ branding }: ContactProps) {
    const { gym, settings } = branding;

    return (
        <PublicLayout
            branding={branding}
            title={`Contact & Location - ${gym.name}`}
            description={`Get in touch with ${gym.name}. Official address: ${gym.address}, phone: ${gym.phone}, operating hours, and location directions.`}
        >
            {/* Header Banner */}
            <section className="py-16 sm:py-24 border-b border-[#2a2a2a] bg-[#0c0c0c] relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#faff69]/10 blur-[150px] pointer-events-none rounded-full" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#161616] border border-[#2a2a2a] text-xs font-semibold text-[#faff69] shadow-md">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>VISIT OR CONTACT OUR FLAGSHIP LOCATION</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase leading-[1.05]">
                        CONTACT & LOCATION
                    </h1>
                    <p className="text-sm sm:text-base text-[#cccccc] max-w-2xl mx-auto leading-relaxed">
                        We are here to help you get started on your fitness transformation. Visit our front desk or message our membership team directly.
                    </p>
                </div>
            </section>

            {/* Main Contact Content */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Branch Dossier Card */}
                    <div className="bg-[#141414] rounded-3xl border border-[#2a2a2a] p-8 sm:p-10 space-y-8 flex flex-col justify-between shadow-2xl">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <img
                                    src="/images/LogoEX.png"
                                    alt="EXFIT Logo"
                                    className="h-12 w-12 object-contain filter drop-shadow-[0_0_10px_rgba(250,255,105,0.4)]"
                                />
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase">{gym.name}</h2>
                                    <div className="text-xs font-mono text-[#faff69]">OFFICIAL FLAGSHIP • CODE: {gym.code}</div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-[#242424] text-xs text-[#cccccc]">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-[#faff69] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-bold text-white uppercase mb-0.5">Physical Address</div>
                                        <p className="text-[#cccccc] leading-relaxed font-medium">{gym.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-[#faff69] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-bold text-white uppercase mb-0.5">Operating Hours</div>
                                        <p className="text-[#cccccc] font-mono">{settings.operating_hours}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Phone className="w-5 h-5 text-[#faff69] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-bold text-white uppercase mb-0.5">Front Desk Phone / Hotline</div>
                                        <a href={`tel:${gym.phone}`} className="text-[#faff69] font-mono font-bold hover:underline">
                                            {gym.phone}
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-[#faff69] flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-bold text-white uppercase mb-0.5">Official Email</div>
                                        <p className="text-[#cccccc]">{gym.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="pt-6 border-t border-[#242424] space-y-3">
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gym.address || 'EXFIT Tangerang')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-4 rounded-xl bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-black text-center uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(250,255,105,0.3)] hover:scale-[1.02]"
                            >
                                <MapPin className="w-4 h-4" />
                                <span>LIHAT LOKASI DI GOOGLE MAPS</span>
                                <ExternalLink className="w-4 h-4" />
                            </a>

                            <Link
                                href={route('public.leads.create', { gym: gym.slug })}
                                className="w-full py-3.5 rounded-xl bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] text-[#ffffff] text-xs font-bold text-center uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                            >
                                <Send className="w-4 h-4 text-[#faff69]" />
                                <span>SAYA INGIN DIHUBUNGI / KONSULTASI</span>
                            </Link>

                            {settings.contact_whatsapp && (
                                <a
                                    href={`https://wa.me/${settings.contact_whatsapp.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(gym.name)},%20saya%20ingin%20bertanya%20informasi%20membership`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-3.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-[#0a0a0a] text-xs font-black text-center uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span>CHAT VIA WHATSAPP ({settings.contact_whatsapp})</span>
                                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Google Maps / Location Info */}
                    <div className="bg-[#141414] rounded-3xl border border-[#2a2a2a] overflow-hidden flex flex-col justify-between shadow-2xl">
                        {settings.google_maps_embed_url ? (
                            <div className="h-80 w-full">
                                <iframe
                                    src={settings.google_maps_embed_url}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Google Maps"
                                />
                            </div>
                        ) : (
                            <div className="h-80 bg-[#1a1a1a] flex flex-col items-center justify-center p-8 text-center space-y-4">
                                <Building2 className="w-16 h-16 text-[#faff69]/40" />
                                <div>
                                    <div className="text-base font-black text-white uppercase">EXFIT OFFICIAL LOCATION</div>
                                    <p className="text-xs text-[#cccccc] max-w-sm mt-1 leading-relaxed">{gym.address}</p>
                                </div>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gym.address || 'EXFIT Tangerang')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#242424] hover:bg-[#faff69] hover:text-[#0a0a0a] border border-[#3a3a3a] text-xs font-bold text-white transition-all uppercase font-mono"
                                >
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>Buka di Google Maps</span>
                                </a>
                            </div>
                        )}

                        <div className="p-8 bg-[#141414] border-t border-[#242424] space-y-2 text-xs text-[#888888]">
                            <div className="font-bold text-white uppercase flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-[#faff69]" />
                                VISIT GUIDELINES & PARKING:
                            </div>
                            <p className="leading-relaxed">
                                Walk-in visitors and member tours are available daily during operating hours. Dedicated secure member parking is provided in front of Ruko New Castle.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
