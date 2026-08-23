import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { PaginatedData, WebsiteFacility } from '@/types';
import { Plus, Search, Edit, Trash2, Building2 } from 'lucide-react';

interface IndexProps {
    facilities: PaginatedData<WebsiteFacility>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Index({ facilities, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [deleteModalFacility, setDeleteModalFacility] = useState<WebsiteFacility | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.website.facilities.index'), { search, status }, { preserveState: true });
    };

    const handleDelete = () => {
        if (!deleteModalFacility) return;
        router.delete(route('admin.website.facilities.destroy', deleteModalFacility.id), {
            onSuccess: () => setDeleteModalFacility(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Gym Facilities & Zones</h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Showcase workout zones, lifting platforms, cardio theater, recovery rooms, and amenities on the public website.
                        </p>
                    </div>
                    <Link
                        href={route('admin.website.facilities.create')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-bold transition-all shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        <span>ADD FACILITY ZONE</span>
                    </Link>
                </div>
            }
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Website CMS', href: route('admin.website.overview') },
                { label: 'Facilities' },
            ]}
        >
            <div className="space-y-6">
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search facility name..."
                            className="w-full pl-9 pr-4 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white placeholder-[#888888] focus:outline-none focus:border-[#faff69]"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white px-3 py-2 focus:outline-none focus:border-[#faff69]"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-[#242424] hover:bg-[#333333] border border-[#2a2a2a] text-xs font-semibold text-white transition-colors"
                    >
                        Filter
                    </button>
                </form>

                {/* Table */}
                <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#141414] text-[#888888] uppercase font-mono border-b border-[#2a2a2a]">
                                <tr>
                                    <th className="px-6 py-3.5">Zone Name / Image</th>
                                    <th className="px-6 py-3.5">Description</th>
                                    <th className="px-6 py-3.5">Sort Order</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a2a2a]">
                                {facilities.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-[#888888]">
                                            No facility zones found.
                                        </td>
                                    </tr>
                                ) : (
                                    facilities.data.map((fac) => (
                                        <tr key={fac.id} className="hover:bg-[#202020] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-lg bg-[#242424] border border-[#2a2a2a] overflow-hidden flex items-center justify-center flex-shrink-0">
                                                        {fac.image_url ? (
                                                            <img src={fac.image_url} alt={fac.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Building2 className="w-5 h-5 text-[#888888]" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{fac.name}</div>
                                                        <div className="text-[10px] font-mono text-[#888888]">ICON: {fac.icon || 'Dumbbell'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[#cccccc] max-w-sm truncate">
                                                {fac.description || '—'}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-[#888888]">
                                                {fac.sort_order}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    fac.status === 'active'
                                                        ? 'bg-[#22c55e]/15 text-[#22c55e]'
                                                        : 'bg-[#888888]/15 text-[#888888]'
                                                }`}>
                                                    {fac.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('admin.website.facilities.edit', fac.id)}
                                                        className="p-1.5 rounded-lg bg-[#242424] text-[#888888] hover:text-white hover:bg-[#333333]"
                                                        title="Edit Facility"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteModalFacility(fac)}
                                                        className="p-1.5 rounded-lg bg-[#242424] text-[#888888] hover:text-[#ef4444] hover:bg-[#333333]"
                                                        title="Delete Facility"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            {deleteModalFacility && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] max-w-sm w-full p-6 space-y-4">
                        <h3 className="text-base font-bold text-white">Hapus Fasilitas?</h3>
                        <p className="text-xs text-[#cccccc]">
                            Apakah Anda yakin ingin menghapus zona fasilitas <strong>{deleteModalFacility.name}</strong>?
                        </p>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteModalFacility(null)}
                                className="px-4 py-2 rounded-lg bg-[#242424] text-xs font-semibold text-[#cccccc]"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-2 rounded-lg bg-[#ef4444] hover:bg-[#dc2626] text-xs font-bold text-white"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
