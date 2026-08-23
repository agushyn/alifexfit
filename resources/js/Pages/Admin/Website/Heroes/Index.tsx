import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Sparkles,
    Plus,
    Search,
    Filter,
    RotateCcw,
    CheckCircle2,
    XCircle,
    Edit2,
    Trash2,
    Eye,
    Video,
    Image as ImageIcon,
    ArrowUpDown,
    ChevronUp,
    ChevronDown,
    ExternalLink,
    Play
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Modal } from '@/Components/Modal';
import { WebsiteHero } from '@/types';

interface HeroesIndexProps {
    heroes: WebsiteHero[];
    filters: {
        search?: string;
        status?: string;
        media_type?: string;
    };
    stats: {
        total: number;
        active: number;
        inactive: number;
        video_slides: number;
        image_slides: number;
    };
}

export default function HeroesIndex({ heroes, filters, stats }: HeroesIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [mediaType, setMediaType] = useState(filters.media_type || '');
    const [deletingHero, setDeletingHero] = useState<WebsiteHero | null>(null);
    const [previewHero, setPreviewHero] = useState<WebsiteHero | null>(null);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            route('admin.website.heroes.index'),
            {
                search: search || undefined,
                status: status || undefined,
                media_type: mediaType || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setMediaType('');
        router.get(route('admin.website.heroes.index'));
    };

    const handleToggleStatus = (hero: WebsiteHero) => {
        router.post(route('admin.website.heroes.toggle-status', hero.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        if (!deletingHero) return;
        router.delete(route('admin.website.heroes.destroy', deletingHero.id), {
            onFinish: () => setDeletingHero(null),
        });
    };

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newHeroes = [...heroes];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newHeroes.length) return;

        const temp = newHeroes[index];
        newHeroes[index] = newHeroes[targetIndex];
        newHeroes[targetIndex] = temp;

        const orderedIds = newHeroes.map((h) => h.id);
        router.post(route('admin.website.heroes.reorder'), { ordered_ids: orderedIds }, {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Website CMS', href: route('admin.website.overview') },
                { label: 'Home Hero' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <Sparkles className="w-6 h-6 text-[#faff69]" />
                            Home Hero Management
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Manage full-bleed dynamic image & video carousel slides for the public website homepage.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('admin.website.heroes.create')}>
                            <Button variant="primary" size="sm">
                                <Plus className="w-4 h-4" />
                                Add Hero Slide
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Home Hero CMS — EXFITS Admin" />

            <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    <Card variant="default" className="p-4 bg-gradient-to-br from-[#1a1a1a] to-[#121212]">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#888888] uppercase tracking-wider">Total Slides</span>
                            <Sparkles className="w-4 h-4 text-[#888888]" />
                        </div>
                        <div className="text-2xl font-extrabold font-mono text-white mt-1">
                            {stats.total}
                        </div>
                        <div className="text-[10px] text-[#888888] mt-0.5">Hero carousel items</div>
                    </Card>

                    <Card variant="default" className="p-4 bg-gradient-to-br from-[#1a1a1a] to-[#121212]">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#22c55e] uppercase tracking-wider">Active</span>
                            <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                        </div>
                        <div className="text-2xl font-extrabold font-mono text-[#22c55e] mt-1">
                            {stats.active}
                        </div>
                        <div className="text-[10px] text-[#888888] mt-0.5">Visible on homepage</div>
                    </Card>

                    <Card variant="default" className="p-4 bg-gradient-to-br from-[#1a1a1a] to-[#121212]">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#ef4444] uppercase tracking-wider">Inactive</span>
                            <XCircle className="w-4 h-4 text-[#ef4444]" />
                        </div>
                        <div className="text-2xl font-extrabold font-mono text-[#ef4444] mt-1">
                            {stats.inactive}
                        </div>
                        <div className="text-[10px] text-[#888888] mt-0.5">Hidden from public</div>
                    </Card>

                    <Card variant="default" className="p-4 bg-gradient-to-br from-[#1a1a1a] to-[#121212]">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#3b82f6] uppercase tracking-wider">Video Media</span>
                            <Video className="w-4 h-4 text-[#3b82f6]" />
                        </div>
                        <div className="text-2xl font-extrabold font-mono text-[#3b82f6] mt-1">
                            {stats.video_slides}
                        </div>
                        <div className="text-[10px] text-[#888888] mt-0.5">MP4 / WebM background</div>
                    </Card>

                    <Card variant="default" className="p-4 bg-gradient-to-br from-[#1a1a1a] to-[#121212] col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-[#faff69] uppercase tracking-wider">Image Media</span>
                            <ImageIcon className="w-4 h-4 text-[#faff69]" />
                        </div>
                        <div className="text-2xl font-extrabold font-mono text-[#faff69] mt-1">
                            {stats.image_slides}
                        </div>
                        <div className="text-[10px] text-[#888888] mt-0.5">Static photo cover</div>
                    </Card>
                </div>

                {/* Filter Bar */}
                <Card variant="default" className="p-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-1">
                                Search Headline
                            </label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a5a]" />
                                <TextInput
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search title, subtitle..."
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-1">
                                Media Type
                            </label>
                            <select
                                value={mediaType}
                                onChange={(e) => setMediaType(e.target.value)}
                                className="w-full h-10 px-3 bg-[#121212] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            >
                                <option value="">All Media Types</option>
                                <option value="image">Image Only</option>
                                <option value="video">Video Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-1">
                                Status
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full h-10 px-3 bg-[#121212] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active Only</option>
                                <option value="inactive">Inactive Only</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <Button type="submit" variant="primary" size="sm" className="flex-1">
                                <Filter className="w-3.5 h-3.5" />
                                Apply Filters
                            </Button>
                            {(search || status || mediaType) && (
                                <Button type="button" variant="secondary" size="sm" onClick={handleReset}>
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </Button>
                            )}
                        </div>
                    </form>
                </Card>

                {/* Slides List */}
                {heroes.length > 0 ? (
                    <div className="space-y-4">
                        {heroes.map((hero, index) => (
                            <Card
                                key={hero.id}
                                variant="default"
                                className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:border-[#3a3a3a] transition-all"
                            >
                                {/* Left Side: Order Controls & Media Thumbnail */}
                                <div className="flex items-center gap-4 min-w-0">
                                    {/* Sort Order Controls */}
                                    <div className="flex flex-col items-center gap-1 bg-[#121212] border border-[#2a2a2a] rounded-lg p-1">
                                        <button
                                            type="button"
                                            disabled={index === 0}
                                            onClick={() => handleMove(index, 'up')}
                                            className={`p-1 rounded text-[#888888] hover:text-white transition-colors ${
                                                index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#242424]'
                                            }`}
                                            title="Move Up"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <span className="text-xs font-mono font-bold text-[#faff69] px-1">
                                            #{index + 1}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={index === heroes.length - 1}
                                            onClick={() => handleMove(index, 'down')}
                                            className={`p-1 rounded text-[#888888] hover:text-white transition-colors ${
                                                index === heroes.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#242424]'
                                            }`}
                                            title="Move Down"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Media Thumbnail */}
                                    <div
                                        onClick={() => setPreviewHero(hero)}
                                        className="w-32 h-20 sm:w-40 sm:h-24 rounded-xl bg-[#141414] border border-[#2a2a2a] overflow-hidden flex items-center justify-center relative flex-shrink-0 cursor-pointer group"
                                    >
                                        {hero.media_type === 'video' ? (
                                            <>
                                                {hero.poster_url ? (
                                                    <img src={hero.poster_url} alt={hero.title} className="w-full h-full object-cover" />
                                                ) : hero.media_url ? (
                                                    <video src={hero.media_url} className="w-full h-full object-cover" muted />
                                                ) : (
                                                    <div className="bg-[#1f1f1f] w-full h-full flex items-center justify-center" />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                                                    <div className="w-8 h-8 rounded-full bg-[#faff69] text-[#0a0a0a] flex items-center justify-center shadow-lg">
                                                        <Play className="w-4 h-4 fill-current ml-0.5" />
                                                    </div>
                                                </div>
                                            </>
                                        ) : hero.media_url ? (
                                            <img src={hero.media_url} alt={hero.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        ) : (
                                            <div className="text-center p-2">
                                                <ImageIcon className="w-6 h-6 text-[#5a5a5a] mx-auto mb-1" />
                                                <span className="text-[10px] text-[#888888]">Default Cover</span>
                                            </div>
                                        )}

                                        <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-black/80 text-white border border-white/10">
                                            {hero.media_type}
                                        </span>
                                    </div>

                                    {/* Slide Content Meta */}
                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <Badge variant={hero.is_active ? 'active' : 'inactive'} size="sm">
                                                {hero.is_active ? 'ACTIVE' : 'INACTIVE'}
                                            </Badge>
                                            {hero.media_type === 'video' ? (
                                                <span className="text-[10px] text-[#3b82f6] font-mono uppercase font-bold flex items-center gap-1">
                                                    <Video className="w-3 h-3" />
                                                    Video Slide
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-[#faff69] font-mono uppercase font-bold flex items-center gap-1">
                                                    <ImageIcon className="w-3 h-3" />
                                                    Image Slide
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-base font-bold text-white uppercase tracking-tight truncate">
                                            {hero.title}
                                        </h3>

                                        {hero.subtitle && (
                                            <p className="text-xs text-[#faff69] font-mono truncate">
                                                {hero.subtitle}
                                            </p>
                                        )}

                                        {hero.description && (
                                            <p className="text-xs text-[#888888] line-clamp-1 max-w-xl">
                                                {hero.description}
                                            </p>
                                        )}

                                        {hero.cta_label && (
                                            <div className="text-[11px] text-[#cccccc] flex items-center gap-1.5 pt-0.5">
                                                <span className="text-[#888888]">CTA:</span>
                                                <span className="font-bold text-white">{hero.cta_label}</span>
                                                {hero.cta_url && (
                                                    <span className="text-[#888888] font-mono">({hero.cta_url})</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side Actions */}
                                <div className="flex items-center gap-2 w-full lg:w-auto justify-end pt-3 lg:pt-0 border-t lg:border-t-0 border-[#2a2a2a]">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setPreviewHero(hero)}
                                        title="Preview Slide"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Preview
                                    </Button>

                                    <Link href={route('admin.website.heroes.edit', hero.id)}>
                                        <Button variant="secondary" size="sm" title="Edit Slide">
                                            <Edit2 className="w-3.5 h-3.5" />
                                            Edit
                                        </Button>
                                    </Link>

                                    <Button
                                        type="button"
                                        variant={hero.is_active ? 'secondary' : 'primary'}
                                        size="sm"
                                        onClick={() => handleToggleStatus(hero)}
                                    >
                                        {hero.is_active ? 'Deactivate' : 'Activate'}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => setDeletingHero(hero)}
                                        className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#ef4444]/15 text-[#888888] hover:text-[#ef4444] border border-[#2a2a2a] transition-colors"
                                        title="Delete Slide"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card variant="default" className="p-12 text-center">
                        <Sparkles className="w-12 h-12 text-[#5a5a5a] mx-auto mb-3" />
                        <h3 className="text-base font-bold text-white">No Hero slides found</h3>
                        <p className="text-xs text-[#888888] mt-1 max-w-sm mx-auto">
                            No hero carousel slides configured for this gym yet. Create your first slide with custom photography or high-energy video background.
                        </p>
                        <div className="mt-4">
                            <Link href={route('admin.website.heroes.create')}>
                                <Button variant="primary" size="sm">
                                    <Plus className="w-4 h-4" />
                                    Add First Hero Slide
                                </Button>
                            </Link>
                        </div>
                    </Card>
                )}
            </div>

            {/* Slide Live Preview Modal */}
            <Modal
                isOpen={!!previewHero}
                onClose={() => setPreviewHero(null)}
                title={`Hero Preview: ${previewHero?.title}`}
                size="xl"
            >
                {previewHero && (
                    <div className="space-y-6">
                        <div className="relative rounded-2xl overflow-hidden bg-black border border-[#2a2a2a] aspect-video flex items-center justify-center">
                            {previewHero.media_type === 'video' && previewHero.media_url ? (
                                <video
                                    src={previewHero.media_url}
                                    poster={previewHero.poster_url || undefined}
                                    controls
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            ) : previewHero.media_url ? (
                                <img
                                    src={previewHero.media_url}
                                    alt={previewHero.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a]" />
                            )}

                            {/* Overlay Copy */}
                            <div className="absolute inset-0 bg-black/50 p-8 flex flex-col justify-end">
                                {previewHero.subtitle && (
                                    <div className="text-xs font-mono text-[#faff69] uppercase font-bold tracking-widest mb-1">
                                        {previewHero.subtitle}
                                    </div>
                                )}
                                <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                                    {previewHero.title}
                                </h2>
                                {previewHero.description && (
                                    <p className="text-xs sm:text-sm text-[#cccccc] max-w-xl mt-2 line-clamp-2">
                                        {previewHero.description}
                                    </p>
                                )}
                                {previewHero.cta_label && (
                                    <div className="mt-4">
                                        <span className="inline-block px-5 py-2 rounded-lg bg-[#faff69] text-[#0a0a0a] text-xs font-extrabold uppercase tracking-wider">
                                            {previewHero.cta_label}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button variant="secondary" size="sm" onClick={() => setPreviewHero(null)}>
                                Close Preview
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deletingHero}
                onClose={() => setDeletingHero(null)}
                title="Delete Hero Slide"
                description="Are you sure you want to permanently delete this Hero slide? All uploaded media and poster assets will be removed."
            >
                <div className="space-y-4">
                    <p className="text-xs text-[#cccccc]">
                        Slide Title: <strong className="text-white">{deletingHero?.title}</strong>
                    </p>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
                        <Button variant="secondary" size="sm" onClick={() => setDeletingHero(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" size="sm" onClick={handleDelete}>
                            Confirm Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
