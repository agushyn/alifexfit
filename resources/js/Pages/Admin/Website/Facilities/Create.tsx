import { useForm, Link } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Save } from 'lucide-react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        icon: 'Dumbbell',
        status: 'active',
        sort_order: 0,
        image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.website.facilities.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('admin.website.facilities.index')}
                        className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] text-[#888888] hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Add Facility Zone</h1>
                        <p className="text-xs text-[#888888] mt-0.5">Showcase a training zone or gym amenity</p>
                    </div>
                </div>
            }
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Website CMS', href: route('admin.website.overview') },
                { label: 'Facilities', href: route('admin.website.facilities.index') },
                { label: 'Create' },
            ]}
        >
            <form onSubmit={handleSubmit} className="max-w-2xl bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8 space-y-6">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white uppercase">Zone Name *</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. Olympic Lifting Platforms & Power Racks"
                        className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                        required
                    />
                    {errors.name && <div className="text-xs text-[#ef4444]">{errors.name}</div>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white uppercase">Description</label>
                    <textarea
                        rows={4}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Details about equipment, space capacity, and features..."
                        className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                    />
                    {errors.description && <div className="text-xs text-[#ef4444]">{errors.description}</div>}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-white uppercase">Facility Photo</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setData('image', e.target.files?.[0] || null)}
                        className="w-full px-3.5 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-[#cccccc]"
                    />
                    {errors.image && <div className="text-xs text-[#ef4444]">{errors.image}</div>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white uppercase">Icon Key</label>
                        <input
                            type="text"
                            value={data.icon}
                            onChange={(e) => setData('icon', e.target.value)}
                            placeholder="e.g. Dumbbell, Flame"
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
                        href={route('admin.website.facilities.index')}
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
                        <span>{processing ? 'Saving...' : 'Save Facility'}</span>
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
