import { Head, Link } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { WebsiteBranding } from '@/types';
import { CheckCircle2, ArrowRight, Sparkles, Building2, Phone, Home } from 'lucide-react';

interface Props {
    branding: WebsiteBranding;
    ref?: string | null;
}

export default function LeadSuccess({ branding, ref }: Props) {
    const gym = branding.gym;

    return (
        <PublicLayout branding={branding}>
            <Head title={`Konsultasi Terkirim — ${gym.name}`} />

            <div className="py-16 sm:py-24 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="bg-[#121212] border border-[#242424] rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                    {/* Background glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-32 bg-[#22c55e]/10 blur-3xl pointer-events-none" />

                    {/* Success Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-xs font-mono font-bold uppercase tracking-wider mb-3">
                        <Sparkles className="w-3.5 h-3.5" />
                        PESAN KONSULTASI DITERIMA
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                        TERIMA KASIH TELAH MENGHUBUNGI KAMI!
                    </h1>

                    <p className="mt-3 text-xs sm:text-sm text-[#888888] leading-relaxed">
                        Data dan pertanyaan Anda telah kami terima. Tim konsultan kebugaran <strong className="text-white">{gym.name}</strong> akan segera menghubungi Anda melalui WhatsApp atau telepon.
                    </p>

                    {ref && (
                        <div className="mt-6 p-4 rounded-xl bg-[#161616] border border-[#242424] inline-block">
                            <span className="text-[10px] text-[#888888] uppercase tracking-wider font-mono block">
                                NOMOR REFERENSI PROSPEK
                            </span>
                            <span className="text-lg font-extrabold text-[#faff69] font-mono tracking-wider">
                                {ref}
                            </span>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-[#202020] flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href={route('public.home')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#161616] hover:bg-[#202020] text-xs font-bold text-white border border-[#2a2a2a] transition-all"
                        >
                            <Home className="w-4 h-4" />
                            <span>Kembali ke Beranda</span>
                        </Link>

                        <Link
                            href={route('public.membership')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(250,255,105,0.2)]"
                        >
                            <span>Lihat Paket Membership</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
