import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Building2,
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    ArrowRightLeft,
    Phone,
    Mail,
    MapPin,
    Users
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Modal } from '@/Components/Modal';
import { Gym, PaginatedData, PageProps } from '@/types';

interface GymsIndexProps {
    gyms: PaginatedData<Gym>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function GymsIndex({ gyms, filters }: GymsIndexProps) {
    const { auth, gym: currentGymProp } = usePage<PageProps>().props;
    const isSuperAdmin = auth.user?.is_super_admin ?? false;
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [deletingGym, setDeletingGym] = useState<Gym | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.gyms.index'), { search, status: statusFilter }, { preserveState: true });
    };

    const handleStatusChange = (status: string) => {
        setStatusFilter(status);
        router.get(route('admin.gyms.index'), { search, status }, { preserveState: true });
    };

    const handleSwitchContext = (g: Gym) => {
        router.post(route('admin.gyms.switch', g.id));
    };

    const confirmDelete = () => {
        if (!deletingGym) return;
        router.delete(route('admin.gyms.destroy', deletingGym.id), {
            onFinish: () => setDeletingGym(null),
        });
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Gyms & Branches' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <Building2 className="w-6 h-6 text-[#faff69]" />
                            Gyms & Branch Management
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Tenant branches configured under the single-database shared-table architecture.
                        </p>
                    </div>

                    {isSuperAdmin && (
                        <Link href={route('admin.gyms.create')}>
                            <Button variant="primary" size="md">
                                <Plus className="w-4 h-4" />
                                Add New Gym Branch
                            </Button>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Gyms — EXFITS Gym" />

            <div className="space-y-6">
                {/* Search and Filters */}
                <Card variant="default" className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex-1 w-full">
                            <TextInput
                                placeholder="Search gym by name, code, email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={<Search className="w-4 h-4" />}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select
                                value={statusFilter}
                                onChange={(e) => handleStatusChange(e.target.value)}
                                className="h-10 px-3 bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>

                            <Button type="submit" variant="secondary" size="md">
                                Filter
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Gyms Table */}
                <Card variant="default" className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#121212] border-b border-[#2a2a2a] text-[#888888] uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">Gym Branch</th>
                                    <th className="px-6 py-3.5">Code & Slug</th>
                                    <th className="px-6 py-3.5">Contact Info</th>
                                    <th className="px-6 py-3.5">Timezone</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a2a2a]/60">
                                {gyms.data.length > 0 ? (
                                    gyms.data.map((g) => {
                                        const isCurrent = g.id === currentGymProp.current?.id;
                                        return (
                                            <tr key={g.id} className={`hover:bg-[#1a1a1a] transition-colors ${isCurrent ? 'bg-[#1a1a1a]/80' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-[#242424] border border-[#3a3a3a] text-[#faff69] flex items-center justify-center font-bold">
                                                            <Building2 className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-sm flex items-center gap-2">
                                                                {g.name}
                                                                {isCurrent && (
                                                                    <Badge variant="yellow" size="sm">ACTIVE CONTEXT</Badge>
                                                                )}
                                                            </div>
                                                            {g.address && (
                                                                <div className="text-[11px] text-[#888888] flex items-center gap-1 mt-0.5 max-w-xs truncate">
                                                                    <MapPin className="w-3 h-3 text-[#5a5a5a]" />
                                                                    {g.address}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 font-mono">
                                                    <div className="font-semibold text-white">{g.code}</div>
                                                    <div className="text-[11px] text-[#888888]">{g.slug}</div>
                                                </td>

                                                <td className="px-6 py-4 text-[#cccccc]">
                                                    {g.phone && (
                                                        <div className="flex items-center gap-1.5 text-[11px]">
                                                            <Phone className="w-3 h-3 text-[#888888]" />
                                                            {g.phone}
                                                        </div>
                                                    )}
                                                    {g.email && (
                                                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                                                            <Mail className="w-3 h-3 text-[#888888]" />
                                                            {g.email}
                                                        </div>
                                                    )}
                                                    {!g.phone && !g.email && (
                                                        <span className="text-[#5a5a5a]">—</span>
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 font-mono text-white">
                                                    {g.timezone}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <Badge variant={g.status === 'active' ? 'active' : 'inactive'} size="sm">
                                                        {g.status === 'active' ? (
                                                            <CheckCircle2 className="w-3 h-3" />
                                                        ) : (
                                                            <XCircle className="w-3 h-3" />
                                                        )}
                                                        {g.status.toUpperCase()}
                                                    </Badge>
                                                </td>

                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {isSuperAdmin && (
                                                            <Button
                                                                variant={isCurrent ? 'primary' : 'outline'}
                                                                size="sm"
                                                                onClick={() => handleSwitchContext(g)}
                                                                title="Switch active tenant context"
                                                            >
                                                                <ArrowRightLeft className="w-3 h-3" />
                                                                {isCurrent ? 'Active' : 'Switch'}
                                                            </Button>
                                                        )}

                                                        <Link href={route('admin.gyms.edit', g.id)}>
                                                            <Button variant="secondary" size="sm">
                                                                <Edit2 className="w-3 h-3" />
                                                            </Button>
                                                        </Link>

                                                        {isSuperAdmin && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-[#ef4444] hover:bg-[#ef4444]/15"
                                                                onClick={() => setDeletingGym(g)}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-[#888888]">
                                            No gyms match the search filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={deletingGym !== null}
                onClose={() => setDeletingGym(null)}
                title="Confirm Gym Deletion"
                description="Are you sure you want to delete this gym branch?"
            >
                <div className="space-y-4">
                    <p className="text-xs text-[#cccccc] leading-relaxed">
                        Deleting <strong className="text-white">{deletingGym?.name}</strong> (<code className="text-[#faff69] font-mono">{deletingGym?.code}</code>) will remove its tenant association. This action is recorded in audit logs.
                    </p>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
                        <Button variant="secondary" size="sm" onClick={() => setDeletingGym(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" size="sm" onClick={confirmDelete}>
                            Delete Gym
                        </Button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}