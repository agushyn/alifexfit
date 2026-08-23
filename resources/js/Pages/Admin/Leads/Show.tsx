import { FormEvent, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Modal } from '@/Components/Modal';
import { Lead, MembershipPlan, User } from '@/types';
import { 
    ArrowLeft, 
    User as UserIcon, 
    Mail, 
    Phone, 
    MessageSquare, 
    Tag, 
    Calendar, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Sparkles, 
    Flame, 
    UserCheck, 
    Send, 
    ExternalLink, 
    Shield, 
    AlertCircle, 
    Zap,
    Building2
} from 'lucide-react';

interface Props {
    lead: Lead;
    membershipPlans: MembershipPlan[];
    staffUsers: User[];
}

export default function LeadsShow({ lead, membershipPlans, staffUsers }: Props) {
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [convertModalOpen, setConvertModalOpen] = useState(false);
    const [statusModalOpen, setStatusModalOpen] = useState(false);

    // Assignment Form
    const assignForm = useForm({
        assigned_to: lead.assigned_to ? String(lead.assigned_to) : '',
    });

    const handleAssign = (e: FormEvent) => {
        e.preventDefault();
        assignForm.post(route('admin.leads.assign', lead.id));
    };

    // Status Form
    const statusForm = useForm({
        status: lead.status,
        reason: '',
    });

    const handleStatusChange = (e: FormEvent) => {
        e.preventDefault();
        statusForm.post(route('admin.leads.status', lead.id), {
            onSuccess: () => setStatusModalOpen(false),
        });
    };

    // Follow-up Activity Form
    const contactForm = useForm({
        type: 'call',
        note: '',
        contacted_at: new Date().toISOString().slice(0, 16),
        next_follow_up_at: '',
    });

    const handleRecordContact = (e: FormEvent) => {
        e.preventDefault();
        contactForm.post(route('admin.leads.contact', lead.id), {
            onSuccess: () => {
                setContactModalOpen(false);
                contactForm.reset();
            },
        });
    };

    // Conversion Form
    const convertForm = useForm({
        membership_plan_id: lead.membership_plan_id ? String(lead.membership_plan_id) : (membershipPlans[0]?.id ? String(membershipPlans[0].id) : ''),
        full_name: lead.name,
        email: lead.email || '',
        phone: lead.phone,
        address: '',
    });

    const handleConvert = (e: FormEvent) => {
        e.preventDefault();
        convertForm.post(route('admin.leads.convert', lead.id), {
            onSuccess: () => setConvertModalOpen(false),
        });
    };

    const getStatusBadge = (leadStatus: string) => {
        switch (leadStatus) {
            case 'new':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#3b82f6]/10 text-[#60a5fa] border border-[#3b82f6]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] animate-pulse" />
                        NEW
                    </span>
                );
            case 'contacted':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#faff69]/10 text-[#faff69] border border-[#faff69]/30">
                        <Phone className="w-3.5 h-3.5" />
                        CONTACTED
                    </span>
                );
            case 'qualified':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#a855f7]/10 text-[#c084fc] border border-[#a855f7]/30">
                        <Sparkles className="w-3.5 h-3.5" />
                        QUALIFIED
                    </span>
                );
            case 'interested':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#f97316]/10 text-[#fb923c] border border-[#f97316]/30">
                        <Flame className="w-3.5 h-3.5" />
                        INTERESTED
                    </span>
                );
            case 'converted':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        CONVERTED
                    </span>
                );
            case 'not_interested':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#888888]/10 text-[#888888] border border-[#888888]/30">
                        NOT INTERESTED
                    </span>
                );
            case 'lost':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30">
                        <XCircle className="w-3.5 h-3.5" />
                        LOST
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout
            title={`Lead #${lead.lead_number} — ${lead.name}`}
            header={{
                title: `Lead #${lead.lead_number}`,
                subtitle: `Prospek calon member ${lead.name} untuk cabang ${lead.gym?.name || 'Exfits Gym'}.`,
            }}
        >
            <Head title={`Lead #${lead.lead_number} — Admin`} />

            {/* Top Navigation & Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Link
                        href={route('admin.leads.index')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#161616] hover:bg-[#202020] text-xs font-semibold text-[#888888] hover:text-white border border-[#2a2a2a] transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Daftar Prospek</span>
                    </Link>
                    {getStatusBadge(lead.status)}
                </div>

                <div className="flex items-center gap-2">
                    {!lead.is_terminal && (
                        <>
                            <button
                                type="button"
                                onClick={() => setStatusModalOpen(true)}
                                className="px-3.5 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] text-xs font-bold text-[#cccccc] hover:text-white border border-[#2a2a2a] transition-all cursor-pointer"
                            >
                                Ubah Status
                            </button>

                            <button
                                type="button"
                                onClick={() => setContactModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#161616] hover:bg-[#202020] text-xs font-bold text-[#faff69] border border-[#faff69]/30 transition-all cursor-pointer"
                            >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Catat Follow-up</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setConvertModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(250,255,105,0.25)] cursor-pointer"
                            >
                                <Zap className="w-3.5 h-3.5" />
                                <span>Konversi ke Pendaftaran</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Conversion Banner (If already converted) */}
            {lead.status === 'converted' && lead.membership_registration && (
                <div className="mb-6 p-5 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#22c55e] text-[#0a0a0a] flex items-center justify-center font-black">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-[#22c55e] uppercase tracking-wider font-mono">
                                PROSPEK TELAH DIKONVERSI KE PERMOHONAN PENDAFTARAN
                            </div>
                            <div className="text-sm font-extrabold text-white">
                                Nomor Registrasi: #{lead.membership_registration.registration_number} ({lead.membership_registration.status.toUpperCase()})
                            </div>
                            {lead.membership_registration.member && (
                                <div className="text-xs text-[#22c55e] mt-0.5 font-mono">
                                    Member Aktif: {lead.membership_registration.member.full_name} ({lead.membership_registration.member.member_number})
                                </div>
                            )}
                        </div>
                    </div>
                    <Link
                        href={route('admin.membership-registrations.show', lead.membership_registration.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#161616] hover:bg-[#202020] text-xs font-bold text-white border border-[#2a2a2a] transition-all"
                    >
                        <span>Lihat Permohonan Pendaftaran</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Details & Activity History */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Dossier */}
                    <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6">
                        <h2 className="text-xs font-bold text-[#888888] uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-[#faff69]" />
                            IDENTITAS & KONTAK
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#202020]">
                                <span className="text-[#888888] block text-[10px] uppercase">NAMA PROSPEK</span>
                                <span className="text-sm font-bold text-white mt-0.5 block">{lead.name}</span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#202020]">
                                <span className="text-[#888888] block text-[10px] uppercase">NOMOR TELEPON</span>
                                <span className="text-sm font-mono font-bold text-[#faff69] mt-0.5 block">{lead.phone}</span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#202020]">
                                <span className="text-[#888888] block text-[10px] uppercase">WHATSAPP</span>
                                <span className="text-xs font-mono text-white mt-0.5 block">{lead.whatsapp || lead.phone}</span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#202020]">
                                <span className="text-[#888888] block text-[10px] uppercase">ALAMAT EMAIL</span>
                                <span className="text-xs font-mono text-white mt-0.5 block">{lead.email || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Interest & Message */}
                    <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6">
                        <h2 className="text-xs font-bold text-[#888888] uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-[#faff69]" />
                            MINAT & PESAN CALON PROSPEK
                        </h2>

                        <div className="space-y-4 text-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-[#161616] border border-[#202020] gap-2">
                                <div>
                                    <span className="text-[10px] text-[#888888] uppercase">MINAT UTAMA:</span>
                                    <div className="font-bold text-white capitalize text-sm">{lead.interest_type?.replace('_', ' ') || 'General'}</div>
                                </div>
                                {lead.membership_plan && (
                                    <div className="text-right sm:text-right">
                                        <span className="text-[10px] text-[#888888] uppercase">PAKET TERPILIH:</span>
                                        <div className="font-bold text-[#faff69]">{lead.membership_plan.name}</div>
                                        <div className="text-[10px] text-[#888888] font-mono">
                                            Rp {Number(lead.membership_plan.price).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {lead.message && (
                                <div className="p-4 rounded-xl bg-[#161616] border border-[#202020]">
                                    <span className="text-[10px] text-[#888888] uppercase block mb-1">PESAN / PERTANYAAN:</span>
                                    <p className="text-xs text-white leading-relaxed whitespace-pre-wrap">
                                        "{lead.message}"
                                    </p>
                                </div>
                            )}

                            {lead.notes && (
                                <div className="p-4 rounded-xl bg-[#161616] border border-[#202020]">
                                    <span className="text-[10px] text-[#888888] uppercase block mb-1">CATATAN INTERNAL:</span>
                                    <p className="text-xs text-[#cccccc] leading-relaxed whitespace-pre-wrap">
                                        {lead.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Follow-up Activities History */}
                    <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs font-bold text-[#888888] uppercase tracking-wider font-mono flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#faff69]" />
                                RIWAYAT AKTIVITAS FOLLOW-UP
                            </h2>
                            <span className="text-[11px] text-[#666666]">
                                {lead.activities?.length || 0} Catatan
                            </span>
                        </div>

                        {(!lead.activities || lead.activities.length === 0) ? (
                            <div className="p-8 text-center bg-[#161616] rounded-xl border border-[#202020]">
                                <Phone className="w-6 h-6 mx-auto mb-2 text-[#444444]" />
                                <p className="text-xs text-[#666666]">Belum ada aktivitas follow-up yang dicatat.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lead.activities.map((act) => (
                                    <div key={act.id} className="p-4 rounded-xl bg-[#161616] border border-[#202020] text-xs space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 rounded bg-[#1f1f1f] text-[#faff69] font-mono text-[10px] uppercase font-bold">
                                                    {act.type.toUpperCase()}
                                                </span>
                                                <span className="font-semibold text-white">
                                                    {act.user?.name || 'Staff'}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-mono text-[#888888]">
                                                {new Date(act.contacted_at).toLocaleString('id-ID')}
                                            </span>
                                        </div>

                                        <p className="text-xs text-[#cccccc] leading-relaxed whitespace-pre-wrap">
                                            {act.note}
                                        </p>

                                        {act.next_follow_up_at && (
                                            <div className="pt-2 border-t border-[#202020] text-[11px] text-[#faff69] flex items-center gap-1 font-mono">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>Next Follow-up: {new Date(act.next_follow_up_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Metadata & Staff Assignment */}
                <div className="space-y-6">
                    {/* Staff Assignment Card */}
                    <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4">
                        <h2 className="text-xs font-bold text-[#888888] uppercase tracking-wider font-mono flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-[#faff69]" />
                            PENUGASAN STAFF
                        </h2>

                        <form onSubmit={handleAssign} className="space-y-3 text-xs">
                            <div>
                                <label className="block text-[#888888] mb-1">Staff Penanggung Jawab:</label>
                                <select
                                    value={assignForm.data.assigned_to}
                                    onChange={(e) => assignForm.setData('assigned_to', e.target.value)}
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

                            <button
                                type="submit"
                                disabled={assignForm.processing}
                                className="w-full py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] text-xs font-bold text-white border border-[#2a2a2a] transition-all cursor-pointer"
                            >
                                {assignForm.processing ? 'Menyimpan...' : 'Simpan Penugasan'}
                            </button>
                        </form>
                    </div>

                    {/* Timeline & Metadata Card */}
                    <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 text-xs space-y-3">
                        <h2 className="text-xs font-bold text-[#888888] uppercase tracking-wider font-mono mb-3">
                            METADATA PROSPEK
                        </h2>

                        <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                            <span className="text-[#888888]">Sumber:</span>
                            <span className="font-mono text-white uppercase">{lead.source}</span>
                        </div>

                        {lead.source_detail && (
                            <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                                <span className="text-[#888888]">Detail Sumber:</span>
                                <span className="text-white">{lead.source_detail}</span>
                            </div>
                        )}

                        <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                            <span className="text-[#888888]">Tgl Dibuat:</span>
                            <span className="font-mono text-white">
                                {new Date(lead.created_at).toLocaleString('id-ID')}
                            </span>
                        </div>

                        <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                            <span className="text-[#888888]">Last Contact:</span>
                            <span className="font-mono text-white">
                                {lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleString('id-ID') : '-'}
                            </span>
                        </div>

                        <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                            <span className="text-[#888888]">Next Follow-up:</span>
                            <span className="font-mono text-[#faff69]">
                                {lead.next_follow_up_at ? new Date(lead.next_follow_up_at).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '-'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal 1: Catat Follow-up */}
            <Modal isOpen={contactModalOpen} onClose={() => setContactModalOpen(false)} title="Catat Aktivitas Follow-up">
                <form onSubmit={handleRecordContact} className="space-y-4 text-xs">
                    <div>
                        <label className="block font-semibold uppercase text-[#cccccc] mb-1">
                            Jenis Aktivitas <span className="text-[#faff69]">*</span>
                        </label>
                        <select
                            value={contactForm.data.type}
                            onChange={(e) => contactForm.setData('type', e.target.value)}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        >
                            <option value="call">Panggilan Telepon (Call)</option>
                            <option value="whatsapp">Pesan WhatsApp</option>
                            <option value="visit">Kunjungan Langsung (Gym Visit)</option>
                            <option value="email">Email</option>
                            <option value="note">Catatan Internal</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold uppercase text-[#cccccc] mb-1">
                            Waktu Kontak <span className="text-[#faff69]">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            required
                            value={contactForm.data.contacted_at}
                            onChange={(e) => contactForm.setData('contacted_at', e.target.value)}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold uppercase text-[#cccccc] mb-1">
                            Catatan Percakapan / Respon <span className="text-[#faff69]">*</span>
                        </label>
                        <textarea
                            rows={3}
                            required
                            value={contactForm.data.note}
                            onChange={(e) => contactForm.setData('note', e.target.value)}
                            placeholder="Catat hasil pembicaraan, pertanyaan calon member, respon..."
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold uppercase text-[#cccccc] mb-1">
                            Jadwal Follow-up Selanjutnya (Opsional)
                        </label>
                        <input
                            type="date"
                            value={contactForm.data.next_follow_up_at}
                            onChange={(e) => contactForm.setData('next_follow_up_at', e.target.value)}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#202020]">
                        <button
                            type="button"
                            onClick={() => setContactModalOpen(false)}
                            className="px-4 py-2 rounded-lg bg-[#161616] hover:bg-[#202020] text-xs font-semibold text-[#888888] hover:text-white border border-[#2a2a2a]"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={contactForm.processing}
                            className="px-5 py-2 rounded-lg bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider transition-all"
                        >
                            {contactForm.processing ? 'Menyimpan...' : 'Simpan Follow-up'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal 2: Change Status */}
            <Modal isOpen={statusModalOpen} onClose={() => setStatusModalOpen(false)} title="Ubah Status Pipeline Prospek">
                <form onSubmit={handleStatusChange} className="space-y-4 text-xs">
                    <div>
                        <label className="block font-semibold uppercase text-[#cccccc] mb-1">
                            Pilih Status Baru <span className="text-[#faff69]">*</span>
                        </label>
                        <select
                            value={statusForm.data.status}
                            onChange={(e) => statusForm.setData('status', e.target.value)}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        >
                            <option value="new">New (Baru Masuk)</option>
                            <option value="contacted">Contacted (Sudah Dihubungi)</option>
                            <option value="qualified">Qualified (Memenuhi Kriteria)</option>
                            <option value="interested">Interested (Sangat Tertarik)</option>
                            <option value="not_interested">Not Interested (Tidak Tertarik)</option>
                            <option value="lost">Lost (Gagal / Batal)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block font-semibold uppercase text-[#cccccc] mb-1">
                            Alasan Perubahan Status (Opsional)
                        </label>
                        <textarea
                            rows={2}
                            value={statusForm.data.reason}
                            onChange={(e) => statusForm.setData('reason', e.target.value)}
                            placeholder="Alasan khusus..."
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#202020]">
                        <button
                            type="button"
                            onClick={() => setStatusModalOpen(false)}
                            className="px-4 py-2 rounded-lg bg-[#161616] hover:bg-[#202020] text-xs font-semibold text-[#888888] hover:text-white border border-[#2a2a2a]"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={statusForm.processing}
                            className="px-5 py-2 rounded-lg bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider"
                        >
                            {statusForm.processing ? 'Menyimpan...' : 'Perbarui Status'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal 3: Convert Lead to Registration */}
            <Modal isOpen={convertModalOpen} onClose={() => setConvertModalOpen(false)} title="Konversi Prospek ke Permohonan Pendaftaran">
                <form onSubmit={handleConvert} className="space-y-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-[#faff69]/10 border border-[#faff69]/30 text-xs text-[#cccccc] leading-relaxed">
                        <strong className="text-white">Catatan Alur Konversi:</strong> Tindakan ini akan menerbitkan dokumen <strong className="text-[#faff69]">Permohonan Pendaftaran Membership</strong> berstatus <em>Pending</em>. Data Member resmi baru akan aktif setelah disetujui di portal pendaftaran.
                    </div>

                    <div>
                        <label className="block font-semibold uppercase text-[#cccccc] mb-1">
                            Pilih Paket Membership <span className="text-[#faff69]">*</span>
                        </label>
                        <select
                            required
                            value={convertForm.data.membership_plan_id}
                            onChange={(e) => convertForm.setData('membership_plan_id', e.target.value)}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        >
                            <option value="">-- Pilih Paket Membership --</option>
                            {membershipPlans.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} (Rp {Number(p.price).toLocaleString('id-ID')}) — Quota PT: {p.trainer_quota}
                                </option>
                            ))}
                        </select>
                        {convertForm.errors.membership_plan_id && (
                            <p className="mt-1 text-[11px] text-[#ef4444]">{convertForm.errors.membership_plan_id}</p>
                        )}
                    </div>

                    <div>
                        <label className="block font-semibold uppercase text-[#cccccc] mb-1">
                            Nama Lengkap Member <span className="text-[#faff69]">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={convertForm.data.full_name}
                            onChange={(e) => convertForm.setData('full_name', e.target.value)}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold uppercase text-[#cccccc] mb-1">
                            Alamat Email
                        </label>
                        <input
                            type="email"
                            value={convertForm.data.email}
                            onChange={(e) => convertForm.setData('email', e.target.value)}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold uppercase text-[#cccccc] mb-1">
                            Nomor Telepon / WhatsApp <span className="text-[#faff69]">*</span>
                        </label>
                        <input
                            type="tel"
                            required
                            value={convertForm.data.phone}
                            onChange={(e) => convertForm.setData('phone', e.target.value)}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        />
                    </div>

                    <div>
                        <label className="block font-semibold uppercase text-[#cccccc] mb-1">
                            Alamat Domisili (Opsional)
                        </label>
                        <input
                            type="text"
                            value={convertForm.data.address}
                            onChange={(e) => convertForm.setData('address', e.target.value)}
                            placeholder="Alamat tempat tinggal..."
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#202020]">
                        <button
                            type="button"
                            onClick={() => setConvertModalOpen(false)}
                            className="px-4 py-2 rounded-lg bg-[#161616] hover:bg-[#202020] text-xs font-semibold text-[#888888] hover:text-white border border-[#2a2a2a]"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={convertForm.processing}
                            className="px-5 py-2 rounded-lg bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(250,255,105,0.25)]"
                        >
                            {convertForm.processing ? 'Mengonversi...' : 'Konfirmasi & Konversi'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
