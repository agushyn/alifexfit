import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Sparkles,
    Plus,
    Search,
    Filter,
    Calendar,
    Clock,
    UserCheck,
    CheckCircle2,
    XCircle,
    UserX,
    Eye,
    Edit2,
    Trash2,
    Phone,
    Mail,
    Award,
    Activity,
    RotateCcw
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Modal } from '@/Components/Modal';
import { Trainer, PaginatedData } from '@/types';

interface TrainersIndexProps {
    trainers: PaginatedData<Trainer>;
    filters: {
        search?: string;
        status?: string;
        specialization?: string;
    };
    stats: {
        total: number;
        active: number;
        inactive: number;
        available_now: number;
        total_sessions: number;
    };
}

export default function TrainersIndex({ trainers, filters, stats }: TrainersIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [specialization, setSpecialization] = useState(filters.specialization || '');
    const [deletingTrainer, setDeletingTrainer] = useState<Trainer | null>(null);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            route('admin.trainers.index'),
            {
                search: search || undefined,
                status: status || undefined,
                specialization: specialization || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setSpecialization('');
        router.get(route('admin.trainers.index'));
    };

    const handleToggleStatus = (trainer: Trainer) => {
        router.post(route('admin.trainers.toggle-status', trainer.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (!deletingTrainer) return;
        router.delete(route('admin.trainers.destroy', deletingTrainer.id), {
            onFinish: () => setDeletingTrainer(null),
        });
    };

    const getStatusBadge = (trainerStatus: Trainer['status']) => {
        if (trainerStatus === 'active') {
            return (
                <Badge variant="active" size="sm">
                    <CheckCircle2 className="w-3 h-3" />
                    ACTIVE
                </Badge>
            );
        }
        return (
            <Badge variant="inactive" size="sm">
                <XCircle className="w-3 h-3" />
                INACTIVE
            </Badge>
        );
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Trainers' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <Sparkles className="w-6 h-6 text-[#faff69]" />
                            Trainer Management
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Manage gym coaches, weekly availability schedules, and client session allocations.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('admin.trainers.create')}>
                            <Button variant="primary" size="sm">
                                <Plus className="w-4 h-4" />
                                Add Trainer
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Trainers — EXFITS Gym" />

            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    <Card variant="default" className="p-4 bg-gradient-to-br from-[#1a1a1a] to-[#121212]">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Total Coaches</span>
                            <Sparkles className="w-4 h-4 text-[#888888]" />
                        </div>
                        <div className="text-2xl font-extrabold font-mono text-white mt-1">
                            {stats.total}
                        </div>
                        <div className="text-[10px] text-[#888888] mt-0.5">Registered staff</div>
                    </Card>

                    <Card variant="default" className="p-4 bg-gradient-to-br from-[#1a1a1a] to-[#121212]">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#22c55e] uppercase tracking-wider">Active</span>
                            <UserCheck className="w-4 h-4 text-[#22c55e]" />
                        </div>
                        <div className="text-2xl font-extrabold font-mono text-[#22c55e] mt-1">
                            {stats.active}
                        </div>
                        <div className="text-[10px] text-[#888888] mt-0.5">Eligible for workouts</div>
                    </Card>

                    <Card variant="default" className="p-4 bg-gradient-to-br from-[#1a1a1a] to-[#121212]">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#ef4444] uppercase tracking-wider">Inactive</span>
                            <UserX className="w-4 h-4 text-[#ef4444]" />
                        </div>
                        <div className="text-2xl font-extrabold font-mono text-[#ef4444] mt-1">
                            {stats.inactive}
                        </div>
                        <div className="text-[10px] text-[#888888] mt-0.5">On leave / paused</div>
                    </Card>

                    <Card variant="elevated" className="p-4 bg-gradient-to-br from-[#1a1a1a] to-[#161616] border-[#faff69]/30">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#faff69] uppercase tracking-wider flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#faff69] animate-ping" />
                                Available Now
                            </span>
                            <Clock className="w-4 h-4 text-[#faff69]" />
                        </div>
                        <div className="text-2xl font-extrabold font-mono text-[#faff69] mt-1">
                            {stats.available_now}
                        </div>
                        <div className="text-[10px] text-[#cccccc] mt-0.5">On shift right now</div>
                    </Card>

                    <Card variant="default" className="p-4 bg-gradient-to-br from-[#1a1a1a] to-[#121212] col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#3b82f6] uppercase tracking-wider">PT Sessions</span>
                            <Activity className="w-4 h-4 text-[#3b82f6]" />
                        </div>
                        <div className="text-2xl font-extrabold font-mono text-white mt-1">
                            {stats.total_sessions}
                        </div>
                        <div className="text-[10px] text-[#888888] mt-0.5">Assigned historical logs</div>
                    </Card>
                </div>

                {/* Search & Filter Bar */}
                <Card variant="default" className="p-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-1">
                                Search Trainer
                            </label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a5a]" />
                                <TextInput
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Name, email, phone..."
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-1">
                                Specialization
                            </label>
                            <div className="relative">
                                <Award className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a5a]" />
                                <TextInput
                                    value={specialization}
                                    onChange={(e) => setSpecialization(e.target.value)}
                                    placeholder="e.g. Strength, Pilates..."
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-1">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full h-10 px-3 bg-[#121212] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <Button type="submit" variant="primary" size="sm" className="flex-1">
                                <Filter className="w-3.5 h-3.5" />
                                Apply Filters
                            </Button>
                            {(search || status || specialization) && (
                                <Button type="button" variant="secondary" size="sm" onClick={handleReset}>
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </Button>
                            )}
                        </div>
                    </form>
                </Card>

                {/* Trainers Cards Grid */}
                {trainers.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trainers.data.map((trainer) => (
                            <Card
                                key={trainer.id}
                                variant="default"
                                className="p-5 flex flex-col justify-between hover:border-[#3a3a3a] transition-all relative overflow-hidden group"
                            >
                                {/* Top Banner / Status Indicator */}
                                <div>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            {trainer.profile_photo_url ? (
                                                <img
                                                    src={trainer.profile_photo_url}
                                                    alt={trainer.name}
                                                    className="w-14 h-14 rounded-xl object-cover border border-[#2a2a2a] shadow-md group-hover:border-[#faff69]/50 transition-colors"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-xl bg-[#242424] text-[#faff69] font-bold text-xl flex items-center justify-center border border-[#2a2a2a]">
                                                    {trainer.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}

                                            <div>
                                                <Link
                                                    href={route('admin.trainers.show', trainer.id)}
                                                    className="text-base font-extrabold text-white hover:text-[#faff69] transition-colors"
                                                >
                                                    {trainer.name}
                                                </Link>
                                                {trainer.role && (
                                                    <div className="text-[11px] font-mono text-[#faff69] mt-0.5">
                                                        {trainer.role}
                                                    </div>
                                                )}
                                                <div className="text-xs text-[#cccccc] flex items-center gap-1 mt-0.5">
                                                    <Award className="w-3 h-3 text-[#888888]" />
                                                    <span>{trainer.specialization || 'General Coach'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            {getStatusBadge(trainer.status)}
                                            {trainer.status === 'active' && (
                                                trainer.is_available_now ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                                                        ON SHIFT
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-[#888888]">
                                                        Off Schedule
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    {/* Contact & Bio Summary */}
                                    <div className="mt-4 pt-3 border-t border-[#2a2a2a] space-y-1.5 text-xs text-[#888888]">
                                        {trainer.email && (
                                            <div className="flex items-center gap-2 text-white truncate">
                                                <Mail className="w-3.5 h-3.5 text-[#5a5a5a] flex-shrink-0" />
                                                <span className="truncate">{trainer.email}</span>
                                            </div>
                                        )}
                                        {trainer.phone && (
                                            <div className="flex items-center gap-2 text-[#cccccc]">
                                                <Phone className="w-3.5 h-3.5 text-[#5a5a5a] flex-shrink-0" />
                                                <span>{trainer.phone}</span>
                                            </div>
                                        )}
                                        {trainer.bio && (
                                            <p className="text-[11px] text-[#888888] line-clamp-2 mt-2 pt-1 border-t border-[#1f1f1f]">
                                                {trainer.bio}
                                            </p>
                                        )}
                                    </div>

                                    {/* Stats Strip */}
                                    <div className="mt-4 grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#121212] border border-[#242424] text-xs">
                                        <div>
                                            <div className="text-[10px] font-bold text-[#888888] uppercase">Sessions</div>
                                            <div className="text-sm font-extrabold font-mono text-white mt-0.5">
                                                {trainer.training_sessions_count ?? 0}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold text-[#888888] uppercase">Schedule Slots</div>
                                            <div className="text-sm font-extrabold font-mono text-[#faff69] mt-0.5">
                                                {trainer.schedules?.length ?? 0} slots
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Footer */}
                                <div className="mt-4 pt-3 border-t border-[#2a2a2a] flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5">
                                        <Link href={route('admin.trainers.show', trainer.id)}>
                                            <Button variant="secondary" size="sm" title="View Detail">
                                                <Eye className="w-3.5 h-3.5" />
                                                Details
                                            </Button>
                                        </Link>
                                        <Link href={route('admin.trainers.schedules.index', trainer.id)}>
                                            <Button variant="secondary" size="sm" title="Manage Weekly Schedule">
                                                <Calendar className="w-3.5 h-3.5 text-[#faff69]" />
                                                Schedule
                                            </Button>
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Link href={route('admin.trainers.edit', trainer.id)}>
                                            <button
                                                type="button"
                                                className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] text-[#cccccc] hover:text-white border border-[#2a2a2a] transition-colors"
                                                title="Edit Trainer"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleStatus(trainer)}
                                            className={`p-2 rounded-lg border transition-colors ${
                                                trainer.status === 'active'
                                                    ? 'bg-[#1a1a1a] hover:bg-[#ef4444]/15 text-[#888888] hover:text-[#ef4444] border-[#2a2a2a]'
                                                    : 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30 hover:bg-[#22c55e]/25'
                                            }`}
                                            title={trainer.status === 'active' ? 'Deactivate Trainer' : 'Activate Trainer'}
                                        >
                                            {trainer.status === 'active' ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeletingTrainer(trainer)}
                                            className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#ef4444]/15 text-[#888888] hover:text-[#ef4444] border border-[#2a2a2a] transition-colors"
                                            title="Delete Trainer"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card variant="default" className="p-12 text-center">
                        <Sparkles className="w-12 h-12 text-[#5a5a5a] mx-auto mb-3" />
                        <h3 className="text-base font-bold text-white">No trainers found</h3>
                        <p className="text-xs text-[#888888] mt-1 max-w-sm mx-auto">
                            No coaches match your search criteria or none have been added for this gym branch yet.
                        </p>
                        <div className="mt-4">
                            <Link href={route('admin.trainers.create')}>
                                <Button variant="primary" size="sm">
                                    <Plus className="w-4 h-4" />
                                    Add First Trainer
                                </Button>
                            </Link>
                        </div>
                    </Card>
                )}

                {/* Pagination */}
                {trainers.last_page > 1 && (
                    <div className="p-4 rounded-xl bg-[#141414] border border-[#2a2a2a] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#888888]">
                        <div>
                            Showing <strong>{trainers.from}</strong> to <strong>{trainers.to}</strong> of <strong>{trainers.total}</strong> coaches
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {trainers.links.map((link, idx) => (
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
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deletingTrainer}
                onClose={() => setDeletingTrainer(null)}
                title="Delete Trainer"
                description="Are you sure you want to remove this trainer? Historical completed workout sessions will be preserved for audit integrity."
            >
                <div className="space-y-4">
                    <p className="text-xs text-[#cccccc]">
                        Trainer: <strong className="text-white">{deletingTrainer?.name}</strong> ({deletingTrainer?.specialization || 'No Specialization'})
                    </p>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
                        <Button variant="secondary" size="sm" onClick={() => setDeletingTrainer(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" size="sm" onClick={handleDelete}>
                            Confirm Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
