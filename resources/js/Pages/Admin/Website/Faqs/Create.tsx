import { useForm, Link } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Save } from 'lucide-react';

interface CreateProps {
    categories: string[];
}

export default function Create({ categories }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        question: '',
        answer: '',
        category: 'general',
        status: 'published',
        sort_order: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.website.faqs.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('admin.website.faqs.index')}
                        className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] text-[#888888] hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Add New FAQ</h1>
                        <p className="text-xs text-[#888888] mt-0.5">Create a public question & answer pair</p>
                    </div>
                </div>
            }
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Website CMS', href: route('admin.website.overview') },
                { label: 'FAQs', href: route('admin.website.faqs.index') },
                { label: 'Create' },
            ]}
        >
            <form onSubmit={handleSubmit} className="max-w-2xl bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8 space-y-6">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white uppercase">Question *</label>
                    <input
                        type="text"
                        value={data.question}
                        onChange={(e) => setData('question', e.target.value)}
                        placeholder="e.g. Do you offer daily guest passes?"
                        className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                        required
                    />
                    {errors.question && <div className="text-xs text-[#ef4444]">{errors.question}</div>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white uppercase">Answer *</label>
                    <textarea
                        rows={6}
                        value={data.answer}
                        onChange={(e) => setData('answer', e.target.value)}
                        placeholder="Enter the complete helpful response..."
                        className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                        required
                    />
                    {errors.answer && <div className="text-xs text-[#ef4444]">{errors.answer}</div>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white uppercase">Category</label>
                        <input
                            type="text"
                            value={data.category}
                            onChange={(e) => setData('category', e.target.value)}
                            placeholder="e.g. membership, personal_training"
                            className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#faff69]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white uppercase">Status *</label>
                        <select
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value as any)}
                            className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                        >
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
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
                        href={route('admin.website.faqs.index')}
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
                        <span>{processing ? 'Saving...' : 'Save FAQ'}</span>
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
