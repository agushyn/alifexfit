import { FormEvent } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { MembershipPlan, PageProps, User } from '@/types';
import { 
    ArrowLeft, 
    UserPlus, 
    User as UserIcon, 
    Mail, 
    Phone, 
    MessageSquare, 
    Tag, 
    Share2, 
    AlertCircle, 
    Sparkles 
} from 'lucide-react';

interface Props {
    membershipPlans: MembershipPlan[];
    staffUsers: User[];
}

export default function LeadsCreate({ membershipPlans, staffUsers }: Props) {
    const { gym } = usePage<PageProps>().props;
    const currentGym = gym.current;

    const { data, setData, post, processing, errors } = useForm<{
        name: string;
        phone: string;
        email: string;
        whatsapp: string;
        source: string;
        source_detail: string;
        interest_type: string;
        membership_plan_id: string;
        assigned_to: string;
        message: string;
        notes: string;
    }>({
        name: '',
        phone: '',
        email: '',
        whatsapp: '',
        source: 'walk_in',
        source_detail: '',
        interest_type: 'membership',
        membership_plan_id: '',
        assigned_to: '',
        message: '',
        notes: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post(route('admin.leads.store'));
    };

    return (
        <AuthenticatedLayout
            title="Tambah Prospek Baru"
            header={{
                title: 'Tambah Prospek Baru',
                subtitle: `Pencatatan prospek inquiry calon member untuk cabang ${currentGym?.name || 'Exfits Gym'}.`,
            }}
        >
            <Head title="Tambah Prospek — Admin" />

            <div className="max-w-4xl mx-auto py-4">
                {/* Back Nav */}
                <div className="mb-6">
                    <Link
                        href={route('admin.leads.index')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#161616] hover:bg-[#202020] text-xs font-semibold text-[#888888] hover:text-white border border-[#2a2a2a] transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Daftar Prospek</span>
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error Banner */}
                    {Object.keys(errors).length > 0 && (
                        <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#ef4444] flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div className="text-xs">
                                <div className="font-bold">Mohon lengkapi data prospek:</div>
                                <ul className="list-disc list-inside mt-1 space-y-0.5">
                                    {Object.values(errors).map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Section 1: Contact Dossier */}
                    <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6">
                        <h2 className="text-xs font-bold text-[#faff69] uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            1. IDENTITAS CALON PROSPEK
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            {/* Name */}
                            <div className="sm:col-span-2">
                                <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                    Nama Lengkap <span className="text-[#faff69]">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Budi Gunawan"
                                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                />
                                {errors.name && <p className="mt-1 text-[11px] text-[#ef4444]">{errors.name}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                    Nomor Telepon / WhatsApp <span className="text-[#faff69]">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="081234567890"
                                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                />
                                {errors.phone && <p className="mt-1 text-[11px] text-[#ef4444]">{errors.phone}</p>}
                            </div>

                            {/* WhatsApp */}
                            <div>
                                <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                    Nomor WhatsApp (Opsional jika beda)
                                </label>
                                <input
                                    type="tel"
                                    value={data.whatsapp}
                                    onChange={(e) => setData('whatsapp', e.target.value)}
                                    placeholder="081234567890"
                                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                />
                            </div>

                            {/* Email */}
                            <div className="sm:col-span-2">
                                <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                    Alamat Email (Opsional)
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@email.com"
                                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                />
                                {errors.email && <p className="mt-1 text-[11px] text-[#ef4444]">{errors.email}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Source & Assignment */}
                    <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6">
                        <h2 className="text-xs font-bold text-[#faff69] uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
                            <Share2 className="w-4 h-4" />
                            2. SUMBER & PENUGASAN STAFF
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            {/* Source */}
                            <div>
                                <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                    Sumber Prospek <span className="text-[#faff69]">*</span>
                                </label>
                                <select
                                    value={data.source}
                                    onChange={(e) => setData('source', e.target.value)}
                                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                >
                                    <option value="walk_in">Walk-in Front Desk</option>
                                    <option value="whatsapp">WhatsApp / Chat</option>
                                    <option value="instagram">Instagram Direct</option>
                                    <option value="facebook">Facebook</option>
                                    <option value="referral">Referral Member</option>
                                    <option value="website">Website</option>
                                    <option value="other">Lainnya</option>
                                </select>
                            </div>

                            {/* Source Detail */}
                            <div>
                                <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                    Detail Sumber (Nama Referer / Kampanye)
                                </label>
                                <input
                                    type="text"
                                    value={data.source_detail}
                                    onChange={(e) => setData('source_detail', e.target.value)}
                                    placeholder="Contoh: Teman dari Member Arya"
                                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                />
                            </div>

                            {/* Assigned Staff */}
                            <div className="sm:col-span-2">
                                <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                    Tugaskan Staff Follow-up (Opsional)
                                </label>
                                <select
                                    value={data.assigned_to}
                                    onChange={(e) => setData('assigned_to', e.target.value)}
                                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                >
                                    <option value="">-- Belum Ditugaskan --</option>
                                    {staffUsers.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Interest & Notes */}
                    <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6">
                        <h2 className="text-xs font-bold text-[#faff69] uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            3. MINAT & CATATAN KHUSUS
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            {/* Interest Type */}
                            <div>
                                <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                    Minat Utama
                                </label>
                                <select
                                    value={data.interest_type}
                                    onChange={(e) => setData('interest_type', e.target.value)}
                                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                >
                                    <option value="membership">Membership Gym</option>
                                    <option value="trial">Free Trial</option>
                                    <option value="personal_training">Personal Training</option>
                                    <option value="workout">Program Workout</option>
                                    <option value="general_inquiry">Pertanyaan Umum</option>
                                    <option value="other">Lainnya</option>
                                </select>
                            </div>

                            {/* Membership Plan */}
                            <div>
                                <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                    Paket Diminati (Opsional)
                                </label>
                                <select
                                    value={data.membership_plan_id}
                                    onChange={(e) => setData('membership_plan_id', e.target.value)}
                                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                >
                                    <option value="">-- Pilih Paket (Opsional) --</option>
                                    {membershipPlans.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (Rp {Number(p.price).toLocaleString('id-ID')})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Message */}
                            <div className="sm:col-span-2">
                                <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                    Pesan / Pertanyaan Calon Prospek
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.message}
                                    onChange={(e) => setData('message', e.target.value)}
                                    placeholder="Tujuan fitness atau pertanyaan yang disampaikan..."
                                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                />
                            </div>

                            {/* Internal Notes */}
                            <div className="sm:col-span-2">
                                <label className="block font-semibold uppercase tracking-wider text-[#cccccc] mb-1">
                                    Catatan Internal Staff
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Catatan strategi follow-up..."
                                    className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Action */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            href={route('admin.leads.index')}
                            className="px-5 py-2.5 rounded-xl bg-[#161616] hover:bg-[#202020] text-xs font-semibold text-[#888888] hover:text-white border border-[#2a2a2a] transition-all"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing || !data.name || !data.phone}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(250,255,105,0.2)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {processing ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4" />
                                    <span>SIMPAN PROSPEK</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
