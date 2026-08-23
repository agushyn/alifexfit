import { useForm, Link } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { WebsiteSection } from '@/types';
import { ArrowLeft, Save } from 'lucide-react';

interface EditProps {
    section: WebsiteSection;
    sectionKey: string;
}

export default function Edit({ section, sectionKey }: EditProps) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        title: section.title || '',
        subtitle: section.subtitle || '',
        content: section.content || '',
        button_text: section.button_text || '',
        button_url: section.button_url || '',
        status: section.status || 'active',
        sort_order: section.sort_order || 0,
        image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.website.sections.update', sectionKey));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('admin.website.sections.index')}
                        className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] text-[#888888] hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Edit Section: {sectionKey}</h1>
                        <p className="text-xs text-[#888888] mt-0.5">Customize homepage marketing copy and action triggers</p>
                    </div>
                </div>
            }
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Website CMS', href: route('admin.website.overview') },
                { label: 'Sections', href: route('admin.website.sections.index') },
                { label: sectionKey },
            ]}
        >
            <form onSubmit={handleSubmit} className="max-w-2xl bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8 space-y-6">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white uppercase">Section Title / Headline</label>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        placeholder="e.g. HIGH VOLTAGE FITNESS"
                        className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                    />
                    {errors.title && <div className="text-xs text-[#ef4444]">{errors.title}</div>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white uppercase">Subtitle / Supporting Copy</label>
                    <textarea
                        rows={3}
                        value={data.subtitle}
                        onChange={(e) => setData('subtitle', e.target.value)}
                        placeholder="e.g. State-of-the-art strength training and certified personal coaching..."
                        className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                    />
                    {errors.subtitle && <div className="text-xs text-[#ef4444]">{errors.subtitle}</div>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white uppercase">Button CTA Text</label>
                        <input
                            type="text"
                            value={data.button_text}
                            onChange={(e) => setData('button_text', e.target.value)}
                            placeholder="e.g. EXPLORE PACKAGES"
                            className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white uppercase">Button URL</label>
                        <input
                            type="text"
                            value={data.button_url}
                            onChange={(e) => setData('button_url', e.target.value)}
                            placeholder="e.g. /membership"
                            className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#faff69]"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white uppercase">Section Image (Optional)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setData('image', e.target.files?.[0] || null)}
                        className="w-full px-3.5 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-[#cccccc]"
                    />
                    {section.image_url && (
                        <div className="text-[11px] text-[#888888] mt-1">Current: <a href={section.image_url} target="_blank" rel="noreferrer" className="text-[#faff69] underline">Preview Image</a></div>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white uppercase">Status *</label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value as any)}
                            className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
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

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#2a2a2a]">
                    <Link
                        href={route('admin.website.sections.index')}
                        className="px-4 py-2 rounded-lg bg-[#242424] text-xs font-semibold text-[#cccccc]"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span>{processing ? 'Saving...' : 'Save Section'}</span>
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
