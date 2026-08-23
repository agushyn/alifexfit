import { Head, Link, usePage } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { MembershipRegistration, PageProps, WebsiteBranding } from '@/types';
import { 
    CheckCircle2, 
    Sparkles, 
    ArrowRight, 
    Shield, 
    Phone, 
    Dumbbell, 
    Smartphone, 
    Calendar,
    Zap,
    ExternalLink
} from 'lucide-react';

interface Props {
    branding: WebsiteBranding;
    registration: MembershipRegistration | null;
    registrationNumber: string | null;
}

export default function MembershipRegistrationSuccess({ branding, registration, registrationNumber }: Props) {
    const { gym } = usePage<PageProps>().props;
    const currentGym = gym.current;
    const settings = branding.settings;

    const code = registration?.registration_number || registrationNumber || 'REG-SUCCESS';
    const plan = registration?.membership_plan;
    const member = registration?.member;
    const membership = registration?.membership;
    const isActivated = Boolean(member || registration?.is_approved || registration?.is_paid);

    return (
        <PublicLayout 
            branding={branding}
            title={isActivated ? `Membership Aktif — #${code}` : `Pendaftaran Berhasil — #${code}`}
            description="Pendaftaran membership EXFITS GYM berhasil. Keanggotaan Anda telah aktif dan siap digunakan."
        >
            <Head title={isActivated ? `Membership Aktif #${code} — EXFITS GYM` : `Pendaftaran Berhasil #${code} — EXFITS GYM`} />

            <div className="min-h-[75vh] py-16 px-4 sm:px-6 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#faff69_1px,transparent_1px)] [background-size:32px_32px] opacity-5 pointer-events-none" />

                <div className="max-w-2xl w-full bg-[#121212] border border-[#2a2a2a] rounded-3xl p-8 sm:p-12 relative z-10 shadow-2xl text-center">
                    {/* Success Icon Badge */}
                    <div className="w-16 h-16 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.25)]">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-xs font-mono font-bold tracking-wider uppercase mb-3">
                        <Zap className="w-3.5 h-3.5" />
                        {isActivated ? 'MEMBERSHIP RESMI AKTIF & LUNAS' : 'PENDAFTARAN BERHASIL'}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                        {isActivated ? 'SELAMAT BERGABUNG DI EXFITS!' : 'PENDAFTARAN BERHASIL'}
                    </h1>

                    <p className="mt-3 text-sm text-[#888888] leading-relaxed max-w-md mx-auto">
                        {isActivated 
                            ? `Pembayaran berhasil dikonfirmasi. Akun keanggotaan Anda di ${currentGym?.name} telah diterbitkan dan langsung aktif.`
                            : `Terima kasih telah mendaftar di ${currentGym?.name}. Permohonan Anda telah tercatat dalam sistem.`}
                    </p>

                    {/* Member & Receipt Dossier */}
                    <div className="mt-8 p-6 rounded-2xl bg-[#161616] border border-[#242424] text-left space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#242424] pb-4 gap-2">
                            <div>
                                <span className="text-[10px] text-[#888888] uppercase tracking-wider font-mono">NOMOR REGISTRASI</span>
                                <div className="text-xl font-extrabold text-[#faff69] font-mono tracking-wider">
                                    {code}
                                </div>
                            </div>
                            {member && (
                                <div className="text-left sm:text-right">
                                    <span className="text-[10px] text-[#888888] uppercase tracking-wider font-mono">NOMOR MEMBER RESMI</span>
                                    <div className="text-lg font-black text-white font-mono">
                                        {member.member_number}
                                    </div>
                                </div>
                            )}
                        </div>

                        {registration && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#cccccc]">
                                <div>
                                    <span className="text-[#888888] block text-[10px] uppercase">NAMA MEMBER:</span>
                                    <span className="font-bold text-white text-sm">{registration.full_name}</span>
                                </div>
                                <div>
                                    <span className="text-[#888888] block text-[10px] uppercase">EMAIL:</span>
                                    <span className="font-mono text-white">{registration.email}</span>
                                </div>
                                <div>
                                    <span className="text-[#888888] block text-[10px] uppercase">WHATSAPP / HP:</span>
                                    <span className="font-mono text-white">{registration.phone}</span>
                                </div>
                                <div>
                                    <span className="text-[#888888] block text-[10px] uppercase">CABANG GYM:</span>
                                    <span className="font-semibold text-[#faff69]">{currentGym?.name}</span>
                                </div>
                            </div>
                        )}

                        {plan && (
                            <div className="pt-3 border-t border-[#242424] flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] text-[#888888] uppercase">PAKET AKTIF</span>
                                    <div className="text-sm font-bold text-white uppercase">{plan.name}</div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-[#888888] uppercase">STATUS PEMBAYARAN</span>
                                    <div className="text-xs font-bold text-[#22c55e] font-mono uppercase">
                                        ✓ LUNAS (PAID)
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Member App Credentials Guide */}
                    {isActivated && (
                        <div className="mt-6 p-5 rounded-2xl bg-[#faff69]/10 border border-[#faff69]/30 text-left space-y-3">
                            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                                <Smartphone className="w-4 h-4 text-[#faff69]" />
                                <span>LOGIN KE EXFIT MEMBER APP</span>
                            </div>
                            <p className="text-xs text-[#cccccc] leading-relaxed">
                                Anda kini dapat langsung login ke aplikasi mobile <strong>EXFIT Member App</strong> untuk scan QR check-in kehadiran, booking sesi personal trainer, dan melihat jadwal latihan:
                            </p>
                            <div className="p-3 rounded-xl bg-[#121212] border border-[#2a2a2a] text-xs font-mono space-y-1">
                                <div><span className="text-[#888888]">Username / Identifier: </span><strong className="text-white">{member?.member_number || registration?.email || registration?.phone}</strong></div>
                                <div><span className="text-[#888888]">Password Default: </span><strong className="text-[#faff69]">password</strong> <span className="text-[#666666]">(dapat diubah di profil)</span></div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        {settings?.contact_phone && (
                            <a
                                href={`https://wa.me/${settings.contact_phone.replace(/\D/g, '')}?text=Halo%20${encodeURIComponent(currentGym?.name || 'Exfits')},%20saya%20telah%20menyelesaikan%20pembayaran%20membership%20dengan%20nomor%20registrasi%20${encodeURIComponent(code)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-lg cursor-pointer"
                            >
                                <Phone className="w-4 h-4" />
                                <span>HUBUNGI FRONT DESK VIA WA</span>
                            </a>
                        )}

                        <Link
                            href={route('public.home', { gym: currentGym?.slug })}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1a1a1a] hover:bg-[#242424] text-white text-xs font-bold uppercase tracking-wider border border-[#2a2a2a] transition-all"
                        >
                            <span>KEMBALI KE BERANDA</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
