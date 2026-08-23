import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Users,
    UserPlus,
    Search,
    Eye,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    Phone,
    Mail,
    Calendar,
    Building2,
    Zap
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Modal } from '@/Components/Modal';
import { Member, PaginatedData, PageProps } from '@/types';

interface MembersIndexProps {
    members: PaginatedData<Member>;
    stats: {
        total: number;
        active: number;
        inactive: number;
        suspended: number;
        expired: number;
    };
    filters: {
        search?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function MembersIndex({ members, stats, filters }: MembersIndexProps) {
    const { auth, gym } = usePage<PageProps>().props;
    const isSuperAdmin = auth.user?.is_super_admin ?? false;
    const currentGym = gym.current;

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [deletingMember, setDeletingMember] = useState<Member | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.members.index'),
            { search, status: statusFilter, date_from: dateFrom, date_to: dateTo },
            { preserveState: true }
        );
    };

    const handleStatusFilterChange = (status: string) => {
        setStatusFilter(status);
        router.get(
            route('admin.members.index'),
            { search, status, date_from: dateFrom, date_to: dateTo },
            { preserveState: true }
        );
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatusFilter('');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.members.index'));
    };

    const confirmDelete = () => {
        if (!deletingMember) return;
        router.delete(route('admin.members.destroy', deletingMember.id), {
            onFinish: () => setDeletingMember(null),
        });
    };

