import { Link } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { WebsiteFacility, WebsitePage } from '@/types';
import { 
    Globe, 
    FileText, 
    HelpCircle, 
    Building2, 
    Sliders, 
    ExternalLink, 
    Plus, 
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Clock,
    LayoutTemplate
} from 'lucide-react';

interface OverviewProps {
    stats: {
        total_pages: number;
        published_pages: number;
        draft_pages: number;
        total_faqs: number;
        published_faqs: number;
        total_facilities: number;
        active_facilities: number;
        total_sections: number;
    };
    websiteSettings: Record<string, any>;
    recentPages: WebsitePage[];
    facilities: WebsiteFacility[];
}

export default function Overview({
    stats,
    websiteSettings,
    recentPages,
    facilities,
}: OverviewProps) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Website CMS & Branding</h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Manage public website content, custom pages, FAQs, facilities showcase, and SEO settings.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href={route('public.home')}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] text-xs font-bold text-white transition-colors"
                        >
                            <ExternalLink className="w-3.5 h-3.5 text-[#faff69]" />
                            <span>VIEW PUBLIC WEBSITE</span>
                        </a>
                        <Link
                            href={route('admin.website.settings.edit')}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-bold transition-all shadow-md"
                        >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>WEBSITE SETTINGS</span>
                        </Link>
                    </div>
                </div>
            }
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Website CMS' },
            ]}
        >
            <div className="space-y-8">
                {/* Stats Strip */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
                        <div className="flex items-center justify-between text-[#888888] mb-2">
                            <span className="text-xs font-semibold uppercase">CMS Pages</span>
                            <FileText className="w-4 h-4 text-[#faff69]" />
                        </div>
                        <div className="text-2xl font-extrabold text-white font-mono">{stats.total_pages}</div>
                        <div className="text-[11px] text-[#888888] mt-1">
                            {stats.published_pages} published, {stats.draft_pages} drafts
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
                        <div className="flex items-center justify-between text-[#888888] mb-2">
                            <span className="text-xs font-semibold uppercase">Public FAQs</span>
                            <HelpCircle className="w-4 h-4 text-[#faff69]" />
                        </div>
                        <div className="text-2xl font-extrabold text-white font-mono">{stats.total_faqs}</div>
                        <div className="text-[11px] text-[#888888] mt-1">
                            {stats.published_faqs} published
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
                        <div className="flex items-center justify-between text-[#888888] mb-2">
                            <span className="text-xs font-semibold uppercase">Gym Facilities</span>
                            <Building2 className="w-4 h-4 text-[#faff69]" />
                        </div>
                        <div className="text-2xl font-extrabold text-white font-mono">{stats.total_facilities}</div>
                        <div className="text-[11px] text-[#888888] mt-1">
                            {stats.active_facilities} active zones
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-5">
                        <div className="flex items-center justify-between text-[#888888] mb-2">
                            <span className="text-xs font-semibold uppercase">Homepage Blocks</span>
                            <LayoutTemplate className="w-4 h-4 text-[#faff69]" />
                        </div>
                        <div className="text-2xl font-extrabold text-white font-mono">{stats.total_sections}</div>
                        <div className="text-[11px] text-[#22c55e] mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Sections active</span>
                        </div>
                    </div>
                </div>

                {/* Navigation Modules Quick Access */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link
                        href={route('admin.website.heroes.index')}
                        className="bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] hover:border-[#faff69]/40 rounded-xl p-5 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 rounded-lg bg-[#242424] text-[#faff69] group-hover:bg-[#faff69] group-hover:text-[#0a0a0a] transition-colors">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#888888] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-[#faff69] transition-colors">
                            Home Hero Slides
                        </h3>
                        <p className="text-xs text-[#888888] mt-1">
                            Manage dynamic full-bleed hero carousel images, videos, and CTA headlines.
                        </p>
                    </Link>

                    <Link
                        href={route('admin.trainers.index')}
                        className="bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] hover:border-[#faff69]/40 rounded-xl p-5 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 rounded-lg bg-[#242424] text-[#faff69] group-hover:bg-[#faff69] group-hover:text-[#0a0a0a] transition-colors">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#888888] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-[#faff69] transition-colors">
                            Trainers & Photocards
                        </h3>
                        <p className="text-xs text-[#888888] mt-1">
                            Manage certified coaches, portrait photocards, roles, and shift availability.
                        </p>
                    </Link>

                    <Link
                        href={route('admin.website.pages.index')}
                        className="bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-xl p-5 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 rounded-lg bg-[#242424] text-[#faff69] group-hover:bg-[#faff69] group-hover:text-[#0a0a0a] transition-colors">
                                <FileText className="w-5 h-5" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#888888] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-[#faff69] transition-colors">
                            Manage Pages
                        </h3>
                        <p className="text-xs text-[#888888] mt-1">
                            Create and publish custom CMS pages (Terms, Privacy, Special Events).
                        </p>
                    </Link>

                    <Link
                        href={route('admin.website.faqs.index')}
                        className="bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-xl p-5 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 rounded-lg bg-[#242424] text-[#faff69] group-hover:bg-[#faff69] group-hover:text-[#0a0a0a] transition-colors">
                                <HelpCircle className="w-5 h-5" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#888888] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-[#faff69] transition-colors">
                            Manage FAQs
                        </h3>
                        <p className="text-xs text-[#888888] mt-1">
                            Add, organize, and reorder public FAQ questions and answers.
                        </p>
                    </Link>

                    <Link
                        href={route('admin.website.facilities.index')}
                        className="bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-xl p-5 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 rounded-lg bg-[#242424] text-[#faff69] group-hover:bg-[#faff69] group-hover:text-[#0a0a0a] transition-colors">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#888888] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-[#faff69] transition-colors">
                            Manage Facilities
                        </h3>
                        <p className="text-xs text-[#888888] mt-1">
                            Upload photos and highlight training zones and amenities.
                        </p>
                    </Link>

                    <Link
                        href={route('admin.website.sections.index')}
                        className="bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-xl p-5 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 rounded-lg bg-[#242424] text-[#faff69] group-hover:bg-[#faff69] group-hover:text-[#0a0a0a] transition-colors">
                                <LayoutTemplate className="w-5 h-5" />
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#888888] group-hover:text-white transition-colors" />
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-[#faff69] transition-colors">
                            Homepage Sections
                        </h3>
                        <p className="text-xs text-[#888888] mt-1">
                            Configure Hero headlines, CTA copy, and About preview blocks.
                        </p>
                    </Link>
                </div>

                {/* Content Tables Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Pages */}
                    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recent CMS Pages</h2>
                            <Link
                                href={route('admin.website.pages.create')}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#faff69] hover:underline"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Create Page</span>
                            </Link>
                        </div>

                        {recentPages.length === 0 ? (
                            <p className="text-xs text-[#888888] py-4">No custom pages created yet.</p>
                        ) : (
                            <div className="divide-y divide-[#2a2a2a]">
                                {recentPages.map((page) => (
                                    <div key={page.id} className="py-3 flex items-center justify-between">
                                        <div>
                                            <div className="text-xs font-bold text-white">{page.title}</div>
                                            <div className="text-[11px] font-mono text-[#888888]">/p/{page.slug}</div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                page.status === 'published'
                                                    ? 'bg-[#22c55e]/15 text-[#22c55e]'
                                                    : 'bg-[#f59e0b]/15 text-[#f59e0b]'
                                            }`}>
                                                {page.status}
                                            </span>
                                            <Link
                                                href={route('admin.website.pages.edit', page.id)}
                                                className="text-xs text-[#888888] hover:text-[#faff69]"
                                            >
                                                Edit
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Published Facilities */}
                    <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Gym Facilities</h2>
                            <Link
                                href={route('admin.website.facilities.create')}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#faff69] hover:underline"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Facility</span>
                            </Link>
                        </div>

                        {facilities.length === 0 ? (
                            <p className="text-xs text-[#888888] py-4">No facilities created yet.</p>
                        ) : (
                            <div className="divide-y divide-[#2a2a2a]">
                                {facilities.map((fac) => (
                                    <div key={fac.id} className="py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded bg-[#242424] overflow-hidden flex items-center justify-center flex-shrink-0">
                                                {fac.image_url ? (
                                                    <img src={fac.image_url} alt={fac.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building2 className="w-4 h-4 text-[#888888]" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white">{fac.name}</div>
                                                <div className="text-[11px] text-[#888888] line-clamp-1">{fac.description}</div>
                                            </div>
                                        </div>
                                        <Link
                                            href={route('admin.website.facilities.edit', fac.id)}
                                            className="text-xs text-[#888888] hover:text-[#faff69]"
                                        >
                                            Edit
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
