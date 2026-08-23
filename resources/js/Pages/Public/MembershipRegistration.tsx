import { FormEvent, useState, useRef } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { MembershipPlan, PageProps, WebsiteBranding } from '@/types';
import { 
    CheckCircle2, 
    Shield, 
    Sparkles, 
    ArrowRight, 
    Zap, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    HeartHandshake, 
    AlertCircle,
    Upload,
    FileText,
    Check,
    X,
    Eye
} from 'lucide-react';

interface Props {
    branding: WebsiteBranding;
    plans: MembershipPlan[];
    selectedPlanId: number | null;
}

export default function MembershipRegistration({ branding, plans, selectedPlanId }: Props) {
    const { gym } = usePage<PageProps>().props;
    const currentGym = gym.current;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [ktpPreview, setKtpPreview] = useState<string | null>(null);
    const [ktpFileDetails, setKtpFileDetails] = useState<{ name: string; size: string; isPdf: boolean } | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        membership_plan_id: selectedPlanId ? String(selectedPlanId) : (plans[0]?.id ? String(plans[0].id) : ''),
        full_name: '',
        email: '',
        phone: '',
        gender: '' as '' | 'male' | 'female' | 'other',
        date_of_birth: '',
        address: '',
        city: '',
        ktp: null as File | null,
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
        notes: '',
        agreed: false,
    });

    const activeSelectedPlan = plans.find((p) => String(p.id) === String(data.membership_plan_id)) || plans[0];

    const handleKtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Size check: max 5MB (5 * 1024 * 1024 bytes)
        if (file.size > 5 * 1024 * 1024) {
            alert('Ukuran file KTP tidak boleh melebihi 5 MB.');
            return;
        }

        setData('ktp', file);

        const sizeFormatted = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        setKtpFileDetails({
            name: file.name,
            size: sizeFormatted,
            isPdf,
        });

        if (!isPdf && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setKtpPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setKtpPreview(null);
        }
    };

    const handleRemoveKtp = () => {
        setData('ktp', null);
        setKtpPreview(null);
        setKtpFileDetails(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('public.membership.register.store', { gym: currentGym?.slug }), {
            forceFormData: true,
        });
    };

    return (
        <PublicLayout 
            branding={branding}
            title={`Online Registration — ${currentGym?.name || 'Exfits Gym'}`}
            description="Daftar membership online di EXFITS GYM. Lengkapi formulir, unggah KTP, dan bayar instan via QRIS / Virtual Account."
        >
            <Head title={`Pendaftaran Membership — ${currentGym?.name || 'Exfits Gym'}`} />

            {/* Header Section */}
            <div className="bg-[#0f0f0f] border-b border-[#2a2a2a] py-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#faff69_1px,transparent_1px)] [background-size:32px_32px] opacity-5 pointer-events-none" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#faff69]/10 border border-[#faff69]/30 text-[#faff69] text-xs font-mono font-semibold tracking-wider uppercase mb-3">
                        <Zap className="w-3.5 h-3.5" />
                        PENDAFTARAN ONLINE & AKTIVASI OTOMATIS
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
                        JOIN THE <span className="text-[#faff69]">BROTHERHOOD</span> OF IRON
                    </h1>
                    <p className="mt-3 text-sm sm:text-base text-[#888888] max-w-xl mx-auto">
                        Isi data diri Anda, unggah identitas KTP, dan pilih metode pembayaran (QRIS / Virtual Account). Keanggotaan langsung aktif seketika setelah pembayaran berhasil!
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Error Banner */}
                    {Object.keys(errors).length > 0 && (
                        <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <div className="font-bold">Mohon periksa kembali formulir Anda:</div>
                                <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs text-[#ef4444]/90">
                                    {Object.values(errors).map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Membership Plan Selection */}
                    <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-[#faff69] text-[#0a0a0a] font-black text-sm flex items-center justify-center">
                                01
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white uppercase tracking-wide">PILIH PAKET MEMBERSHIP</h2>
                                <p className="text-xs text-[#888888]">Tentukan durasi komitmen latihan Anda</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {plans.map((plan) => {
                                const isSelected = String(data.membership_plan_id) === String(plan.id);
                                return (
                                    <button
                                        key={plan.id}
                                        type="button"
                                        onClick={() => setData('membership_plan_id', String(plan.id))}
                                        className={`relative p-5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                                            isSelected 
                                                ? 'bg-[#1a1a1a] border-[#faff69] shadow-[0_0_20px_rgba(250,255,105,0.15)] ring-1 ring-[#faff69]'
                                                : 'bg-[#161616] border-[#242424] hover:border-[#3a3a3a]'
                                        }`}
                                    >
                                        {plan.is_featured && (
                                            <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded bg-[#faff69] text-[#0a0a0a] text-[9px] font-black tracking-wider uppercase">
                                                POPULAR
                                            </div>
                                        )}
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-white uppercase">{plan.name}</span>
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                    isSelected ? 'border-[#faff69] bg-[#faff69]' : 'border-[#444444]'
                                                }`}>
                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a]" />}
                                                </div>
                                            </div>
                                            <div className="mt-3">
                                                <span className="text-xl font-extrabold text-[#faff69] font-mono">
                                                    Rp {Number(plan.price).toLocaleString('id-ID')}
                                                </span>
                                                <span className="text-xs text-[#888888] ml-1">
                                                    /{plan.duration} {plan.billing_period === 'monthly' ? 'Bulan' : plan.billing_period === 'yearly' ? 'Tahun' : 'Hari'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-[#242424] text-[11px] text-[#aaaaaa] flex items-center gap-1.5">
                                            <Sparkles className="w-3.5 h-3.5 text-[#faff69]" />
                                            <span>Quota: {plan.trainer_quota} Sesi Personal Trainer</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Step 2: Personal Information */}
                    <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-[#faff69] text-[#0a0a0a] font-black text-sm flex items-center justify-center">
                                02
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white uppercase tracking-wide">DATA PRIBADI CALON MEMBER</h2>
                                <p className="text-xs text-[#888888]">Informasi identitas resmi Anda untuk akun member</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Full Name */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cccccc] mb-1.5">
                                    Nama Lengkap (Sesuai KTP) <span className="text-[#faff69]">*</span>
                                </label>
                                <div className="relative">
                                    <User className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
                                    <input
                                        type="text"
                                        required
                                        value={data.full_name}
                                        onChange={(e) => setData('full_name', e.target.value)}
                                        placeholder="Contoh: Rian Pratama"
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#faff69] focus:ring-1 focus:ring-[#faff69]"
                                    />
                                </div>
                                {errors.full_name && <p className="mt-1 text-xs text-[#ef4444]">{errors.full_name}</p>}
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cccccc] mb-1.5">
                                    Alamat Email Aktif <span className="text-[#faff69]">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
                                    <input
                                        type="email"
                                        required
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="nama@email.com"
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#faff69] focus:ring-1 focus:ring-[#faff69]"
                                    />
                                </div>
                                <span className="text-[10px] text-[#666666] mt-1 block">Digunakan untuk login ke EXFIT Member App</span>
                                {errors.email && <p className="mt-1 text-xs text-[#ef4444]">{errors.email}</p>}
                            </div>

                            {/* Phone / WhatsApp */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cccccc] mb-1.5">
                                    Nomor WhatsApp / HP <span className="text-[#faff69]">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
                                    <input
                                        type="tel"
                                        required
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="081234567890"
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#faff69] focus:ring-1 focus:ring-[#faff69]"
                                    />
                                </div>
                                <span className="text-[10px] text-[#666666] mt-1 block">Notifikasi invoice & bukti pendaftaran via WA</span>
                                {errors.phone && <p className="mt-1 text-xs text-[#ef4444]">{errors.phone}</p>}
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cccccc] mb-1.5">
                                    Jenis Kelamin
                                </label>
                                <select
                                    value={data.gender}
                                    onChange={(e) => setData('gender', e.target.value as any)}
                                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#faff69] focus:ring-1 focus:ring-[#faff69]"
                                >
                                    <option value="">Pilih Jenis Kelamin</option>
                                    <option value="male">Laki-laki</option>
                                    <option value="female">Perempuan</option>
                                    <option value="other">Lainnya</option>
                                </select>
                                {errors.gender && <p className="mt-1 text-xs text-[#ef4444]">{errors.gender}</p>}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cccccc] mb-1.5">
                                    Tanggal Lahir
                                </label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
                                    <input
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#faff69] focus:ring-1 focus:ring-[#faff69]"
                                    />
                                </div>
                                {errors.date_of_birth && <p className="mt-1 text-xs text-[#ef4444]">{errors.date_of_birth}</p>}
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cccccc] mb-1.5">
                                    Alamat Domisili <span className="text-[#faff69]">*</span>
                                </label>
                                <div className="relative">
                                    <MapPin className="w-4 h-4 text-[#666666] absolute left-3.5 top-3" />
                                    <textarea
                                        required
                                        rows={2}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Jl. Jendral Sudirman No. 123..."
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#faff69] focus:ring-1 focus:ring-[#faff69]"
                                    />
                                </div>
                                {errors.address && <p className="mt-1 text-xs text-[#ef4444]">{errors.address}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Step 3: KTP Document Upload */}
                    <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-[#faff69] text-[#0a0a0a] font-black text-sm flex items-center justify-center">
                                03
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white uppercase tracking-wide">UNGGAH DOKUMEN IDENTITAS KTP <span className="text-[#faff69]">*</span></h2>
                                <p className="text-xs text-[#888888]">Wajib untuk verifikasi identitas resmi & keamanan keanggotaan</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleKtpChange}
                                accept="image/jpeg,image/png,image/jpg,application/pdf"
                                className="hidden"
                            />

                            {!data.ktp ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-[#333333] hover:border-[#faff69]/60 rounded-2xl p-8 text-center cursor-pointer transition-all bg-[#141414]/50 hover:bg-[#161616] group"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] text-[#888888] group-hover:text-[#faff69] group-hover:border-[#faff69]/40 flex items-center justify-center mx-auto mb-3 transition-colors">
                                        <Upload className="w-7 h-7" />
                                    </div>
                                    <div className="text-sm font-bold text-white group-hover:text-[#faff69] transition-colors">
                                        Klik untuk memilih foto / scan KTP Anda
                                    </div>
                                    <p className="text-xs text-[#777777] mt-1">
                                        Format file yang didukung: JPG, JPEG, PNG, atau PDF (Maksimal 5 MB)
                                    </p>
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a1a1a] text-[#888888] text-[10px] font-mono mt-3 border border-[#242424]">
                                        <Shield className="w-3 h-3 text-[#22c55e]" />
                                        Data KTP dienkripsi & disimpan secara privat di server
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 rounded-xl bg-[#161616] border border-[#2a2a2a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        {ktpPreview ? (
                                            <img
                                                src={ktpPreview}
                                                alt="KTP Preview"
                                                className="w-16 h-12 object-cover rounded-lg border border-[#333333]"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-[#1e1e1e] border border-[#333333] flex items-center justify-center text-[#faff69]">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                                <span>{ktpFileDetails?.name}</span>
                                                <span className="text-[#22c55e] text-[10px] font-mono flex items-center gap-0.5">
                                                    <Check className="w-3 h-3" /> Siap diunggah
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-[#888888] mt-0.5 font-mono">
                                                Ukuran: {ktpFileDetails?.size} • {ktpFileDetails?.isPdf ? 'Dokumen PDF' : 'Gambar'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-3 py-1.5 rounded-lg bg-[#222222] hover:bg-[#2a2a2a] text-xs font-medium text-white border border-[#333333] transition-colors cursor-pointer"
                                        >
                                            Ganti File
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleRemoveKtp}
                                            className="p-1.5 rounded-lg bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30 transition-colors cursor-pointer"
                                            title="Hapus KTP"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {errors.ktp && <p className="mt-1 text-xs text-[#ef4444]">{errors.ktp}</p>}
                        </div>
                    </div>

                    {/* Step 4: Emergency Contact & Additional Notes */}
                    <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-[#faff69] text-[#0a0a0a] font-black text-sm flex items-center justify-center">
                                04
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white uppercase tracking-wide">KONTAK DARURAT & CATATAN (OPSIONAL)</h2>
                                <p className="text-xs text-[#888888]">Keluarga atau kerabat terdekat yang dapat dihubungi jika terjadi keadaan darurat</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cccccc] mb-1.5">
                                    Nama Kontak Darurat
                                </label>
                                <input
                                    type="text"
                                    value={data.emergency_contact_name}
                                    onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                    placeholder="Nama kerabat"
                                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#faff69] focus:ring-1 focus:ring-[#faff69]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cccccc] mb-1.5">
                                    Nomor Telepon Darurat
                                </label>
                                <input
                                    type="tel"
                                    value={data.emergency_contact_phone}
                                    onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                    placeholder="081987654321"
                                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#faff69] focus:ring-1 focus:ring-[#faff69]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cccccc] mb-1.5">
                                    Hubungan
                                </label>
                                <input
                                    type="text"
                                    value={data.emergency_contact_relationship}
                                    onChange={(e) => setData('emergency_contact_relationship', e.target.value)}
                                    placeholder="Orang Tua / Pasangan / Sahabat"
                                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#faff69] focus:ring-1 focus:ring-[#faff69]"
                                />
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#cccccc] mb-1.5">
                                    Catatan Tambahan (Kondisi Kesehatan / Riwayat Medis / Target)
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Contoh: Memiliki riwayat cedera lutut, target menurunkan berat badan 5kg..."
                                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#faff69] focus:ring-1 focus:ring-[#faff69]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 5: Review & Agreement */}
                    <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8">
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-[#161616] border border-[#242424] space-y-2">
                                <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                                    RINGKASAN KEANGGOTAAN
                                </div>
                                {activeSelectedPlan && (
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-2 border-t border-[#222222]">
                                        <div>
                                            <span className="text-[#888888]">Paket Terpilih: </span>
                                            <span className="font-bold text-white uppercase">{activeSelectedPlan.name}</span>
                                            <span className="text-[#888888]"> ({activeSelectedPlan.duration} {activeSelectedPlan.billing_period === 'monthly' ? 'Bulan' : activeSelectedPlan.billing_period === 'yearly' ? 'Tahun' : 'Hari'})</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[#888888]">Total Biaya: </span>
                                            <span className="text-lg font-extrabold text-[#faff69] font-mono">
                                                Rp {Number(activeSelectedPlan.price).toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-3 border-t border-[#242424]">
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        required
                                        checked={data.agreed}
                                        onChange={(e) => setData('agreed', e.target.checked)}
                                        className="mt-1 rounded bg-[#1a1a1a] border-[#2a2a2a] text-[#faff69] focus:ring-[#faff69] w-4 h-4 cursor-pointer"
                                    />
                                    <span className="text-xs text-[#aaaaaa] leading-relaxed">
                                        Saya menyatakan data di atas dan dokumen KTP yang diunggah adalah sah dan benar. Saya menyetujui seluruh ketentuan privasi dan tata tertib {currentGym?.name || 'EXFITS GYM'}. 
                                        Saya bersedia melanjutkan ke halaman pembayaran Midtrans (QRIS / Virtual Account).
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Submit Action */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <Link
                                href={route('public.membership', { gym: currentGym?.slug })}
                                className="text-xs font-semibold text-[#888888] hover:text-white transition-colors"
                            >
                                ← Kembali ke Pilihan Membership
                            </Link>

                            <button
                                type="submit"
                                disabled={processing || !data.agreed || !data.ktp}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-sm font-extrabold tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(250,255,105,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
                                        <span>MEMPROSES PENDAFTARAN...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>LANJUT KE PEMBAYARAN MIDTRANS</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </PublicLayout>
    );
}
