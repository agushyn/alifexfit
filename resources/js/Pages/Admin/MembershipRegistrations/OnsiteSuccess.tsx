import { Head, Link } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { MembershipRegistration } from '@/types';
import { 
    CheckCircle2, 
    Printer, 
    User, 
    ExternalLink, 
    UserPlus, 
    ArrowRight, 
    Sparkles, 
    CreditCard, 
    Calendar,
    Zap
} from 'lucide-react';

interface Props {
    registration: MembershipRegistration;
}

export default function OnsiteSuccess({ registration }: Props) {
    const member = registration.member;
    const membership = registration.membership;
    const plan = registration.membership_plan;

    const handlePrint = () => {
        window.print();
    };

    return (
        <AuthenticatedLayout
            title={`Onsite Registration Success — #${registration.registration_number}`}
            header={{
                title: 'Onsite Registration Successful',
                subtitle: `Member ${member?.full_name || registration.full_name} (${member?.member_number || 'MEM-000000'}) berhasil didaftarkan dan aktif.`,
            }}
        >
            <Head title={`Onsite Success #${registration.registration_number} — Admin`} />

            <div className="max-w-3xl mx-auto py-6">
                <div className="bg-[#121212] border border-[#242424] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center">
                    {/* Background glow */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#22c55e]/10 blur-3xl pointer-events-none" />

                    {/* Success Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/30 text-[#22c55e] flex items-center justify-center mx-auto mb-5 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-xs font-mono font-bold uppercase tracking-wider mb-2">
                        <Zap className="w-3.5 h-3.5" />
                        PENDAFTARAN ONSITE SELESAI
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                        MEMBER BERHASIL DITERBITKAN
                    </h1>

                    <p className="mt-2 text-xs sm:text-sm text-[#888888] max-w-md mx-auto">
                        Data calon member, membership aktif, dan bukti registrasi telah dicatat secara otomatis dalam sistem.
                    </p>

                    {/* Receipt Dossier Box */}
                    <div className="mt-8 p-6 rounded-2xl bg-[#161616] border border-[#242424] text-left space-y-5">
                        {/* Header Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#242424] pb-4 gap-3">
                            <div>
                                <span className="text-[10px] text-[#888888] uppercase tracking-wider font-mono">NOMOR REGISTRASI</span>
                                <div className="text-xl font-extrabold text-[#faff69] font-mono tracking-wider">
                                    {registration.registration_number}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-md bg-[#1a1a1a] text-[#aaaaaa] border border-[#2a2a2a] text-[11px] font-mono font-bold uppercase">
                                    SOURCE: ONSITE
                                </span>
                                <span className="px-2.5 py-1 rounded-md bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 text-[11px] font-mono font-bold uppercase">
                                    STATUS: APPROVED
                                </span>
                            </div>
                        </div>

                        {/* Member Information Strip */}
                        {member && (
                            <div>
                                <div className="text-[10px] font-mono font-bold text-[#888888] uppercase mb-2">
                                    DATA RESMI MEMBER:
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#1a1a1a] border border-[#222222] text-xs">
                                    <div>
                                        <span className="text-[#888888] block text-[10px] uppercase">NOMOR MEMBER:</span>
                                        <span className="text-sm font-mono font-bold text-[#faff69]">{member.member_number}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#888888] block text-[10px] uppercase">NAMA LENGKAP:</span>
                                        <span className="font-bold text-white text-sm">{member.full_name}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#888888] block text-[10px] uppercase">EMAIL:</span>
                                        <span className="font-mono text-white">{member.email}</span>
                                    </div>
                                    <div>
                                        <span className="text-[#888888] block text-[10px] uppercase">WHATSAPP / HP:</span>
                                        <span className="font-mono text-white">{member.phone}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Membership Details */}
                        {membership && plan && (
                            <div>
                                <div className="text-[10px] font-mono font-bold text-[#888888] uppercase mb-2">
                                    PAKET MEMBERSHIP AKTIF:
                                </div>
                                <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#222222] text-xs space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-white uppercase text-sm">{plan.name}</span>
                                        <span className="text-base font-extrabold text-[#faff69] font-mono">
                                            Rp {Number(membership.price).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-[#242424] text-[11px]">
                                        <div>
                                            <span className="text-[#888888] block">Mulai Berlaku:</span>
                                            <span className="font-mono text-white">{membership.start_date}</span>
                                        </div>
                                        <div>
                                            <span className="text-[#888888] block">Berakhir Pada:</span>
                                            <span className="font-mono text-white">{membership.end_date}</span>
                                        </div>
                                        <div>
                                            <span className="text-[#888888] block">Quota PT:</span>
                                            <span className="font-mono font-bold text-[#faff69]">
                                                {membership.trainer_quota_total} Sesi
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3 print:hidden">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1a1a1a] hover:bg-[#242424] text-xs font-bold text-white border border-[#2a2a2a] transition-all cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Cetak Ringkasan</span>
                        </button>

                        {member && (
                            <Link
                                href={route('admin.members.show', member.id)}
                                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(250,255,105,0.2)]"
                            >
                                <span>Lihat Profil Member</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                        )}

                        <Link
                            href={route('admin.membership-registrations.onsite.create')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#161616] hover:bg-[#202020] text-xs font-bold text-white border border-[#2a2a2a] transition-all"
                        >
                            <UserPlus className="w-3.5 h-3.5 text-[#faff69]" />
                            <span>Daftarkan Member Baru</span>
                        </Link>

                        <Link
                            href={route('admin.membership-registrations.index')}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#161616] hover:bg-[#202020] text-xs font-bold text-[#888888] hover:text-white border border-[#2a2a2a] transition-all"
                        >
                            <span>Daftar Permohonan</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
