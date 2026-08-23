import { Link } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { WebsiteBranding } from '@/types';
import { ArrowLeft, Calendar, Sparkles } from 'lucide-react';

interface PageProps {
    branding: WebsiteBranding;
    page: {
        id: number;
        title: string;
        slug: string;
        excerpt?: string | null;
        content?: string | null;
        published_at?: string | null;
        meta_title?: string | null;
        meta_description?: string | null;
        og_image_url?: string | null;
    };
}

export default function Page({ branding, page }: PageProps) {
    const { gym } = branding;

    return (
        <PublicLayout
            branding={branding}
            title={page.meta_title || page.title}
            description={page.meta_description || page.excerpt || undefined}
            ogImage={page.og_image_url}
        >
            {/* Header Banner */}
            <section className="py-16 sm:py-24 border-b border-[#2a2a2a] bg-[#0f0f0f] relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#faff69]/10 blur-[130px] pointer-events-none rounded-full" />
                
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-xs font-semibold text-[#faff69]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{gym.name}</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase leading-[1.1]">
                        {page.title}
                    </h1>
                    {page.published_at && (
                        <div className="flex items-center justify-center gap-2 text-xs text-[#888888] font-mono">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Last Updated: {page.published_at}</span>
                        </div>
                    )}
                </div>
            </section>

            {/* Page Content */}
            <article className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8 sm:p-12 space-y-6 text-[#cccccc] leading-relaxed text-sm whitespace-pre-line">
                    {page.excerpt && (
                        <p className="text-base text-white font-medium italic border-l-2 border-[#faff69] pl-4">
                            {page.excerpt}
                        </p>
                    )}

                    <div className="prose prose-invert max-w-none text-[#cccccc] leading-relaxed">
                        {page.content || 'Content for this page is being updated.'}
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link
                        href={route('public.home')}
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#888888] hover:text-[#faff69] transition-colors uppercase tracking-wider"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>BACK TO HOME</span>
                    </Link>
                </div>
            </article>
        </PublicLayout>
    );
}
