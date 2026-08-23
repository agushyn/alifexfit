import { FormEvent, useState, useRef } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { MembershipPlan, PageProps } from '@/types';
import { 
    UserPlus, 
    ArrowLeft, 
    Sparkles, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Shield, 
    Camera, 
    Upload, 
    X, 
    AlertCircle, 
    CheckCircle2, 
    Zap 
} from 'lucide-react';

interface Props {
    membershipPlans: MembershipPlan[];
}

export default function OnsiteCreate({ membershipPlans }: Props) {
    const { gym } = usePage<PageProps>().props;
    const currentGym = gym.current;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const initialPlanId = membershipPlans[0]?.id ? String(membershipPlans[0].id) : '';

    const { data, setData, post, processing, errors } = useForm<{
        membership_plan_id: string;
        start_date: string;
        full_name: string;
        email: string;
        phone: string;
        gender: '' | 'male' | 'female' | 'other';
        date_of_birth: string;
        address: string;
        city: string;
        emergency_contact_name: string;
        emergency_contact_phone: string;
        emergency_contact_relationship: string;
        photo: File | null;
        notes: string;
    }>({
        membership_plan_id: initialPlanId,
        start_date: new Date().toISOString().split('T')[0],
        full_name: '',
        email: '',
        phone: '',
        gender: '',
        date_of_birth: '',
        address: '',
        city: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relationship: '',
        photo: null,
        notes: '',
    });

    const selectedPlan = membershipPlans.find((p) => String(p.id) === String(data.membership_plan_id)) || membershipPlans[0];

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('photo', file);
            const reader = new FileReader();
            reader.onload = (uploadEvent) => {
                setPhotoPreview(uploadEvent.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removePhoto = () => {
        setData('photo', null);
        setPhotoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.membership-registrations.onsite.store'), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            title="Onsite Walk-in Registration"
            header={{
                title: 'Onsite Member Registration',
                subtitle: `Pendaftaran member langsung (Front Desk) untuk cabang ${currentGym?.name || 'Exfits Gym'}.`,
            }}
        >
            <Head title="Onsite Registration — Admin" />

            {/* Back Navigation Bar */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <Link
                    href={route('admin.membership-registrations.index')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#161616] hover:bg-[#202020] text-xs font-semibold text-[#888888] hover:text-white border border-[#2a2a2a] transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Daftar Permohonan</span>
                </Link>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#faff69]/10 border border-[#faff69]/30 text-[#faff69] text-xs font-mono font-bold tracking-wider uppercase">
                    <Zap className="w-3.5 h-3.5" />
                    FRONT DESK INSTANT ACTIVATION
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Global Error Banner */}
                {Object.keys(errors).length > 0 && (
                    <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="text-xs">
                            <div className="font-bold">Mohon periksa kembali input formulir:</div>
                            <ul className="list-disc list-inside mt-1 space-y-0.5 text-[#ef4444]/90">
                                {Object.values(errors).map((err, idx) => (
                                    <li key={idx}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Columns: Form Fields */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Section 1: Membership Plan Selection */}
                        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-[#faff69] text-[#0a0a0a] font-black text-xs flex items-center justify-center">
                                        01
                                    </div>
                                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                                        PILIH PAKET MEMBERSHIP
                                    </h2>
                                </div>
                                <div className="text-xs text-[#888888]">
                                    {membershipPlans.length} Paket Aktif
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                {membershipPlans.map((plan) => {
                                    const isSelected = String(data.membership_plan_id) === String(plan.id);
                                    return (
                                        <button
                                            key={plan.id}
                                            type="button"
                                            onClick={() => setData('membership_plan_id', String(plan.id))}
                                            className={`relative p-4 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                                                isSelected
                                                    ? 'bg-[#181818] border-[#faff69] ring-1 ring-[#faff69] shadow-[0_0_15px_rgba(250,255,105,0.1)]'
                                                    : 'bg-[#161616] border-[#242424] hover:border-[#383838]'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-bold text-white uppercase">{plan.name}</span>
                                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                                        isSelected ? 'border-[#faff69] bg-[#faff69]' : 'border-[#444444]'
                                                    }`}>
                                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a]" />}
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-base font-black text-[#faff69] font-mono">
                                                    Rp {Number(plan.price).toLocaleString('id-ID')}
                                                </div>
                                                <div className="text-[11px] text-[#888888]">
                                                    Durasi: {plan.duration} {plan.billing_period === 'monthly' ? 'Bulan' : plan.billing_period === 'yearly' ? 'Tahun' : 'Hari'}
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-2 border-t border-[#242424] text-[10px] text-[#aaaaaa] flex items-center gap-1 font-mono">
                                                <Sparkles className="w-3 h-3 text-[#faff69]" />
                                                <span>Quota PT: {plan.trainer_quota} Sesi</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Start Date Picker */}
                            <div className="pt-3 border-t border-[#202020] grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                        Tanggal Mulai Membership <span className="text-[#faff69]">*</span>
                                    </label>
                                    <div className="relative">
                                        <Calendar className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
                                        <input
                                            type="date"
                                            required
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                        />
                                    </div>
                                    {errors.start_date && <p className="mt-1 text-[11px] text-[#ef4444]">{errors.start_date}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Member Personal Dossier */}
                        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-[#faff69] text-[#0a0a0a] font-black text-xs flex items-center justify-center">
                                    02
                                </div>
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                                    IDENTITAS CALON MEMBER
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                {/* Full Name */}
                                <div className="sm:col-span-2">
                                    <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                        Nama Lengkap (Sesuai KTP) <span className="text-[#faff69]">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
                                        <input
                                            type="text"
                                            required
                                            value={data.full_name}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                            placeholder="Contoh: Rian Pratama"
                                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                        />
                                    </div>
                                    {errors.full_name && <p className="mt-1 text-[11px] text-[#ef4444]">{errors.full_name}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                        Alamat Email <span className="text-[#faff69]">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
                                        <input
                                            type="email"
                                            required
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="nama@email.com"
                                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                        />
                                    </div>
                                    {errors.email && <p className="mt-1 text-[11px] text-[#ef4444]">{errors.email}</p>}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                        Nomor WhatsApp / HP <span className="text-[#faff69]">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
                                        <input
                                            type="tel"
                                            required
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="081234567890"
                                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                        />
                                    </div>
                                    {errors.phone && <p className="mt-1 text-[11px] text-[#ef4444]">{errors.phone}</p>}
                                </div>

                                {/* Gender */}
                                <div>
                                    <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                        Jenis Kelamin
                                    </label>
                                    <select
                                        value={data.gender}
                                        onChange={(e) => setData('gender', e.target.value as any)}
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                    >
                                        <option value="">Pilih Jenis Kelamin</option>
                                        <option value="male">Laki-laki</option>
                                        <option value="female">Perempuan</option>
                                        <option value="other">Lainnya</option>
                                    </select>
                                </div>

                                {/* DOB */}
                                <div>
                                    <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                        Tanggal Lahir
                                    </label>
                                    <div className="relative">
                                        <Calendar className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
                                        <input
                                            type="date"
                                            value={data.date_of_birth}
                                            onChange={(e) => setData('date_of_birth', e.target.value)}
                                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                        />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="sm:col-span-2">
                                    <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                        Alamat Domisili <span className="text-[#faff69]">*</span>
                                    </label>
                                    <div className="relative">
                                        <MapPin className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
                                        <textarea
                                            required
                                            rows={2}
                                            value={data.address}
                                            onChange={(e) => setData('address', e.target.value)}
                                            placeholder="Jl. Sudirman No. 123..."
                                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                        />
                                    </div>
                                    {errors.address && <p className="mt-1 text-[11px] text-[#ef4444]">{errors.address}</p>}
                                </div>

                                {/* City */}
                                <div>
                                    <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                        Kota / Wilayah
                                    </label>
                                    <input
                                        type="text"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="Contoh: Jakarta Selatan"
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                    />
                                </div>

                                {/* Photo Upload */}
                                <div>
                                    <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                        Foto Profil Member (Opsional)
                                    </label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] text-xs font-semibold text-white border border-[#2a2a2a] transition-all cursor-pointer"
                                        >
                                            <Camera className="w-3.5 h-3.5 text-[#faff69]" />
                                            <span>{photoPreview ? 'Ganti Foto' : 'Unggah Foto'}</span>
                                        </button>
                                        {photoPreview && (
                                            <button
                                                type="button"
                                                onClick={removePhoto}
                                                className="p-2 rounded-lg bg-[#ef4444]/10 hover:bg-[#ef4444]/20 text-[#ef4444] border border-[#ef4444]/30 transition-all cursor-pointer"
                                                title="Hapus Foto"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    {errors.photo && <p className="mt-1 text-[11px] text-[#ef4444]">{errors.photo}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Emergency Contact */}
                        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-lg bg-[#faff69] text-[#0a0a0a] font-black text-xs flex items-center justify-center">
                                    03
                                </div>
                                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                                    KONTAK DARURAT (OPSIONAL)
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div>
                                    <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                        Nama Kerabat
                                    </label>
                                    <input
                                        type="text"
                                        value={data.emergency_contact_name}
                                        onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                        placeholder="Nama kerabat"
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                        Nomor Telepon Darurat
                                    </label>
                                    <input
                                        type="tel"
                                        value={data.emergency_contact_phone}
                                        onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                        placeholder="081987654321"
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                        Hubungan
                                    </label>
                                    <input
                                        type="text"
                                        value={data.emergency_contact_relationship}
                                        onChange={(e) => setData('emergency_contact_relationship', e.target.value)}
                                        placeholder="Orang Tua / Pasangan"
                                        className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Internal Notes */}
                        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6">
                            <h2 className="text-xs font-bold text-[#888888] uppercase tracking-wider font-mono mb-2">
                                CATATAN INTERNAL FRONT DESK
                            </h2>
                            <textarea
                                rows={2}
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Catatan khusus member / preferensi latihan..."
                                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                            />
                        </div>
                    </div>

                    {/* Right Column: Live Summary & Submission */}
                    <div className="space-y-6">
                        {/* Photo Preview Widget */}
                        {photoPreview && (
                            <div className="bg-[#121212] border border-[#242424] rounded-2xl p-4 text-center">
                                <div className="text-[10px] font-mono uppercase text-[#888888] mb-2">PREVIEW FOTO PROFIL</div>
                                <img
                                    src={photoPreview}
                                    alt="Preview"
                                    className="w-28 h-28 rounded-full object-cover mx-auto border-2 border-[#faff69] shadow-[0_0_15px_rgba(250,255,105,0.2)]"
                                />
                            </div>
                        )}

                        {/* Live Summary Dossier Card */}
                        <div className="bg-[#121212] border border-[#faff69]/30 rounded-2xl p-6 space-y-4 shadow-[0_0_20px_rgba(250,255,105,0.05)]">
                            <div className="flex items-center gap-2 pb-3 border-b border-[#242424]">
                                <div className="w-8 h-8 rounded-lg bg-[#faff69] text-[#0a0a0a] flex items-center justify-center font-black text-sm">
                                    EX
                                </div>
                                <div>
                                    <div className="text-[10px] font-mono text-[#888888] uppercase">RINGKASAN PENDAFTARAN</div>
                                    <div className="text-xs font-extrabold text-white uppercase">{currentGym?.name}</div>
                                </div>
                            </div>

                            {/* Plan Info */}
                            {selectedPlan && (
                                <div className="p-3.5 rounded-xl bg-[#161616] border border-[#242424] space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-[#888888] uppercase">PAKET TERPILIH</span>
                                        <span className="text-xs font-bold text-white uppercase">{selectedPlan.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-[#888888] uppercase">BIAYA MEMBERSHIP</span>
                                        <span className="text-base font-extrabold text-[#faff69] font-mono">
                                            Rp {Number(selectedPlan.price).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] text-[#aaaaaa]">
                                        <span>Quota Personal Trainer:</span>
                                        <span className="font-mono font-bold text-white">{selectedPlan.trainer_quota} Sesi</span>
                                    </div>
                                </div>
                            )}

                            {/* Member Preview */}
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                                    <span className="text-[#888888]">Nama Member:</span>
                                    <span className="font-bold text-white">{data.full_name || '-'}</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                                    <span className="text-[#888888]">Email:</span>
                                    <span className="font-mono text-white text-[11px]">{data.email || '-'}</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                                    <span className="text-[#888888]">No. WhatsApp:</span>
                                    <span className="font-mono text-[#faff69]">{data.phone || '-'}</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                                    <span className="text-[#888888]">Mulai Berlaku:</span>
                                    <span className="font-mono text-white">{data.start_date || '-'}</span>
                                </div>
                            </div>

                            {/* Submit Action */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={processing || !data.full_name || !data.email || !data.phone || !data.address}
                                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(250,255,105,0.25)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
                                            <span>MEMPROSES PENDAFTARAN...</span>
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-4 h-4" />
                                            <span>DAFTARKAN MEMBER</span>
                                        </>
                                    )}
                                </button>
                                <p className="mt-2 text-[10px] text-[#666666] text-center leading-relaxed">
                                    Pendaftaran onsite langsung mengaktifkan status member & membership tanpa approval terpisah.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
