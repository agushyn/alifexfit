import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    Dumbbell,
    Tag
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Modal } from '@/Components/Modal';
import { WorkoutType, PaginatedData } from '@/types';

interface WorkoutTypesIndexProps {
    workoutTypes: PaginatedData<WorkoutType>;
    categories: string[];
    filters: {
        search?: string;
        status?: string;
        category?: string;
    };
}

export default function WorkoutTypesIndex({
    workoutTypes,
    categories,
    filters,
}: WorkoutTypesIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    const [deletingType, setDeletingType] = useState<WorkoutType | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.workout-types.index'),
            { search, status: statusFilter, category: categoryFilter },
            { preserveState: true }
        );
    };

    const confirmDelete = () => {
        if (!deletingType) return;
        router.delete(route('admin.workout-types.destroy', deletingType.id), {
            onFinish: () => setDeletingType(null),
        });
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Workout Types' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <Activity className="w-6 h-6 text-[#faff69]" />
                            Workout Types & Categories
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Gym-configurable exercise disciplines and training categories (Strength, Cardio, HIIT, Mobility).
                        </p>
                    </div>

                    <Link href={route('admin.workout-types.create')}>
                        <Button variant="primary" size="md">
                            <Plus className="w-4 h-4" />
                            Add Workout Type
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Workout Types — EXFITS Gym" />

            <div className="space-y-6">
                {/* Search and Filters */}
                <Card variant="default" className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex-1 w-full">
                            <TextInput
                                placeholder="Search workout type name (e.g. Strength, HIIT, Functional)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={<Search className="w-4 h-4" />}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select
                                value={categoryFilter}
                                onChange={(e) => {
                                    setCategoryFilter(e.target.value);
                                    router.get(
                                        route('admin.workout-types.index'),
                                        { search, status: statusFilter, category: e.target.value },
                                        { preserveState: true }
                                    );
                                }}
                                className="h-10 px-3 bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat, i) => (
                                    <option key={i} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    router.get(
                                        route('admin.workout-types.index'),
                                        { search, status: e.target.value, category: categoryFilter },
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

                {/* Workout Types Table */}
                <Card variant="default" className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#121212] border-b border-[#2a2a2a] text-[#888888] uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">Workout Discipline</th>
                                    <th className="px-6 py-3.5">Category</th>
                                    <th className="px-6 py-3.5">Description</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a2a2a]/60">
                                {workoutTypes.data.length > 0 ? (
                                    workoutTypes.data.map((type) => (
                                        <tr key={type.id} className="hover:bg-[#1a1a1a] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="p-2 rounded-lg bg-[#242424] text-[#faff69] border border-[#3a3a3a]">
                                                        <Dumbbell className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{type.name}</div>
                                                        <div className="text-[10px] font-mono text-[#888888]">{type.slug}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                {type.category ? (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#cccccc] bg-[#121212] px-2.5 py-1 rounded border border-[#2a2a2a]">
                                                        <Tag className="w-3 h-3 text-[#faff69]" />
                                                        {type.category}
                                                    </span>
                                                ) : (
                                                    <span className="text-[#5a5a5a] text-[11px]">General</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-[#888888] max-w-xs truncate">
                                                {type.description || '—'}
                                            </td>

                                            <td className="px-6 py-4">
                                                {type.status === 'active' ? (
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
                                                    <Link href={route('admin.workout-types.edit', type.id)}>
                                                        <Button variant="secondary" size="sm" title="Edit workout type">
                                                            <Edit2 className="w-3 h-3" />
                                                        </Button>
                                                    </Link>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-[#ef4444] hover:bg-[#ef4444]/15"
                                                        onClick={() => setDeletingType(type)}
                                                        title="Delete workout type"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-[#888888]">
                                            No workout types configured. Create your first workout type above.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Modal */}
            <Modal
                isOpen={deletingType !== null}
                onClose={() => setDeletingType(null)}
                title="Delete Workout Type"
                description="Safely removes this workout type from tenant directory."
            >
                <div className="space-y-4">
                    <p className="text-xs text-[#cccccc] leading-relaxed">
                        Are you sure you want to delete <strong className="text-white">{deletingType?.name}</strong>?
                    </p>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
                        <Button variant="secondary" size="sm" onClick={() => setDeletingType(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" size="sm" onClick={confirmDelete}>
                            Delete Workout Type
                        </Button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}