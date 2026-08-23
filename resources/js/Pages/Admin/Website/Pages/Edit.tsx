import { useForm, Link, router } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { WebsitePage } from '@/types';
import { ArrowLeft, Save, Sparkles, ExternalLink, Trash2 } from 'lucide-react';

interface EditProps {
    page: WebsitePage;
}

export default function Edit({ page }: EditProps) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: page.title,
        slug: page.slug,
        excerpt: page.excerpt || '',
        content: page.content || '',
        status: page.status,
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        sort_order: page.sort_order || 0,
        og_image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.website.pages.update', page.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('admin.website.pages.index')}
                            className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] text-[#888888] hover:text-white"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Edit Page: {page.title}</h1>
                            <p className="text-xs text-[#888888] mt-0.5 font-mono">/p/{page.slug}</p>
                        </div>
                    </div>
                    {page.status === 'published' && (
                        <a
                            href={route('public.pages.show', page.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] text-xs font-bold text-white"
                        >
                            <ExternalLink className="w-3.5 h-3.5 text-[#faff69]" />
                            <span>VIEW PUBLIC PAGE</span>
                        </a>
                    )}
                </div>
            }
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Website CMS', href: route('admin.website.overview') },
                { label: 'Pages', href: route('admin.website.pages.index') },
                { label: page.title },
            ]}
        >
            <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
                {/* Main Content Box */}
                <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8 space-y-6">
                    <h2 className="text-base font-bold text-white uppercase tracking-wider">Page Content</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">Title *</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                                required
                            />
                            {errors.title && <div className="text-xs text-[#ef4444]">{errors.title}</div>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">URL Slug</label>
                            <input
                                type="text"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#faff69]"
                            />
                            {errors.slug && <div className="text-xs text-[#ef4444]">{errors.slug}</div>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white uppercase">Excerpt / Summary</label>
                        <textarea
                            rows={2}
                            value={data.excerpt}
                            onChange={(e) => setData('excerpt', e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white uppercase">Page Body Content</label>
                        <textarea
                            rows={12}
                            value={data.content}
                            onChange={(e) => setData('content', e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#faff69]"
                        />
                        {errors.content && <div className="text-xs text-[#ef4444]">{errors.content}</div>}
                    </div>
                </div>

                {/* Publishing & SEO Box */}
                <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8 space-y-6">
                    <h2 className="text-base font-bold text-white uppercase tracking-wider">Publishing & SEO Metadata</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">Status *</label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value as any)}
                                className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                            >
                                <option value="draft">Draft (Private)</option>
                                <option value="published">Published (Live to Public)</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">Sort Order</label>
                            <input
                                type="number"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">Meta Title (SEO)</label>
                            <input
                                type="text"
                                value={data.meta_title}
                                onChange={(e) => setData('meta_title', e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">OG Social Image (Optional Replacement)</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('og_image', e.target.files?.[0] || null)}
                                className="w-full px-3.5 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-[#cccccc]"
                            />
                            {page.og_image_url && (
                                <div className="text-[11px] text-[#888888] mt-1">Current: <a href={page.og_image_url} target="_blank" rel="noreferrer" className="text-[#faff69] underline">Preview Image</a></div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white uppercase">Meta Description (SEO)</label>
                        <textarea
                            rows={2}
                            value={data.meta_description}
                            onChange={(e) => setData('meta_description', e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <Link
                        href={route('admin.website.pages.index')}
                        className="px-5 py-2.5 rounded-lg bg-[#242424] hover:bg-[#333333] text-xs font-semibold text-[#cccccc]"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        <span>{processing ? 'Saving...' : 'Update Page'}</span>
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
