import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { PaginatedData, WebsiteFaq } from '@/types';
import { Plus, Search, Edit, Trash2, HelpCircle } from 'lucide-react';

interface IndexProps {
    faqs: PaginatedData<WebsiteFaq>;
    categories: string[];
    filters: {
        search?: string;
        category?: string;
        status?: string;
    };
}

export default function Index({ faqs, categories, filters }: IndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [status, setStatus] = useState(filters.status || '');
    const [deleteModalFaq, setDeleteModalFaq] = useState<WebsiteFaq | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.website.faqs.index'), { search, category, status }, { preserveState: true });
    };

    const handleDelete = () => {
        if (!deleteModalFaq) return;
        router.delete(route('admin.website.faqs.destroy', deleteModalFaq.id), {
            onSuccess: () => setDeleteModalFaq(null),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Public Website FAQs</h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Manage questions & answers displayed on the public FAQ page and homepage accordion.
                        </p>
                    </div>
                    <Link
                        href={route('admin.website.faqs.create')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-bold transition-all shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        <span>ADD NEW FAQ</span>
                    </Link>
                </div>
            }
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Website CMS', href: route('admin.website.overview') },
                { label: 'FAQs' },
            ]}
        >
            <div className="space-y-6">
                {/* Filters */}
                <form onSubmit={handleSearch} className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search question or answer..."
                            className="w-full pl-9 pr-4 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white placeholder-[#888888] focus:outline-none focus:border-[#faff69]"
                        />
                    </div>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white px-3 py-2 focus:outline-none focus:border-[#faff69]"
                    >
                        <option value="">All Categories</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white px-3 py-2 focus:outline-none focus:border-[#faff69]"
                    >
                        <option value="">All Statuses</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
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
                                    <th className="px-6 py-3.5">Question / Category</th>
                                    <th className="px-6 py-3.5">Answer Preview</th>
                                    <th className="px-6 py-3.5">Order</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a2a2a]">
                                {faqs.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-[#888888]">
                                            No FAQs found.
                                        </td>
                                    </tr>
                                ) : (
                                    faqs.data.map((faq) => (
                                        <tr key={faq.id} className="hover:bg-[#202020] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white text-sm">{faq.question}</div>
                                                <div className="text-[10px] font-mono text-[#faff69] uppercase mt-0.5">{faq.category || 'general'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-[#cccccc] max-w-md truncate">
                                                {faq.answer}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-[#888888]">
                                                {faq.sort_order}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                                    faq.status === 'published'
                                                        ? 'bg-[#22c55e]/15 text-[#22c55e]'
                                                        : 'bg-[#f59e0b]/15 text-[#f59e0b]'
                                                }`}>
                                                    {faq.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('admin.website.faqs.edit', faq.id)}
                                                        className="p-1.5 rounded-lg bg-[#242424] text-[#888888] hover:text-white hover:bg-[#333333]"
                                                        title="Edit FAQ"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteModalFaq(faq)}
                                                        className="p-1.5 rounded-lg bg-[#242424] text-[#888888] hover:text-[#ef4444] hover:bg-[#333333]"
                                                        title="Delete FAQ"
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
            {deleteModalFaq && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] max-w-sm w-full p-6 space-y-4">
                        <h3 className="text-base font-bold text-white">Hapus FAQ?</h3>
                        <p className="text-xs text-[#cccccc]">
                            Apakah Anda yakin ingin menghapus pertanyaan ini?
                        </p>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteModalFaq(null)}
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