    const getStatusBadge = (status: Member['status']) => {
        switch (status) {
            case 'active':
                return (
                    <Badge variant="active" size="sm">
                        <CheckCircle2 className="w-3 h-3" />
                        ACTIVE
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge variant="inactive" size="sm">
                        <XCircle className="w-3 h-3" />
                        INACTIVE
                    </Badge>
                );
            case 'suspended':
                return (
                    <Badge variant="yellow" size="sm">
                        <AlertTriangle className="w-3 h-3" />
                        SUSPENDED
                    </Badge>
                );
            case 'expired':
                return (
                    <Badge variant="rose" size="sm">
                        <Clock className="w-3 h-3" />
                        EXPIRED
                    </Badge>
                );
            default:
                return <Badge variant="pill" size="sm">{status}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Member Directory' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <Users className="w-6 h-6 text-[#faff69]" />
                            Member Management
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Tenant-scoped member database and profile repository for <strong className="text-white">{currentGym ? currentGym.name : 'All Gyms'}</strong>.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={route('admin.membership-registrations.onsite.create')}>
                            <Button variant="primary" size="md">
                                <Zap className="w-4 h-4 text-[#0a0a0a]" />
                                Onsite Registration
                            </Button>
                        </Link>
                        <Link href={route('admin.members.create')}>
                            <Button variant="secondary" size="md">
                                <UserPlus className="w-4 h-4" />
                                Add Member Only
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Members — EXFITS Gym" />

            <div className="space-y-6">
                {/* 4 Status KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card variant="default" className="p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Active Members</div>
                        <div className="text-3xl font-extrabold font-mono text-[#22c55e] mt-1.5">{stats.active}</div>
                        <div className="text-[11px] text-[#888888] mt-1">Operational & Check-in ready</div>
                    </Card>

                    <Card variant="default" className="p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Inactive</div>
                        <div className="text-3xl font-extrabold font-mono text-[#888888] mt-1.5">{stats.inactive}</div>
                        <div className="text-[11px] text-[#888888] mt-1">Dormant profiles</div>
                    </Card>

                    <Card variant="default" className="p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Suspended</div>
                        <div className="text-3xl font-extrabold font-mono text-[#faff69] mt-1.5">{stats.suspended}</div>
                        <div className="text-[11px] text-[#888888] mt-1">Temporarily frozen</div>
                    </Card>

                    <Card variant="default" className="p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Expired Status</div>
                        <div className="text-3xl font-extrabold font-mono text-[#ef4444] mt-1.5">{stats.expired}</div>
                        <div className="text-[11px] text-[#888888] mt-1">Membership expired</div>
                    </Card>
                </div>

                {/* Filter and Search Bar */}
                <Card variant="default" className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-center gap-3">
                        <div className="flex-1 w-full">
                            <TextInput
                                placeholder="Search by member # (MEM-000001), name, email, phone..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={<Search className="w-4 h-4" />}
                            />
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusFilterChange(e.target.value)}
                                className="h-10 px-3 bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                                <option value="expired">Expired</option>
                            </select>

                            <Button type="submit" variant="secondary" size="md">
                                Filter
                            </Button>

                            {(search || statusFilter || dateFrom || dateTo) && (
                                <Button type="button" variant="ghost" size="md" onClick={handleResetFilters}>
                                    Reset
                                </Button>
                            )}
                        </div>
                    </form>
                </Card>

                {/* Members Data Table */}
                <Card variant="default" className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#121212] border-b border-[#2a2a2a] text-[#888888] uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">Member ID</th>
                                    <th className="px-6 py-3.5">Member Name</th>
                                    <th className="px-6 py-3.5">Contact Details</th>
                                    <th className="px-6 py-3.5">Tenant Branch</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5">Joined Date</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a2a2a]/60">
                                {members.data.length > 0 ? (
                                    members.data.map((m) => (
                                        <tr key={m.id} className="hover:bg-[#1a1a1a] transition-colors">
                                            <td className="px-6 py-4 font-mono">
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#242424] text-[#faff69] border border-[#3a3a3a] font-bold text-xs">
                                                    {m.member_number}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {m.profile_photo_url ? (
                                                        <img
                                                            src={m.profile_photo_url}
                                                            alt={m.full_name}
                                                            className="w-9 h-9 rounded-full object-cover border border-[#2a2a2a]"
                                                        />
                                                    ) : (
                                                        <div className="w-9 h-9 rounded-full bg-[#242424] border border-[#3a3a3a] text-white flex items-center justify-center font-bold text-xs">
                                                            {m.first_name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <Link
                                                            href={route('admin.members.show', m.id)}
                                                            className="font-bold text-white text-sm hover:text-[#faff69] transition-colors"
                                                        >
                                                            {m.full_name}
                                                        </Link>
                                                        <div className="text-[11px] text-[#888888] capitalize">
                                                            {m.gender ? `${m.gender}` : 'Not specified'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-[#cccccc]">
                                                {m.phone && (
                                                    <div className="flex items-center gap-1.5 text-[11px]">
                                                        <Phone className="w-3 h-3 text-[#888888]" />
                                                        {m.phone}
                                                    </div>
                                                )}
                                                {m.email && (
                                                    <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                                                        <Mail className="w-3 h-3 text-[#888888]" />
                                                        {m.email}
                                                    </div>
                                                )}
                                                {!m.phone && !m.email && <span className="text-[#5a5a5a]">—</span>}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Building2 className="w-3.5 h-3.5 text-[#888888]" />
                                                    <span className="font-medium text-white">{m.gym?.name ?? 'Branch'}</span>
                                                    <span className="text-[10px] font-mono text-[#888888]">({m.gym?.code})</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                {getStatusBadge(m.status)}
                                            </td>

                                            <td className="px-6 py-4 text-[#888888] font-mono text-[11px]">
                                                {new Date(m.created_at).toLocaleDateString()}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('admin.members.show', m.id)}>
                                                        <Button variant="secondary" size="sm" title="View details">
                                                            <Eye className="w-3 h-3" />
                                                        </Button>
                                                    </Link>

                                                    <Link href={route('admin.members.edit', m.id)}>
                                                        <Button variant="secondary" size="sm" title="Edit member">
                                                            <Edit2 className="w-3 h-3" />
                                                        </Button>
                                                    </Link>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-[#ef4444] hover:bg-[#ef4444]/15"
                                                        onClick={() => setDeletingMember(m)}
                                                        title="Deactivate member"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-[#888888]">
                                            No members found matching the specified query.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {members.last_page > 1 && (
                        <div className="p-4 border-t border-[#2a2a2a] flex items-center justify-between text-xs text-[#888888]">
                            <div>
                                Showing <strong>{members.from}</strong> to <strong>{members.to}</strong> of <strong>{members.total}</strong> members
                            </div>
                            <div className="flex items-center gap-1.5">
                                {members.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                                            link.active
                                                ? 'bg-[#faff69] text-[#0a0a0a]'
                                                : link.url
                                                ? 'bg-[#1a1a1a] text-white hover:bg-[#242424]'
                                                : 'text-[#5a5a5a] cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Deactivation Modal */}
            <Modal
                isOpen={deletingMember !== null}
                onClose={() => setDeletingMember(null)}
                title="Deactivate Member Profile"
                description="Preserve membership history while disabling operational access."
            >
                <div className="space-y-4">
                    <p className="text-xs text-[#cccccc] leading-relaxed">
                        Are you sure you want to deactivate <strong className="text-white">{deletingMember?.full_name}</strong> (<code className="text-[#faff69] font-mono">{deletingMember?.member_number}</code>)? This action uses safe soft-deletion to preserve historic records and logs.
                    </p>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
                        <Button variant="secondary" size="sm" onClick={() => setDeletingMember(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" size="sm" onClick={confirmDelete}>
                            Deactivate Member
                        </Button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}