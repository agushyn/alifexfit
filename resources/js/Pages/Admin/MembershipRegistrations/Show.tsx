import { FormEvent, useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { MembershipRegistration } from '@/types';
import { Modal } from '@/Components/Modal';
import { 
    CheckCircle2, 
    XCircle, 
    Ban, 
    ArrowLeft, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Sparkles, 
    Clock, 
    Shield, 
    FileText, 
    ExternalLink, 
    AlertTriangle,
    CreditCard,
    Building2,
    QrCode,
    RefreshCw,
    FileCheck
} from 'lucide-react';

interface Props {
    registration: MembershipRegistration;
}

export default function MembershipRegistrationsShow({ registration }: Props) {
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);

    // Approve Form
    const approveForm = useForm({
        start_date: new Date().toISOString().split('T')[0],
        payment_status: 'paid' as 'paid' | 'pending',
        notes: '',
    });

    // Reject Form
    const rejectForm = useForm({
        rejection_reason: '',
    });

    // Cancel Form
    const cancelForm = useForm({
        reason: '',
    });

    // Retry Activation Form
    const retryActivationForm = useForm({});

    const handleApprove = (e: FormEvent) => {
        e.preventDefault();
        approveForm.post(route('admin.membership-registrations.approve', registration.id), {
            onSuccess: () => setApproveModalOpen(false),
        });
    };

    const handleReject = (e: FormEvent) => {
        e.preventDefault();
        rejectForm.post(route('admin.membership-registrations.reject', registration.id), {
            onSuccess: () => setRejectModalOpen(false),
        });
    };

    const handleCancel = (e: FormEvent) => {
        e.preventDefault();
        cancelForm.post(route('admin.membership-registrations.cancel', registration.id), {
            onSuccess: () => setCancelModalOpen(false),
        });
    };

    const handleRetryActivation = () => {
        if (confirm(`Apakah Anda yakin ingin memproses ulang aktivasi member untuk registrasi #${registration.registration_number}?`)) {
            retryActivationForm.post(route('admin.membership-registrations.retry-activation', registration.id));
        }
    };

    const getStatusBadge = () => {
        switch (registration.status) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#faff69]/10 text-[#faff69] border border-[#faff69]/30">
                        <span className="w-2 h-2 rounded-full bg-[#faff69] animate-pulse" />
                        PENDING REVIEW
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                        <CheckCircle2 className="w-4 h-4" />
                        APPROVED / AKTIF
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30">
                        <XCircle className="w-4 h-4" />
                        REJECTED
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#888888]/10 text-[#888888] border border-[#888888]/30">
                        <Ban className="w-4 h-4" />
                        CANCELLED
                    </span>
                );
            default:
                return null;
        }
    };

    const getPaymentBadge = () => {
        switch (registration.payment_status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        PEMBAYARAN LUNAS (PAID)
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#faff69]/10 text-[#faff69] border border-[#faff69]/30">
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                        MENUNGGU PEMBAYARAN
                    </span>
                );
            case 'expired':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30">
                        PAYMENT EXPIRED
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#1c1c1c] text-[#888888] border border-[#2a2a2a]">
                        BELUM DIBAYAR (UNPAID)
                    </span>
                );
        }
    };

    const latestPayment = registration.latest_payment;

    return (
        <AuthenticatedLayout
            title={`Review Application #${registration.registration_number}`}
            header={{
                title: `Registration Application #${registration.registration_number}`,
                subtitle: `Submitted by ${registration.full_name} on ${new Date(registration.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}`,
            }}
        >
            <Head title={`Registration #${registration.registration_number} — Admin`} />

            {/* Top Bar Navigation & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                        href={route('admin.membership-registrations.index')}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#161616] hover:bg-[#202020] text-xs font-semibold text-[#888888] hover:text-white border border-[#2a2a2a] transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Daftar Permohonan</span>
                    </Link>
                    {getStatusBadge()}
                    {getPaymentBadge()}
                    {registration.source === 'admin' && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#faff69]/10 text-[#faff69] border border-[#faff69]/30">
                            SOURCE: ONSITE
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Retry Activation Action (Recovery) */}
                    {registration.payment_status === 'paid' && (!registration.member || registration.status !== 'approved') && (
                        <button
                            type="button"
                            onClick={handleRetryActivation}
                            disabled={retryActivationForm.processing}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-black text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${retryActivationForm.processing ? 'animate-spin' : ''}`} />
                            <span>{retryActivationForm.processing ? 'Memproses...' : 'Ulangi Aktivasi Member'}</span>
                        </button>
                    )}

                    {registration.status === 'pending' && (
                        <>
                            <button
                                type="button"
                                onClick={() => setCancelModalOpen(true)}
                                className="px-3.5 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] text-xs font-bold text-[#888888] hover:text-white border border-[#2a2a2a] transition-all cursor-pointer"
                            >
                                Batalkan
                            </button>
                            <button
                                type="button"
                                onClick={() => setRejectModalOpen(true)}
                                className="px-4 py-2 rounded-lg bg-[#ef4444]/15 hover:bg-[#ef4444]/25 text-xs font-bold text-[#ef4444] border border-[#ef4444]/30 transition-all cursor-pointer"
                            >
                                Tolak Pendaftaran
                            </button>
                            <button
                                type="button"
                                onClick={() => setApproveModalOpen(true)}
                                className="px-5 py-2 rounded-lg bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-extrabold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(250,255,105,0.2)] cursor-pointer"
                            >
                                ✓ Setujui Manual
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Approved Linked Member Banner */}
            {registration.status === 'approved' && registration.member && (
                <div className="mb-6 p-5 rounded-2xl bg-[#22c55e]/10 border border-[#22c55e]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#22c55e] text-[#0a0a0a] flex items-center justify-center font-black">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-[#22c55e] uppercase tracking-wider font-mono">
                                MEMBER AKTIF BERHASIL DITERBITKAN
                            </div>
                            <div className="text-sm font-extrabold text-white">
                                {registration.member.full_name} ({registration.member.member_number})
                            </div>
                        </div>
                    </div>
                    <Link
                        href={route('admin.members.show', registration.member.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#161616] hover:bg-[#202020] text-xs font-bold text-white border border-[#2a2a2a] transition-all"
                    >
                        <span>Lihat Profil Member</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1 & 2: Applicant Dossier & Identity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Applicant Profile Card */}
                    <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6">
                        <h2 className="text-xs font-bold tracking-wider text-[#888888] uppercase font-mono mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 text-[#faff69]" />
                            IDENTITAS CALON MEMBER
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222222]">
                                <span className="text-[#888888] uppercase block text-[10px] mb-1">NAMA LENGKAP:</span>
                                <span className="text-sm font-bold text-white">{registration.full_name}</span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222222]">
                                <span className="text-[#888888] uppercase block text-[10px] mb-1">EMAIL:</span>
                                <span className="text-sm font-mono text-white">{registration.email}</span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222222]">
                                <span className="text-[#888888] uppercase block text-[10px] mb-1">WHATSAPP / HP:</span>
                                <span className="text-sm font-mono text-[#faff69] font-bold">{registration.phone}</span>
                            </div>

                            <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222222]">
                                <span className="text-[#888888] uppercase block text-[10px] mb-1">JENIS KELAMIN / TGL LAHIR:</span>
                                <span className="text-sm text-white">
                                    {registration.gender ? (registration.gender === 'male' ? 'Laki-laki' : 'Perempuan') : '-'} 
                                    {registration.date_of_birth && ` (${registration.date_of_birth})`}
                                </span>
                            </div>

                            <div className="sm:col-span-2 p-3.5 rounded-xl bg-[#161616] border border-[#222222]">
                                <span className="text-[#888888] uppercase block text-[10px] mb-1">ALAMAT DOMISILI:</span>
                                <span className="text-sm text-white leading-relaxed">{registration.address || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* KTP Document Dossier Card */}
                    <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6">
                        <h2 className="text-xs font-bold tracking-wider text-[#888888] uppercase font-mono mb-4 flex items-center gap-2">
                            <FileCheck className="w-4 h-4 text-[#faff69]" />
                            DOKUMEN IDENTITAS KTP RESMI
                        </h2>

                        {registration.ktp_document_path ? (
                            <div className="p-4 rounded-xl bg-[#161616] border border-[#222222] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                        <span>{registration.ktp_original_filename || 'Dokumen KTP'}</span>
                                        <span className="px-2 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e] text-[10px] font-mono font-bold">
                                            TERUNGGAH
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-[#888888] mt-0.5">
                                        Diunggah pada: {registration.ktp_uploaded_at ? new Date(registration.ktp_uploaded_at).toLocaleString('id-ID') : '-'}
                                    </div>
                                </div>

                                <a
                                    href={route('admin.membership-registrations.ktp', registration.id)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-extrabold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(250,255,105,0.15)] cursor-pointer"
                                >
                                    <span>Buka Dokumen KTP</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        ) : (
                            <p className="text-xs text-[#666666] italic">Tidak ada dokumen KTP yang dilampirkan untuk permohonan ini.</p>
                        )}
                    </div>

                    {/* Emergency Contact Card */}
                    <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6">
                        <h2 className="text-xs font-bold tracking-wider text-[#888888] uppercase font-mono mb-4 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#faff69]" />
                            KONTAK DARURAT
                        </h2>

                        {registration.emergency_contact_name || registration.emergency_contact_phone ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222222]">
                                    <span className="text-[#888888] uppercase block text-[10px] mb-1">NAMA KONTAK:</span>
                                    <span className="text-sm font-bold text-white">{registration.emergency_contact_name || '-'}</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222222]">
                                    <span className="text-[#888888] uppercase block text-[10px] mb-1">NOMOR TELEPON:</span>
                                    <span className="text-sm font-mono text-white">{registration.emergency_contact_phone || '-'}</span>
                                </div>
                                <div className="p-3.5 rounded-xl bg-[#161616] border border-[#222222]">
                                    <span className="text-[#888888] uppercase block text-[10px] mb-1">HUBUNGAN:</span>
                                    <span className="text-sm text-white">{registration.emergency_contact_relationship || '-'}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-[#666666] italic">Tidak ada data kontak darurat yang dicantumkan.</p>
                        )}
                    </div>
                </div>

                {/* Column 3: Membership Plan, Payment Details & Audit History */}
                <div className="space-y-6">
                    {/* Selected Plan Card */}
                    <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6">
                        <h2 className="text-xs font-bold tracking-wider text-[#888888] uppercase font-mono mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#faff69]" />
                            PAKET MEMBERSHIP PILIHAN
                        </h2>

                        {registration.membership_plan ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-[#1a1a1a] border border-[#faff69]/30">
                                    <div className="text-xs font-mono font-bold text-[#faff69] uppercase">
                                        {registration.membership_plan.name}
                                    </div>
                                    <div className="text-2xl font-extrabold text-white font-mono mt-1">
                                        Rp {Number(registration.membership_plan.price).toLocaleString('id-ID')}
                                    </div>
                                    <div className="text-xs text-[#888888] mt-1">
                                        Durasi: {registration.membership_plan.duration} {registration.membership_plan.billing_period}
                                    </div>
                                </div>

                                <div className="space-y-2 text-xs">
                                    <div className="flex justify-between py-2 border-b border-[#222222]">
                                        <span className="text-[#888888]">Personal Trainer Quota:</span>
                                        <span className="font-bold text-white font-mono">
                                            {registration.membership_plan.trainer_quota} Sesi
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-[#222222]">
                                        <span className="text-[#888888]">Status Paket:</span>
                                        <span className="font-bold text-[#22c55e] uppercase">
                                            {registration.membership_plan.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-[#ef4444]">Data paket membership tidak ditemukan.</p>
                        )}
                    </div>

                    {/* Payment Information Card */}
                    <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 text-xs space-y-3">
                        <h2 className="text-xs font-bold tracking-wider text-[#888888] uppercase font-mono mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#faff69]" />
                            INFORMASI TRANSAKSI MIDTRANS
                        </h2>

                        {latestPayment ? (
                            <div className="space-y-2">
                                <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                                    <span className="text-[#888888]">Order ID:</span>
                                    <span className="font-mono text-white font-bold">{latestPayment.order_id}</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                                    <span className="text-[#888888]">Provider:</span>
                                    <span className="font-mono text-white uppercase">{latestPayment.provider}</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                                    <span className="text-[#888888]">Saluran Pembayaran:</span>
                                    <span className="font-mono text-[#faff69] uppercase font-bold">
                                        {latestPayment.payment_channel} ({latestPayment.payment_method})
                                    </span>
                                </div>
                                {latestPayment.provider_transaction_id && (
                                    <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                                        <span className="text-[#888888]">Midtrans TX ID:</span>
                                        <span className="font-mono text-white text-[10px] break-all">{latestPayment.provider_transaction_id}</span>
                                    </div>
                                )}
                                {latestPayment.va_number && (
                                    <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                                        <span className="text-[#888888]">VA Number:</span>
                                        <span className="font-mono text-[#faff69] font-bold">{latestPayment.va_number}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                                    <span className="text-[#888888]">Status Pembayaran:</span>
                                    <span className={`font-mono font-bold uppercase ${latestPayment.status === 'paid' ? 'text-[#22c55e]' : 'text-[#faff69]'}`}>
                                        {latestPayment.status}
                                    </span>
                                </div>
                                {latestPayment.paid_at && (
                                    <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                                        <span className="text-[#888888]">Waktu Lunas:</span>
                                        <span className="font-mono text-white">{new Date(latestPayment.paid_at).toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-[#888888] italic">Belum ada sesi pembayaran Midtrans yang dibuat.</p>
                        )}
                    </div>

                    {/* Metadata & Audit Timeline */}
                    <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 text-xs space-y-3">
                        <h2 className="text-xs font-bold tracking-wider text-[#888888] uppercase font-mono mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#faff69]" />
                            RIWAYAT PERMOHONAN
                        </h2>

                        <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                            <span className="text-[#888888]">Sumber:</span>
                            <span className="font-mono text-white uppercase">{registration.source}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                            <span className="text-[#888888]">Tanggal Diajukan:</span>
                            <span className="font-mono text-white">
                                {new Date(registration.created_at).toLocaleString('id-ID')}
                            </span>
                        </div>
                        {registration.reviewed_at && (
                            <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                                <span className="text-[#888888]">Direview Pada:</span>
                                <span className="font-mono text-white">
                                    {new Date(registration.reviewed_at).toLocaleString('id-ID')}
                                </span>
                            </div>
                        )}
                        {registration.reviewer && (
                            <div className="flex justify-between py-1.5 border-b border-[#1e1e1e]">
                                <span className="text-[#888888]">Direview Oleh:</span>
                                <span className="text-white font-semibold">{registration.reviewer.name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* MODAL 1: Approve Registration */}
            <Modal isOpen={approveModalOpen} onClose={() => setApproveModalOpen(false)} maxWidth="md">
                <form onSubmit={handleApprove} className="p-6 text-left">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#faff69] text-[#0a0a0a] flex items-center justify-center font-black">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white uppercase">SETUJUI PENDAFTARAN MANUAL</h3>
                            <p className="text-xs text-[#888888]">Terbitkan data Member & Membership resmi</p>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#161616] border border-[#2a2a2a] text-xs text-[#cccccc] space-y-1 mb-5">
                        <div><strong>Calon Member:</strong> {registration.full_name}</div>
                        <div><strong>Paket:</strong> {registration.membership_plan?.name}</div>
                        <div><strong>Biaya:</strong> Rp {Number(registration.membership_plan?.price || 0).toLocaleString('id-ID')}</div>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div>
                            <label className="block text-[#cccccc] font-semibold mb-1">TANGGAL MULAI MEMBERSHIP</label>
                            <input
                                type="date"
                                required
                                value={approveForm.data.start_date}
                                onChange={(e) => approveForm.setData('start_date', e.target.value)}
                                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#faff69]"
                            />
                        </div>

                        <div>
                            <label className="block text-[#cccccc] font-semibold mb-1">STATUS PEMBAYARAN</label>
                            <select
                                value={approveForm.data.payment_status}
                                onChange={(e) => approveForm.setData('payment_status', e.target.value as any)}
                                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#faff69]"
                            >
                                <option value="paid">Lunas (Paid)</option>
                                <option value="pending">Menunggu Pembayaran (Pending)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[#cccccc] font-semibold mb-1">CATATAN PERSETUJUAN (OPSIONAL)</label>
                            <textarea
                                rows={2}
                                value={approveForm.data.notes}
                                onChange={(e) => approveForm.setData('notes', e.target.value)}
                                placeholder="Catatan internal kasir / admin..."
                                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#faff69]"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setApproveModalOpen(false)}
                            className="px-4 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] text-xs font-bold text-[#888888] hover:text-white"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={approveForm.processing}
                            className="px-5 py-2 rounded-lg bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-extrabold uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                            {approveForm.processing ? 'MEMPROSES...' : 'SETUJUI & BUAT MEMBER'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODAL 2: Reject Registration */}
            <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} maxWidth="md">
                <form onSubmit={handleReject} className="p-6 text-left">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#ef4444]/20 text-[#ef4444] flex items-center justify-center font-black">
                            <XCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white uppercase">TOLAK PENDAFTARAN</h3>
                            <p className="text-xs text-[#888888]">Tuliskan alasan penolakan permohonan ini</p>
                        </div>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div>
                            <label className="block text-[#cccccc] font-semibold mb-1">
                                ALASAN PENOLAKAN <span className="text-[#ef4444]">*</span>
                            </label>
                            <textarea
                                required
                                rows={3}
                                value={rejectForm.data.rejection_reason}
                                onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                placeholder="Contoh: Nomor telepon tidak dapat dihubungi, kuota cabang penuh, dll..."
                                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#ef4444]"
                            />
                            {rejectForm.errors.rejection_reason && (
                                <p className="mt-1 text-xs text-[#ef4444]">{rejectForm.errors.rejection_reason}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setRejectModalOpen(false)}
                            className="px-4 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] text-xs font-bold text-[#888888] hover:text-white"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={rejectForm.processing || !rejectForm.data.rejection_reason}
                            className="px-5 py-2 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                            {rejectForm.processing ? 'MEMPROSES...' : 'KONFIRMASI PENOLAKAN'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* MODAL 3: Cancel Registration */}
            <Modal isOpen={cancelModalOpen} onClose={() => setCancelModalOpen(false)} maxWidth="md">
                <form onSubmit={handleCancel} className="p-6 text-left">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#888888]/20 text-[#888888] flex items-center justify-center font-black">
                            <Ban className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white uppercase">BATALKAN PENDAFTARAN</h3>
                            <p className="text-xs text-[#888888]">Tandai permohonan ini sebagai dibatalkan</p>
                        </div>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div>
                            <label className="block text-[#cccccc] font-semibold mb-1">
                                ALASAN PEMBATALAN (OPSIONAL)
                            </label>
                            <textarea
                                rows={2}
                                value={cancelForm.data.reason}
                                onChange={(e) => cancelForm.setData('reason', e.target.value)}
                                placeholder="Alasan pembatalan..."
                                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#faff69]"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setCancelModalOpen(false)}
                            className="px-4 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] text-xs font-bold text-[#888888] hover:text-white"
                        >
                            Kembali
                        </button>
                        <button
                            type="submit"
                            disabled={cancelForm.processing}
                            className="px-5 py-2 rounded-lg bg-[#888888] hover:bg-[#777777] text-black text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                            {cancelForm.processing ? 'MEMPROSES...' : 'BATALKAN PERMOHONAN'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
