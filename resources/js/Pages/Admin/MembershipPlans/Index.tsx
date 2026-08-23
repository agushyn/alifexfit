import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    CreditCard,
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    Star,
    Sparkles,
    Calendar,
    Users
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Modal } from '@/Components/Modal';
import { MembershipPlan, PaginatedData } from '@/types';

interface PlansIndexProps {
    plans: PaginatedData<MembershipPlan>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function PlansIndex({ plans, filters }: PlansIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [deletingPlan, setDeletingPlan] = useState<MembershipPlan | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.membership-plans.index'),
            { search, status: statusFilter },
            { preserveState: true }
        );
    };

    const confirmDelete = () => {
        if (!deletingPlan) return;
        router.delete(route('admin.membership-plans.destroy', deletingPlan.id), {
            onFinish: () => setDeletingPlan(null),
        });
    };

    const formatPrice = (val: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(val));
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Membership Plans' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <CreditCard className="w-6 h-6 text-[#faff69]" />
                            Membership Plans & Packages
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Configure gym subscription packages, recurring durations, pricing, and trainer quotas.
                        </p>
                    </div>

                    <Link href={route('admin.membership-plans.create')}>
                        <Button variant="primary" size="md">
                            <Plus className="w-4 h-4" />
                            Create New Plan
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Membership Plans — EXFITS Gym" />

            <div className="space-y-6">
                {/* Search & Filter Bar */}
                <Card variant="default" className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex-1 w-full">
                            <TextInput
                                placeholder="Search plans by name (e.g. Monthly, Annual)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={<Search className="w-4 h-4" />}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    router.get(
                                        route('admin.membership-plans.index'),
                                        { search, status: e.target.value },
                                        { preserveState: true }
                                    );
                                }}
                                className="h-10 px-3 bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>

                            <Button type="submit" variant="secondary" size="md">
                                Filter
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Plans Table */}
                <Card variant="default" className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#121212] border-b border-[#2a2a2a] text-[#888888] uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">Plan Name</th>
                                    <th className="px-6 py-3.5">Billing & Duration</th>
                                    <th className="px-6 py-3.5">Authoritative Price</th>
                                    <th className="px-6 py-3.5">Trainer Quota</th>
                                    <th className="px-6 py-3.5">Subscribers</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a2a2a]/60">
                                {plans.data.length > 0 ? (
                                    plans.data.map((plan) => (
                                        <tr key={plan.id} className="hover:bg-[#1a1a1a] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div>
                                                        <div className="font-bold text-white text-sm flex items-center gap-2">
                                                            {plan.name}
                                                            {plan.featured && (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#faff69] bg-[#242424] px-2 py-0.5 rounded border border-[#3a3a3a]">
                                                                    <Star className="w-3 h-3 fill-[#faff69]" /> FEATURED
                                                                </span>
                                                            )}
                                                        </div>
                                                        {plan.description && (
                                                            <div className="text-[11px] text-[#888888] mt-0.5 line-clamp-1">
                                                                {plan.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#121212] border border-[#2a2a2a] text-[#cccccc] font-medium">
                                                    <Calendar className="w-3 h-3 text-[#888888]" />
                                                    <span className="capitalize">{plan.duration} {plan.billing_period}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 font-mono">
                                                <div className="text-sm font-extrabold text-[#faff69]">
                                                    {formatPrice(plan.price)}
                                                </div>
                                                {Number(plan.joining_fee) > 0 && (
                                                    <div className="text-[10px] text-[#888888]">
                                                        + {formatPrice(plan.joining_fee)} joining fee
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                {plan.trainer_quota > 0 ? (
                                                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded border border-[#22c55e]/20">
                                                        <Sparkles className="w-3 h-3" />
                                                        {plan.trainer_quota} Sessions
                                                    </div>
                                                ) : (
                                                    <span className="text-[#5a5a5a] text-[11px]">None included</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs text-[#cccccc]">
                                                    <Users className="w-3.5 h-3.5 text-[#888888]" />
                                                    <span className="font-bold">{plan.memberships_count ?? 0}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                {plan.status === 'active' ? (
                                                    <Badge variant="active" size="sm">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        ACTIVE
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="inactive" size="sm">
                                                        <XCircle className="w-3 h-3" />
                                                        INACTIVE
                                                    </Badge>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link href={route('admin.membership-plans.edit', plan.id)}>
                                                        <Button variant="secondary" size="sm" title="Edit plan">
                                                            <Edit2 className="w-3 h-3" />
                                                        </Button>
                                                    </Link>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-[#ef4444] hover:bg-[#ef4444]/15"
                                                        onClick={() => setDeletingPlan(plan)}
                                                        title="Delete plan"
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
                                            No membership plans found. Create your first plan above.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Deletion Modal */}
            <Modal
                isOpen={deletingPlan !== null}
                onClose={() => setDeletingPlan(null)}
                title="Delete Membership Plan"
                description="Safely removes plan from new subscriptions while preserving existing member histories."
            >
                <div className="space-y-4">
                    <p className="text-xs text-[#cccccc] leading-relaxed">
                        Are you sure you want to delete <strong className="text-white">{deletingPlan?.name}</strong>? Historical subscriptions and transaction records referencing this plan will remain intact.
                    </p>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
                        <Button variant="secondary" size="sm" onClick={() => setDeletingPlan(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" size="sm" onClick={confirmDelete}>
                            Delete Plan
                        </Button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}