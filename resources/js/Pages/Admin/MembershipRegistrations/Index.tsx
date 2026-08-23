import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { MembershipPlan, MembershipRegistration, PaginatedData } from '@/types';
import { 
    Search, 
    Filter, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Ban, 
    Eye, 
    Sparkles, 
    Calendar,
    Users,
    ArrowUpDown,
    RotateCcw,
    UserPlus,
    CreditCard,
    Shield
} from 'lucide-react';

interface Props {
    registrations: PaginatedData<MembershipRegistration>;
    stats: {
        total: number;
        pending: number;
        approved: number;
        rejected: number;
        cancelled: number;
        paid?: number;
        payment_pending?: number;
        onsite?: number;
        website?: number;
    };
    membershipPlans: MembershipPlan[];
    filters: {
        search?: string;
        status?: string;
        payment_status?: string;
        source?: string;
        plan_id?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function MembershipRegistrationsIndex({
    registrations,
    stats,
    membershipPlans,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [paymentStatus, setPaymentStatus] = useState(filters.payment_status || '');
    const [source, setSource] = useState(filters.source || '');
    const [planId, setPlanId] = useState(filters.plan_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.membership-registrations.index'),
            {
                search: search || undefined,
                status: status || undefined,
                payment_status: paymentStatus || undefined,
                source: source || undefined,
                plan_id: planId || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setPaymentStatus('');
        setSource('');
        setPlanId('');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.membership-registrations.index'));
    };

    const getStatusBadge = (regStatus: string) => {
        switch (regStatus) {
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-[#faff69]/10 text-[#faff69] border border-[#faff69]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#faff69] animate-pulse" />
                        PENDING
                    </span>
                );
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        APPROVED
                    </span>
                );
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30">
                        <XCircle className="w-3.5 h-3.5" />
                        REJECTED
                    </span>
                );
            case 'cancelled':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold font-mono bg-[#888888]/10 text-[#888888] border border-[#888888]/30">
                        <Ban className="w-3.5 h-3.5" />
                        CANCELLED
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-[#222222] text-[#aaaaaa]">
                        {regStatus}
                    </span>
                );
        }
    };

    const getPaymentStatusBadge = (payStatus?: string) => {
        switch (payStatus) {
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                        <CheckCircle2 className="w-3 h-3" />
                        LUNAS
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#faff69]/10 text-[#faff69] border border-[#faff69]/30">
                        <Clock className="w-3 h-3 animate-pulse" />
                        MENUNGGU
                    </span>
                );
            case 'expired':
                return (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30">
                        EXPIRED
                    </span>
                );
            case 'failed':
            case 'cancelled':
                return (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30">
                        GAGAL
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1f1f1f] text-[#888888] border border-[#2a2a2a]">
                        UNPAID
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout
            title="Membership Registrations — Admin"
            header={{
                title: 'Membership Registrations',
                subtitle: 'Review incoming online applications, upload documents, and manage onsite front-desk registrations.',
                badge: `${stats.pending} Pending Action`,
            }}
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Membership Registrations' },
            ]}
        >
            <Head title="Membership Registrations — Admin" />

            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                <div className="bg-[#121212] border border-[#242424] rounded-xl p-3.5">
                    <div className="flex items-center justify-between text-[#888888] text-[10px] font-mono uppercase">
                        <span>Total Permohonan</span>
                        <Users className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xl font-extrabold text-white mt-1 font-mono">{stats.total}</div>
                </div>

                <div className="bg-[#121212] border border-[#faff69]/30 rounded-xl p-3.5 shadow-[0_0_15px_rgba(250,255,105,0.05)]">
                    <div className="flex items-center justify-between text-[#faff69] text-[10px] font-mono uppercase">
                        <span>Pending Review</span>
                        <Clock className="w-3.5 h-3.5 animate-pulse" />
                    </div>
                    <div className="text-xl font-extrabold text-[#faff69] mt-1 font-mono">{stats.pending}</div>
                </div>

                <div className="bg-[#121212] border border-[#22c55e]/30 rounded-xl p-3.5">
                    <div className="flex items-center justify-between text-[#22c55e] text-[10px] font-mono uppercase">
                        <span>Disetujui / Aktif</span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xl font-extrabold text-[#22c55e] mt-1 font-mono">{stats.approved}</div>
                </div>

                <div className="bg-[#121212] border border-[#22c55e]/20 rounded-xl p-3.5">
                    <div className="flex items-center justify-between text-[#22c55e] text-[10px] font-mono uppercase">
                        <span>Pembayaran Lunas</span>
                        <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div className="text-xl font-extrabold text-white mt-1 font-mono">{stats.paid ?? 0}</div>
                </div>

                <div className="bg-[#121212] border border-[#242424] rounded-xl p-3.5">
                    <div className="flex items-center justify-between text-[#888888] text-[10px] font-mono uppercase">
                        <span>Pendaftaran Onsite</span>
                        <Sparkles className="w-3.5 h-3.5 text-[#faff69]" />
                    </div>
                    <div className="text-xl font-extrabold text-white mt-1 font-mono">{stats.onsite ?? 0}</div>
                </div>

                <div className="bg-[#121212] border border-[#242424] rounded-xl p-3.5">
                    <div className="flex items-center justify-between text-[#888888] text-[10px] font-mono uppercase">
                        <span>Pendaftaran Website</span>
                        <Users className="w-3.5 h-3.5 text-[#aaaaaa]" />
                    </div>
                    <div className="text-xl font-extrabold text-white mt-1 font-mono">{stats.website ?? 0}</div>
                </div>
            </div>

            {/* Action Bar & Onsite Quick Trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="text-xs text-[#888888]">
                    Daftar permohonan calon member baru dari website dan front desk.
                </div>
                <Link
                    href={route('admin.membership-registrations.onsite.create')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(250,255,105,0.2)]"
                >
                    <UserPlus className="w-4 h-4 stroke-[2.5]" />
                    <span>+ DAFTARKAN MEMBER ONSITE</span>
                </Link>
            </div>

            {/* Filter Card */}
            <div className="bg-[#121212] border border-[#242424] rounded-xl p-4 mb-6">
                <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                    {/* Search Input */}
                    <div className="lg:col-span-3">
                        <div className="relative">
                            <Search className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, email, no. reg..."
                                className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                            />
                        </div>
                    </div>

                    {/* Source Filter */}
                    <div className="lg:col-span-2">
                        <select
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        >
                            <option value="">Semua Sumber</option>
                            <option value="website">Website (Online)</option>
                            <option value="admin">Onsite (Front Desk)</option>
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="lg:col-span-2">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        >
                            <option value="">Semua Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Payment Status Filter */}
                    <div className="lg:col-span-2">
                        <select
                            value={paymentStatus}
                            onChange={(e) => setPaymentStatus(e.target.value)}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        >
                            <option value="">Semua Pembayaran</option>
                            <option value="paid">Lunas (Paid)</option>
                            <option value="pending">Menunggu Bayar</option>
                            <option value="unpaid">Belum Bayar</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>

                    {/* Plan Filter */}
                    <div className="lg:col-span-3">
                        <select
                            value={planId}
                            onChange={(e) => setPlanId(e.target.value)}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        >
                            <option value="">Semua Paket Membership</option>
                            {membershipPlans.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name} (Rp {Number(p.price).toLocaleString('id-ID')})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="lg:col-span-12 flex items-center justify-end gap-2 pt-2 border-t border-[#1e1e1e]">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] text-xs font-semibold text-[#888888] hover:text-white transition-colors cursor-pointer"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            Filter Data
                        </button>
                    </div>
                </form>
            </div>

            {/* Registrations Data Table */}
            <div className="bg-[#121212] border border-[#242424] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-[#161616] border-b border-[#242424] text-[#888888] font-mono uppercase tracking-wider text-[10px]">
                                <th className="px-4 py-3">No. Registrasi</th>
                                <th className="px-4 py-3">Calon Member</th>
                                <th className="px-4 py-3">Kontak</th>
                                <th className="px-4 py-3">Paket Pilihan</th>
                                <th className="px-4 py-3">Sumber</th>
                                <th className="px-4 py-3">Pembayaran</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Tgl Diajukan</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e1e1e]">
                            {registrations.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-[#666666]">
                                        <Clock className="w-8 h-8 mx-auto mb-2 text-[#444444]" />
                                        <p className="font-semibold">Belum ada permohonan pendaftaran yang cocok.</p>
                                    </td>
                                </tr>
                            ) : (
                                registrations.data.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-[#181818] transition-colors">
                                        <td className="px-4 py-3.5 font-mono font-bold text-[#faff69]">
                                            {reg.registration_number}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-white flex items-center gap-1.5">
                                                <span>{reg.full_name}</span>
                                                {reg.ktp_document_path && (
                                                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 font-mono" title="KTP Terlampir">
                                                        KTP
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-[11px] text-[#888888]">{reg.email}</div>
                                        </td>
                                        <td className="px-4 py-3.5 font-mono text-[#cccccc]">
                                            {reg.phone}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-semibold text-white">{reg.membership_plan?.name || '-'}</div>
                                            <div className="text-[10px] text-[#888888] font-mono">
                                                Rp {Number(reg.membership_plan?.price || 0).toLocaleString('id-ID')}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {reg.source === 'admin' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#faff69]/10 text-[#faff69] border border-[#faff69]/30 text-[10px] uppercase font-mono font-bold">
                                                    ONSITE
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1a1a1a] text-[#aaaaaa] border border-[#2a2a2a] text-[10px] uppercase font-mono font-semibold">
                                                    WEBSITE
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {getPaymentStatusBadge(reg.payment_status)}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {getStatusBadge(reg.status)}
                                        </td>
                                        <td className="px-4 py-3.5 text-[#888888] font-mono text-[11px]">
                                            {new Date(reg.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                            })}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <Link
                                                href={route('admin.membership-registrations.show', reg.id)}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] text-xs font-semibold text-white border border-[#2a2a2a] transition-all"
                                            >
                                                <Eye className="w-3.5 h-3.5 text-[#faff69]" />
                                                <span>Detail</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {registrations.links && registrations.links.length > 3 && (
                    <div className="p-4 border-t border-[#242424] flex items-center justify-between">
                        <span className="text-xs text-[#888888]">
                            Menampilkan {registrations.from || 0} - {registrations.to || 0} dari {registrations.total} permohonan
                        </span>
                        <div className="flex items-center gap-1">
                            {registrations.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                                        link.active
                                            ? 'bg-[#faff69] text-[#0a0a0a] font-bold'
                                            : link.url
                                            ? 'bg-[#161616] text-[#cccccc] hover:bg-[#202020] border border-[#2a2a2a]'
                                            : 'text-[#555555] cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
