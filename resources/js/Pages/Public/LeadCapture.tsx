import { FormEvent, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { MembershipPlan, WebsiteBranding } from '@/types';
import { 
    Send, 
    Sparkles, 
    User, 
    Mail, 
    Phone, 
    MessageSquare, 
    CheckCircle2, 
    HelpCircle, 
    Dumbbell, 
    Flame, 
    ArrowLeft,
    Building2,
    Zap,
    AlertCircle
} from 'lucide-react';

interface Props {
    branding: WebsiteBranding;
    plans: MembershipPlan[];
    preselectedPlanId?: number | null;
}

export default function LeadCapture({ branding, plans, preselectedPlanId }: Props) {
    const gym = branding.gym;

    const interestOptions = [
        { id: 'membership', label: 'Membership Gym', icon: Dumbbell },
        { id: 'trial', label: 'Coba / Free Trial', icon: Flame },
        { id: 'personal_training', label: 'Personal Trainer', icon: Zap },
        { id: 'workout', label: 'Program Latihan', icon: Sparkles },
        { id: 'general_inquiry', label: 'Pertanyaan Umum', icon: HelpCircle },
    ];

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        phone: string;
        email: string;
        whatsapp: string;
        membership_plan_id: string;
        interest_type: string;
        message: string;
    }>({
        name: '',
        phone: '',
        email: '',
        whatsapp: '',
        membership_plan_id: preselectedPlanId ? String(preselectedPlanId) : '',
        interest_type: 'membership',
        message: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('public.leads.store'));
    };

    return (
        <PublicLayout branding={branding}>
            <Head title={`Konsultasi & Tanya Info — ${gym.name}`} />

            <div className="py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Link */}
                <div className="mb-6">
                    <Link
                        href={route('public.home')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#888888] hover:text-[#faff69] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali ke Beranda</span>
                    </Link>
                </div>

                {/* Header Banner */}
                <div className="bg-[#121212] border border-[#242424] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden mb-8 text-center sm:text-left">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-[#faff69]/10 blur-3xl pointer-events-none" />

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#faff69]/10 border border-[#faff69]/30 text-[#faff69] text-xs font-mono font-bold uppercase tracking-wider mb-4">
                        <Sparkles className="w-3.5 h-3.5" />
                        KONSULTASI & TANYA MEMBERSHIP
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase">
                        KONSULTASI GRATIS DENGAN TIM EXFITS
                    </h1>

                    <p className="mt-2 text-xs sm:text-sm text-[#888888] max-w-2xl leading-relaxed">
                        Tertarik mulai berlatih di <strong className="text-white">{gym.name}</strong>? Tinggalkan kontak Anda, konsultan kebugaran kami akan menghubungi Anda untuk memberikan rekomendasi program & paket terbaik.
                    </p>

                    <div className="mt-6 pt-4 border-t border-[#202020] flex flex-wrap items-center gap-4 text-xs text-[#aaaaaa]">
                        <div className="flex items-center gap-1.5">
                            <Building2 className="w-4 h-4 text-[#faff69]" />
                            <span>{gym.name}</span>
                        </div>
                        {gym.phone && (
                            <div className="flex items-center gap-1.5">
                                <Phone className="w-4 h-4 text-[#faff69]" />
                                <span>{gym.phone}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Form Container */}
                <form onSubmit={handleSubmit} className="space-y-8 bg-[#121212] border border-[#242424] rounded-3xl p-6 sm:p-10 shadow-2xl">
                    {/* Error Summary */}
                    {Object.keys(errors).length > 0 && (
                        <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div className="text-xs">
                                <div className="font-bold">Mohon lengkapi data formulir berikut:</div>
                                <ul className="list-disc list-inside mt-1 space-y-0.5">
                                    {Object.values(errors).map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* 1. Interest Area */}
                    <div>
                        <label className="block text-xs font-bold text-[#faff69] uppercase tracking-wider font-mono mb-3">
                            1. APA YANG INGIN ANDA KETAHUI / COBA?
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {interestOptions.map((opt) => {
                                const Icon = opt.icon;
                                const isSelected = data.interest_type === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setData('interest_type', opt.id)}
                                        className={`p-3.5 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-[#181818] border-[#faff69] text-white shadow-[0_0_15px_rgba(250,255,105,0.1)]'
                                                : 'bg-[#161616] border-[#242424] text-[#888888] hover:border-[#383838] hover:text-white'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-[#faff69]' : 'text-[#666666]'}`} />
                                        <span className="text-xs font-semibold">{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 2. Membership Plan (Optional) */}
                    {plans.length > 0 && (
                        <div>
                            <label className="block text-xs font-bold text-[#faff69] uppercase tracking-wider font-mono mb-3">
                                2. PILIH PAKET MEMBERSHIP YANG DIMINATI (OPSIONAL)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {plans.map((p) => {
                                    const isSelected = String(data.membership_plan_id) === String(p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setData('membership_plan_id', isSelected ? '' : String(p.id))}
                                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                                                isSelected
                                                    ? 'bg-[#181818] border-[#faff69] text-white shadow-[0_0_15px_rgba(250,255,105,0.1)]'
                                                    : 'bg-[#161616] border-[#242424] text-[#888888] hover:border-[#383838]'
                                            }`}
                                        >
                                            <div className="text-xs font-bold text-white uppercase">{p.name}</div>
                                            <div className="text-sm font-black text-[#faff69] font-mono mt-1">
                                                Rp {Number(p.price).toLocaleString('id-ID')}
                                            </div>
                                            <div className="text-[10px] text-[#888888] mt-1">
                                                Quota PT: {p.trainer_quota} Sesi
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* 3. Contact Details */}
                    <div>
                        <label className="block text-xs font-bold text-[#faff69] uppercase tracking-wider font-mono mb-3">
                            3. KONTAK ANDA
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            {/* Name */}
                            <div className="sm:col-span-2">
                                <label className="block font-semibold text-[#cccccc] mb-1">
                                    Nama Lengkap <span className="text-[#faff69]">*</span>
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-[#666666] absolute left-3 top-3" />
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Nama Anda"
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                    />
                                </div>
                                {errors.name && <p className="mt-1 text-[11px] text-[#ef4444]">{errors.name}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block font-semibold text-[#cccccc] mb-1">
                                    Nomor Telepon / WhatsApp <span className="text-[#faff69]">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 text-[#666666] absolute left-3 top-3" />
                                    <input
                                        type="tel"
                                        required
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="081234567890"
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                    />
                                </div>
                                {errors.phone && <p className="mt-1 text-[11px] text-[#ef4444]">{errors.phone}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block font-semibold text-[#cccccc] mb-1">
                                    Alamat Email (Opsional)
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-[#666666] absolute left-3 top-3" />
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="nama@email.com"
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-[11px] text-[#ef4444]">{errors.email}</p>}
                            </div>

                            {/* Message */}
                            <div className="sm:col-span-2">
                                <label className="block font-semibold text-[#cccccc] mb-1">
                                    Pesan / Pertanyaan Khusus (Opsional)
                                </label>
                                <div className="relative">
                                    <MessageSquare className="w-4 h-4 text-[#666666] absolute left-3 top-3" />
                                    <textarea
                                        rows={3}
                                        value={data.message}
                                        onChange={(e) => setData('message', e.target.value)}
                                        placeholder="Tuliskan tujuan fitness Anda atau jadwal yang ingin Anda tanyakan..."
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Action */}
                    <div className="pt-4 border-t border-[#202020]">
                        <button
                            type="submit"
                            disabled={processing || !data.name || !data.phone}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(250,255,105,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {processing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
                                    <span>MENGIRIM PERMINTAAN...</span>
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    <span>KIRIM PERTANYAAN SAYA</span>
                                </>
                            )}
                        </button>

                        <p className="mt-3 text-[11px] text-[#666666]">
                            Informasi Anda dijaga kerahasiaannya dan hanya digunakan oleh tim kami untuk merespons pertanyaan Anda.
                        </p>
                    </div>
                </form>
            </div>
        </PublicLayout>
    );
}
