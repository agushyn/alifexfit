import { useForm, Link } from '@inertiajs/react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Save, ExternalLink, Sliders, Globe, Phone, MapPin, Sparkles } from 'lucide-react';

interface SettingsProps {
    settings: {
        site_title: string;
        meta_title: string;
        meta_description: string;
        hero_headline: string;
        hero_subheadline: string;
        hero_cta_text: string;
        social_instagram?: string | null;
        social_facebook?: string | null;
        social_youtube?: string | null;
        social_tiktok?: string | null;
        contact_whatsapp?: string | null;
        contact_email?: string | null;
        contact_phone?: string | null;
        contact_address?: string | null;
        operating_hours?: string | null;
        announcement_bar?: string | null;
        google_maps_embed_url?: string | null;
        is_public_visible: boolean;
        og_image_url?: string | null;
    };
    gym: {
        id: number;
        name: string;
        code: string;
    };
}

export default function Settings({ settings, gym }: SettingsProps) {
    const { data, setData, post, processing, errors } = useForm({
        site_title: settings.site_title || '',
        meta_title: settings.meta_title || '',
        meta_description: settings.meta_description || '',
        hero_headline: settings.hero_headline || '',
        hero_subheadline: settings.hero_subheadline || '',
        hero_cta_text: settings.hero_cta_text || '',
        social_instagram: settings.social_instagram || '',
        social_facebook: settings.social_facebook || '',
        social_youtube: settings.social_youtube || '',
        social_tiktok: settings.social_tiktok || '',
        contact_whatsapp: settings.contact_whatsapp || '',
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || '',
        contact_address: settings.contact_address || '',
        operating_hours: settings.operating_hours || '',
        announcement_bar: settings.announcement_bar || '',
        google_maps_embed_url: settings.google_maps_embed_url || '',
        is_public_visible: settings.is_public_visible ? true : false,
        og_image: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.website.settings.update'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-tight uppercase">Public Website & SEO Settings</h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Configure branch branding, SEO metadata, contact coordinates, social channels, and public visibility.
                        </p>
                    </div>
                    <a
                        href={route('public.home')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] text-xs font-bold text-white transition-colors"
                    >
                        <ExternalLink className="w-3.5 h-3.5 text-[#faff69]" />
                        <span>PREVIEW PUBLIC SITE</span>
                    </a>
                </div>
            }
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Website CMS', href: route('admin.website.overview') },
                { label: 'Settings' },
            ]}
        >
            <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
                {/* General SEO & Site Identity */}
                <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8 space-y-6">
                    <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#faff69]" />
                        <span>Site Identity & Search Engine Optimization (SEO)</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">Site Brand Title *</label>
                            <input
                                type="text"
                                value={data.site_title}
                                onChange={(e) => setData('site_title', e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                                required
                            />
                            {errors.site_title && <div className="text-xs text-[#ef4444]">{errors.site_title}</div>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">Meta Title (Browser Tab / Google)</label>
                            <input
                                type="text"
                                value={data.meta_title}
                                onChange={(e) => setData('meta_title', e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                            />
                            {errors.meta_title && <div className="text-xs text-[#ef4444]">{errors.meta_title}</div>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white uppercase">Meta Description</label>
                        <textarea
                            rows={3}
                            value={data.meta_description}
                            onChange={(e) => setData('meta_description', e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                        />
                        {errors.meta_description && <div className="text-xs text-[#ef4444]">{errors.meta_description}</div>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">OpenGraph Social Share Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setData('og_image', e.target.files?.[0] || null)}
                                className="w-full px-3.5 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-[#cccccc]"
                            />
                            {settings.og_image_url && (
                                <div className="text-[11px] text-[#888888] mt-1">Current: <a href={settings.og_image_url} target="_blank" rel="noreferrer" className="text-[#faff69] underline">Preview Image</a></div>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">Top Announcement Banner (Optional)</label>
                            <input
                                type="text"
                                value={data.announcement_bar}
                                onChange={(e) => setData('announcement_bar', e.target.value)}
                                placeholder="e.g. SPECIAL PROMO: Free Personal Training Session This Month"
                                className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                            />
                        </div>
                    </div>
                </div>

                {/* Homepage Hero Defaults */}
                <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8 space-y-6">
                    <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#faff69]" />
                        <span>Homepage Hero Banner Copy</span>
                    </h2>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white uppercase">Hero Main Headline</label>
                        <input
                            type="text"
                            value={data.hero_headline}
                            onChange={(e) => setData('hero_headline', e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white uppercase">Hero Supporting Subheadline</label>
                        <textarea
                            rows={2}
                            value={data.hero_subheadline}
                            onChange={(e) => setData('hero_subheadline', e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white uppercase">Hero Primary CTA Button Text</label>
                        <input
                            type="text"
                            value={data.hero_cta_text}
                            onChange={(e) => setData('hero_cta_text', e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                        />
                    </div>
                </div>

                {/* Contact Coordinates & Social Media */}
                <div className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8 space-y-6">
                    <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#faff69]" />
                        <span>Public Contact & Social Channels</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">WhatsApp Direct Number</label>
                            <input
                                type="text"
                                value={data.contact_whatsapp}
                                onChange={(e) => setData('contact_whatsapp', e.target.value)}
                                placeholder="e.g. +6281100000001"
                                className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">Front Desk Phone</label>
                            <input
                                type="text"
                                value={data.contact_phone}
                                onChange={(e) => setData('contact_phone', e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">Public Email</label>
                            <input
                                type="email"
                                value={data.contact_email}
                                onChange={(e) => setData('contact_email', e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">Operating Hours</label>
                            <input
                                type="text"
                                value={data.operating_hours}
                                onChange={(e) => setData('operating_hours', e.target.value)}
                                placeholder="e.g. Mon - Sun: 06:00 - 22:00 WIB"
                                className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white uppercase">Physical Address</label>
                        <input
                            type="text"
                            value={data.contact_address}
                            onChange={(e) => setData('contact_address', e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white uppercase">Google Maps Embed URL</label>
                        <input
                            type="text"
                            value={data.google_maps_embed_url}
                            onChange={(e) => setData('google_maps_embed_url', e.target.value)}
                            placeholder="https://www.google.com/maps/embed?pb=..."
                            className="w-full px-3.5 py-2.5 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white font-mono placeholder-[#888888] focus:outline-none focus:border-[#faff69]"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">Instagram URL</label>
                            <input
                                type="url"
                                value={data.social_instagram}
                                onChange={(e) => setData('social_instagram', e.target.value)}
                                className="w-full px-3.5 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">Facebook URL</label>
                            <input
                                type="url"
                                value={data.social_facebook}
                                onChange={(e) => setData('social_facebook', e.target.value)}
                                className="w-full px-3.5 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">YouTube URL</label>
                            <input
                                type="url"
                                value={data.social_youtube}
                                onChange={(e) => setData('social_youtube', e.target.value)}
                                className="w-full px-3.5 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-white uppercase">TikTok URL</label>
                            <input
                                type="url"
                                value={data.social_tiktok}
                                onChange={(e) => setData('social_tiktok', e.target.value)}
                                className="w-full px-3.5 py-2 bg-[#242424] border border-[#2a2a2a] rounded-lg text-xs text-white focus:outline-none focus:border-[#faff69]"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-lg bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-extrabold uppercase tracking-wider transition-all disabled:opacity-50 shadow-xl"
                    >
                        <Save className="w-4 h-4" />
                        <span>{processing ? 'Saving Settings...' : 'Save All Settings'}</span>
                    </button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
