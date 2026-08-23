import { FormEvent, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Lead, MembershipPlan, PaginatedData, User } from '@/types';
import { 
    Search, 
    Filter, 
    UserPlus, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Users, 
    Eye, 
    Phone, 
    Calendar, 
    RotateCcw,
    Zap,
    Flame,
    Sparkles,
    AlertTriangle,
    MessageSquare,
    UserCheck
} from 'lucide-react';

interface Props {
    leads: PaginatedData<Lead>;
    stats: {
        total: number;
        new: number;
        contacted: number;
        qualified: number;
        interested: number;
        converted: number;
        follow_up_due: number;
    };
    membershipPlans: MembershipPlan[];
    staffUsers: User[];
    filters: {
        search?: string;
        status?: string;
        source?: string;
        interest_type?: string;
        plan_id?: string;
        assigned_to?: string;
        follow_up_due?: boolean;
        date_from?: string;
        date_to?: string;
    };
}

export default function LeadsIndex({
    leads,
    stats,
    membershipPlans,
    staffUsers,
    filters,
}: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [source, setSource] = useState(filters.source || '');
    const [interestType, setInterestType] = useState(filters.interest_type || '');
    const [planId, setPlanId] = useState(filters.plan_id || '');
    const [assignedTo, setAssignedTo] = useState(filters.assigned_to || '');
    const [followUpDue, setFollowUpDue] = useState(filters.follow_up_due || false);
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.leads.index'),
            {
                search: search || undefined,
                status: status || undefined,
                source: source || undefined,
                interest_type: interestType || undefined,
                plan_id: planId || undefined,
                assigned_to: assignedTo || undefined,
                follow_up_due: followUpDue ? 1 : undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setSource('');
        setInterestType('');
        setPlanId('');
        setAssignedTo('');
        setFollowUpDue(false);
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.leads.index'));
    };

    const getStatusBadge = (leadStatus: string) => {
        switch (leadStatus) {
            case 'new':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono bg-[#3b82f6]/10 text-[#60a5fa] border border-[#3b82f6]/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#60a5fa] animate-pulse" />
                        NEW
                    </span>
                );
            case 'contacted':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono bg-[#faff69]/10 text-[#faff69] border border-[#faff69]/30">
                        <Phone className="w-3 h-3" />
                        CONTACTED
                    </span>
                );
            case 'qualified':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono bg-[#a855f7]/10 text-[#c084fc] border border-[#a855f7]/30">
                        <Sparkles className="w-3 h-3" />
                        QUALIFIED
                    </span>
                );
            case 'interested':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono bg-[#f97316]/10 text-[#fb923c] border border-[#f97316]/30">
                        <Flame className="w-3 h-3" />
                        INTERESTED
                    </span>
                );
            case 'converted':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30">
                        <CheckCircle2 className="w-3 h-3" />
                        CONVERTED
                    </span>
                );
            case 'not_interested':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono bg-[#888888]/10 text-[#888888] border border-[#888888]/30">
                        NOT INTERESTED
                    </span>
                );
            case 'lost':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold font-mono bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30">
                        <XCircle className="w-3 h-3" />
                        LOST
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout
            title="Lead Management"
            header={{
                title: 'Lead Management & CRM',
                subtitle: 'Kelola prospek calon member, jadwalkan follow-up, dan konversi ke permohonan pendaftaran.',
                badge: `${stats.new} New Leads`,
            }}
        >
            <Head title="Leads — Admin" />

            {/* Top Bar Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="text-xs text-[#888888]">
                    Pipeline prospek & follow-up calon member sebelum diterbitkan menjadi membership resmi.
                </div>

                <Link
                    href={route('admin.leads.create')}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(250,255,105,0.2)]"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>+ Tambah Prospek Manual</span>
                </Link>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                <div className="p-3.5 rounded-xl bg-[#121212] border border-[#242424]">
                    <div className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">TOTAL LEADS</div>
                    <div className="text-xl font-black text-white font-mono mt-1">{stats.total}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121212] border border-[#3b82f6]/30 shadow-[0_0_15px_rgba(59,130,246,0.05)]">
                    <div className="text-[10px] font-bold text-[#60a5fa] uppercase tracking-wider">NEW</div>
                    <div className="text-xl font-black text-[#60a5fa] font-mono mt-1">{stats.new}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121212] border border-[#faff69]/30">
                    <div className="text-[10px] font-bold text-[#faff69] uppercase tracking-wider">CONTACTED</div>
                    <div className="text-xl font-black text-[#faff69] font-mono mt-1">{stats.contacted}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121212] border border-[#a855f7]/30">
                    <div className="text-[10px] font-bold text-[#c084fc] uppercase tracking-wider">QUALIFIED</div>
                    <div className="text-xl font-black text-[#c084fc] font-mono mt-1">{stats.qualified}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121212] border border-[#f97316]/30">
                    <div className="text-[10px] font-bold text-[#fb923c] uppercase tracking-wider">INTERESTED</div>
                    <div className="text-xl font-black text-[#fb923c] font-mono mt-1">{stats.interested}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#121212] border border-[#22c55e]/30">
                    <div className="text-[10px] font-bold text-[#22c55e] uppercase tracking-wider">CONVERTED</div>
                    <div className="text-xl font-black text-[#22c55e] font-mono mt-1">{stats.converted}</div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-[#121212] border border-[#242424] rounded-xl p-4 mb-6">
                <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
                    {/* Search */}
                    <div className="lg:col-span-3 relative">
                        <Search className="w-4 h-4 text-[#666666] absolute left-3 top-3" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari no. lead, nama, HP, email..."
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#faff69]"
                        />
                    </div>

                    {/* Status */}
                    <div className="lg:col-span-2">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        >
                            <option value="">Semua Status</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="interested">Interested</option>
                            <option value="converted">Converted</option>
                            <option value="not_interested">Not Interested</option>
                            <option value="lost">Lost</option>
                        </select>
                    </div>

                    {/* Source */}
                    <div className="lg:col-span-2">
                        <select
                            value={source}
                            onChange={(e) => setSource(e.target.value)}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        >
                            <option value="">Semua Sumber</option>
                            <option value="website">Website</option>
                            <option value="whatsapp">WhatsApp</option>
                            <option value="walk_in">Walk-in Desk</option>
                            <option value="instagram">Instagram</option>
                            <option value="facebook">Facebook</option>
                            <option value="referral">Referral</option>
                            <option value="other">Lainnya</option>
                        </select>
                    </div>

                    {/* Assigned Staff */}
                    <div className="lg:col-span-2">
                        <select
                            value={assignedTo}
                            onChange={(e) => setAssignedTo(e.target.value)}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        >
                            <option value="">Semua Penugasan</option>
                            {staffUsers.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Interest Type */}
                    <div className="lg:col-span-3">
                        <select
                            value={interestType}
                            onChange={(e) => setInterestType(e.target.value)}
                            className="w-full bg-[#161616] border border-[#2a2a2a] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#faff69]"
                        >
                            <option value="">Semua Minat</option>
                            <option value="membership">Membership Gym</option>
                            <option value="trial">Free Trial</option>
                            <option value="personal_training">Personal Training</option>
                            <option value="workout">Program Workout</option>
                            <option value="general_inquiry">Pertanyaan Umum</option>
                        </select>
                    </div>

                    {/* Follow-up Due Checkbox & Dates */}
                    <div className="lg:col-span-6 flex items-center gap-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-[#cccccc]">
                            <input
                                type="checkbox"
                                checked={followUpDue}
                                onChange={(e) => setFollowUpDue(e.target.checked)}
                                className="w-4 h-4 rounded bg-[#161616] border-[#2a2a2a] text-[#faff69] focus:ring-0 cursor-pointer"
                            />
                            <span className="font-semibold text-white">Follow-up Jatuh Tempo (Hari Ini)</span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="lg:col-span-6 flex items-center justify-end gap-2">
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

            {/* Leads Table */}
            <div className="bg-[#121212] border border-[#242424] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-[#161616] border-b border-[#242424] text-[#888888] font-mono uppercase tracking-wider text-[10px]">
                                <th className="px-4 py-3">No. Prospek</th>
                                <th className="px-4 py-3">Calon Member</th>
                                <th className="px-4 py-3">Kontak</th>
                                <th className="px-4 py-3">Minat / Paket</th>
                                <th className="px-4 py-3">Sumber</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Penugasan</th>
                                <th className="px-4 py-3">Next Follow-up</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e1e1e]">
                            {leads.data.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-4 py-12 text-center text-[#666666]">
                                        <Users className="w-8 h-8 mx-auto mb-2 text-[#444444]" />
                                        <p className="font-semibold">Belum ada data prospek yang cocok.</p>
                                    </td>
                                </tr>
                            ) : (
                                leads.data.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-[#181818] transition-colors">
                                        <td className="px-4 py-3.5 font-mono font-bold text-[#faff69]">
                                            {lead.lead_number}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-bold text-white">{lead.name}</div>
                                            {lead.email && <div className="text-[11px] text-[#888888]">{lead.email}</div>}
                                        </td>
                                        <td className="px-4 py-3.5 font-mono text-[#cccccc]">
                                            <div>{lead.phone}</div>
                                            {lead.whatsapp && lead.whatsapp !== lead.phone && (
                                                <div className="text-[10px] text-[#22c55e]">WA: {lead.whatsapp}</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="font-semibold text-white capitalize">
                                                {lead.interest_type?.replace('_', ' ') || 'General'}
                                            </div>
                                            {lead.membership_plan && (
                                                <div className="text-[10px] text-[#faff69] font-mono">
                                                    {lead.membership_plan.name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className="inline-block px-2 py-0.5 rounded bg-[#1a1a1a] text-[10px] uppercase font-mono text-[#aaaaaa]">
                                                {lead.source}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            {getStatusBadge(lead.status)}
                                        </td>
                                        <td className="px-4 py-3.5 text-[#aaaaaa]">
                                            {lead.assigned_user ? (
                                                <span className="font-semibold text-white">{lead.assigned_user.name}</span>
                                            ) : (
                                                <span className="text-[#666666] italic">Belum ditugaskan</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 font-mono text-[11px]">
                                            {lead.next_follow_up_at ? (
                                                <span className={new Date(lead.next_follow_up_at) <= new Date() && !lead.is_terminal ? 'text-[#ef4444] font-bold' : 'text-[#888888]'}>
                                                    {new Date(lead.next_follow_up_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                    })}
                                                </span>
                                            ) : (
                                                <span className="text-[#555555]">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <Link
                                                href={route('admin.leads.show', lead.id)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#faff69] hover:text-[#0a0a0a] text-white text-xs font-bold border border-[#2a2a2a] transition-all cursor-pointer"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
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
                {leads.links && leads.links.length > 3 && (
                    <div className="px-4 py-3 bg-[#161616] border-t border-[#242424] flex items-center justify-between">
                        <div className="text-xs text-[#888888]">
                            Menampilkan {leads.from || 0} - {leads.to || 0} dari {leads.total} prospek
                        </div>
                        <div className="flex items-center gap-1">
                            {leads.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-2.5 py-1 rounded text-xs transition-colors ${
                                        link.active
                                            ? 'bg-[#faff69] text-[#0a0a0a] font-bold'
                                            : link.url
                                            ? 'bg-[#1a1a1a] text-[#888888] hover:text-white'
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
