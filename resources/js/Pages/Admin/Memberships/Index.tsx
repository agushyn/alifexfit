import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    FileText,
    Plus,
    Search,
    Eye,
    Edit2,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    Sparkles,
    Calendar,
    CreditCard
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Membership, PaginatedData } from '@/types';

interface MembershipsIndexProps {
    memberships: PaginatedData<Membership>;
    stats: {
        total: number;
        active: number;
        pending: number;
        expired: number;
    };
    plans: { id: number; name: string }[];
    filters: {
        search?: string;
        status?: string;
        payment_status?: string;
        plan_id?: string;
    };
}

export default function MembershipsIndex({
    memberships,
    stats,
    plans,
    filters,
}: MembershipsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [paymentFilter, setPaymentFilter] = useState(filters.payment_status || '');
    const [planFilter, setPlanFilter] = useState(filters.plan_id || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.memberships.index'),
            {
                search,
                status: statusFilter,
                payment_status: paymentFilter,
                plan_id: planFilter,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatusFilter('');
        setPaymentFilter('');
        setPlanFilter('');
        router.get(route('admin.memberships.index'));
    };

    const formatPrice = (val: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(val));
    };

    const getStatusBadge = (status: Membership['status']) => {
        switch (status) {
            case 'active':
                return (
                    <Badge variant="active" size="sm">
                        <CheckCircle2 className="w-3 h-3" />
                        ACTIVE
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="yellow" size="sm">
                        <Clock className="w-3 h-3" />
                        PENDING
                    </Badge>
                );
            case 'suspended':
                return (
                    <Badge variant="inactive" size="sm">
                        <AlertTriangle className="w-3 h-3" />
                        SUSPENDED
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="rose" size="sm">
                        <XCircle className="w-3 h-3" />
                        CANCELLED
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

    const getPaymentBadge = (status: Membership['payment_status']) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded border border-[#22c55e]/20">
                        PAID
                    </span>
                );
            case 'pending':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#faff69] bg-[#242424] px-2 py-0.5 rounded border border-[#3a3a3a]">
                        PAYMENT PENDING
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#ef4444] bg-[#ef4444]/10 px-2 py-0.5 rounded border border-[#ef4444]/20 uppercase">
                        {status}
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Subscriptions' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <FileText className="w-6 h-6 text-[#faff69]" />
                            Member Subscriptions & Memberships
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Tenant-scoped active passes, subscription dates, snapshotted fees, and trainer quotas.
                        </p>
                    </div>

                    <Link href={route('admin.memberships.create')}>
                        <Button variant="primary" size="md">
                            <Plus className="w-4 h-4" />
                            New Subscription
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Subscriptions — EXFITS Gym" />

            <div className="space-y-6">
                {/* 4 Status KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card variant="default" className="p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Active Subscriptions</div>
                        <div className="text-3xl font-extrabold font-mono text-[#22c55e] mt-1.5">{stats.active}</div>
                        <div className="text-[11px] text-[#888888] mt-1">Valid gym passes</div>
                    </Card>

                    <Card variant="default" className="p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Pending Activation</div>
                        <div className="text-3xl font-extrabold font-mono text-[#faff69] mt-1.5">{stats.pending}</div>
                        <div className="text-[11px] text-[#888888] mt-1">Future start dates</div>
                    </Card>

                    <Card variant="default" className="p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Expired</div>
                        <div className="text-3xl font-extrabold font-mono text-[#ef4444] mt-1.5">{stats.expired}</div>
                        <div className="text-[11px] text-[#888888] mt-1">Renewal required</div>
                    </Card>

                    <Card variant="default" className="p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Total History</div>
                        <div className="text-3xl font-extrabold font-mono text-white mt-1.5">{stats.total}</div>
                        <div className="text-[11px] text-[#888888] mt-1">All recorded periods</div>
                    </Card>
                </div>

                {/* Filter and Search */}
                <Card variant="default" className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-center gap-3">
                        <div className="flex-1 w-full">
                            <TextInput
                                placeholder="Search by member # (MEM-000001) or member name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={<Search className="w-4 h-4" />}
                            />
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-10 px-3 bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="expired">Expired</option>
                                <option value="suspended">Suspended</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <select
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="h-10 px-3 bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            >
                                <option value="">All Payments</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>

                            <select
                                value={planFilter}
                                onChange={(e) => setPlanFilter(e.target.value)}
                                className="h-10 px-3 bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            >
                                <option value="">All Plans</option>
                                {plans.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>

                            <Button type="submit" variant="secondary" size="md">
                                Filter
                            </Button>

                            {(search || statusFilter || paymentFilter || planFilter) && (
                                <Button type="button" variant="ghost" size="md" onClick={handleReset}>
                                    Reset
                                </Button>
                            )}
                        </div>
                    </form>
                </Card>

                {/* Subscriptions Table */}
                <Card variant="default" className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#121212] border-b border-[#2a2a2a] text-[#888888] uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">Member</th>
                                    <th className="px-6 py-3.5">Plan</th>
                                    <th className="px-6 py-3.5">Subscription Period</th>
                                    <th className="px-6 py-3.5">Snapshotted Price</th>
                                    <th className="px-6 py-3.5">Trainer Quota</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a2a2a]/60">
                                {memberships.data.length > 0 ? (
                                    memberships.data.map((m) => (
                                        <tr key={m.id} className="hover:bg-[#1a1a1a] transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <Link
                                                        href={route('admin.members.show', m.member_id)}
                                                        className="font-bold text-white text-sm hover:text-[#faff69] transition-colors"
                                                    >
                                                        {m.member?.full_name}
                                                    </Link>
                                                    <div className="text-[11px] font-mono text-[#faff69] mt-0.5">
                                                        {m.member?.member_number}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-white">
                                                    {m.membership_plan?.name}
                                                </div>
                                                <div className="text-[10px] text-[#888888] capitalize">
                                                    {m.membership_plan?.duration} {m.membership_plan?.billing_period}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 text-xs text-[#cccccc] font-mono">
                                                    <Calendar className="w-3 h-3 text-[#888888]" />
                                                    <span>{new Date(m.start_date).toLocaleDateString()}</span>
                                                    <span className="text-[#5a5a5a]">→</span>
                                                    <span className="font-bold text-white">{new Date(m.end_date).toLocaleDateString()}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 font-mono">
                                                <div className="font-bold text-white">
                                                    {formatPrice(m.price)}
                                                </div>
                                                <div className="mt-0.5">{getPaymentBadge(m.payment_status)}</div>
                                            </td>

                                            <td className="px-6 py-4">
                                                {m.trainer_quota_total > 0 ? (
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#22c55e]">
                                                        <Sparkles className="w-3.5 h-3.5" />
                                                        <span>{m.trainer_quota_total - m.trainer_quota_used} / {m.trainer_quota_total} left</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[#5a5a5a] text-[11px]">—</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                {getStatusBadge(m.status)}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('admin.memberships.show', m.id)}>
                                                        <Button variant="secondary" size="sm" title="View details">
                                                            <Eye className="w-3 h-3" />
                                                        </Button>
                                                    </Link>
                                                    <Link href={route('admin.memberships.edit', m.id)}>
                                                        <Button variant="secondary" size="sm" title="Edit membership">
                                                            <Edit2 className="w-3 h-3" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-[#888888]">
                                            No subscriptions found matching the filter criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {memberships.last_page > 1 && (
                        <div className="p-4 border-t border-[#2a2a2a] flex items-center justify-between text-xs text-[#888888]">
                            <div>
                                Showing <strong>{memberships.from}</strong> to <strong>{memberships.to}</strong> of <strong>{memberships.total}</strong> subscriptions
                            </div>
                            <div className="flex items-center gap-1.5">
                                {memberships.links.map((link, idx) => (
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
        </AuthenticatedLayout>
    );
}