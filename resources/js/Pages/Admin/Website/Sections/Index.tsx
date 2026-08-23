import { Link } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { WebsiteSection } from '@/types';
import { LayoutTemplate, Edit, CheckCircle2, ArrowRight } from 'lucide-react';

interface IndexProps {
    sections: WebsiteSection[];
    defaultSectionKeys: Record<string, string>;
}

export default function Index({ sections, defaultSectionKeys }: IndexProps) {
    const sectionsByKey = sections.reduce((acc, sec) => {
        acc[sec.section_key] = sec;
        return acc;
    }, {} as Record<string, WebsiteSection>);

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Homepage Section Content</h1>
                    <p className="text-xs text-[#888888] mt-1">
                        Customize hero banners, CTA copy, and marketing callouts displayed across the website.
                    </p>
                </div>
            }
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Website CMS', href: route('admin.website.overview') },
                { label: 'Homepage Sections' },
            ]}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                {Object.entries(defaultSectionKeys).map(([key, label]) => {
                    const section = sectionsByKey[key];
                    return (
                        <div
                            key={key}
                            className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-6 flex flex-col justify-between space-y-4 hover:border-[#3a3a3a] transition-all"
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="px-2.5 py-0.5 rounded bg-[#242424] text-[#faff69] text-[10px] font-mono font-bold uppercase">
                                        KEY: {key}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        section && section.status === 'active'
                                            ? 'bg-[#22c55e]/15 text-[#22c55e]'
                                            : 'bg-[#888888]/15 text-[#888888]'
                                    }`}>
                                        {section?.status || 'Default Active'}
                                    </span>
                                </div>

                                <h3 className="text-base font-bold text-white">{label}</h3>

                                <div className="bg-[#242424] rounded-xl p-3 text-xs text-[#cccccc] space-y-1">
                                    <div className="font-semibold text-white truncate">
                                        {section?.title || 'Using Global Branding Setting'}
                                    </div>
                                    <div className="text-[#888888] line-clamp-2 text-[11px]">
                                        {section?.subtitle || section?.content || 'Standard copy configured in website settings.'}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Link
                                    href={route('admin.website.sections.edit', key)}
                                    className="w-full py-2.5 rounded-lg bg-[#242424] hover:bg-[#faff69] hover:text-[#0a0a0a] border border-[#2a2a2a] text-xs font-bold text-white text-center flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
                                >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span>Customize Section</span>
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </div>
        </AuthenticatedLayout>
    );
}
