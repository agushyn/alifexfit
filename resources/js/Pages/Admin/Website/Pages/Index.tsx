import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { PaginatedData, WebsitePage } from '@/types';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    ExternalLink, 
    FileText, 
    Calendar,
    ArrowLeft
} from 'lucide-react';

interface IndexProps {
    pages: PaginatedData<WebsitePage>;
    filters: {
        search?: string;
        status?: string;
    };
}

export default function Index({ pages, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [deleteModalPage, setDeleteModalPage] = useState<WebsitePage | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.website.pages.index'), { search, status }, { preserveState: true });
    };

    const handleDelete = () => {
        if (!deleteModalPage) return;
        router.delete(route('admin.website.pages.destroy', deleteModalPage.id), {
            onSuccess: () => setDeleteModalPage(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Custom Website Pages</h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Publish standalone pages such as Terms of Service, Privacy Policy, House Rules, or Event Announcements.
                        </p>
                    </div>
                    <Link
                        href={route('admin.website.pages.create')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-bold transition-all shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        <span>CREATE NEW PAGE</span>
                    </Link>
                </div>
            }
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Website CMS', href: route('admin.website.overview') },
                { label: 'Pages' },
            ]}
        >
            <div className="space-y-6">
                {/* Search & Filter Bar */}
                <form onSubmit={handleSearch} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search page title or slug..."
                            className="w-full pl-9 pr-4 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white placeholder-[#888888] focus:outline-none focus:border-[#faff69]"
                        />
                    </div>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white px-3 py-2 focus:outline-none focus:border-[#faff69]"
                    >
                        <option value="">All Statuses</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
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
                                    <th className="px-6 py-3.5">Title / URL</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5">Published Date</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a2a2a]">
                                {pages.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-[#888888]">
                                            No website pages found matching criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    pages.data.map((page) => (
                                        <tr key={page.id} className="hover:bg-[#202020] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white text-sm">{page.title}</div>
                                                <div className="text-[#888888] font-mono text-[11px] mt-0.5">/p/{page.slug}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    page.status === 'published'
                                                        ? 'bg-[#22c55e]/15 text-[#22c55e]'
                                                        : page.status === 'draft'
                                                        ? 'bg-[#f59e0b]/15 text-[#f59e0b]'
                                                        : 'bg-[#888888]/15 text-[#888888]'
                                                }`}>
                                                    {page.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-[#cccccc]">
                                                {page.published_at ? (
                                                    <span className="flex items-center gap-1.5 font-mono">
                                                        <Calendar className="w-3.5 h-3.5 text-[#888888]" />
                                                        {new Date(page.published_at).toLocaleDateString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-[#888888]">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {page.status === 'published' && (
                                                        <a
                                                            href={route('public.pages.show', page.slug)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1.5 rounded-lg bg-[#242424] text-[#888888] hover:text-[#faff69] hover:bg-[#333333]"
                                                            title="View Public Page"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    )}
                                                    <Link
                                                        href={route('admin.website.pages.edit', page.id)}
                                                        className="p-1.5 rounded-lg bg-[#242424] text-[#888888] hover:text-white hover:bg-[#333333]"
                                                        title="Edit Page"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteModalPage(page)}
                                                        className="p-1.5 rounded-lg bg-[#242424] text-[#888888] hover:text-[#ef4444] hover:bg-[#333333]"
                                                        title="Delete Page"
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
            {deleteModalPage && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] max-w-sm w-full p-6 space-y-4">
                        <h3 className="text-base font-bold text-white">Hapus Halaman?</h3>
                        <p className="text-xs text-[#cccccc]">
                            Apakah Anda yakin ingin menghapus halaman <strong>{deleteModalPage.title}</strong>? Halaman publik tidak akan dapat diakses lagi.
                        </p>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteModalPage(null)}
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
