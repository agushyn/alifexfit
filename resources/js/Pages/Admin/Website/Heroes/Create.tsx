import React, { useState, useRef } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Sparkles,
    ArrowLeft,
    Save,
    Image as ImageIcon,
    Video,
    Upload,
    X,
    Play,
    AlertCircle
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';

interface CreateProps {
    nextSortOrder: number;
}

export default function Create({ nextSortOrder }: CreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        subtitle: '',
        description: '',
        cta_label: 'EXPLORE MEMBERSHIPS',
        cta_url: '/membership',
        media_type: 'image' as 'image' | 'video',
        media: null as File | null,
        poster: null as File | null,
        sort_order: nextSortOrder,
        is_active: true,
    });

    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [posterPreview, setPosterPreview] = useState<string | null>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);
    const posterInputRef = useRef<HTMLInputElement>(null);

    const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('media', file);
            setMediaPreview(URL.createObjectURL(file));
        }
    };

    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('poster', file);
            setPosterPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveMedia = () => {
        setData('media', null);
        setMediaPreview(null);
        if (mediaInputRef.current) mediaInputRef.current.value = '';
    };

    const handleRemovePoster = () => {
        setData('poster', null);
        setPosterPreview(null);
        if (posterInputRef.current) posterInputRef.current.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.website.heroes.store'), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Website CMS', href: route('admin.website.overview') },
                { label: 'Home Hero', href: route('admin.website.heroes.index') },
                { label: 'Add Slide' },
            ]}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <Sparkles className="w-6 h-6 text-[#faff69]" />
                            Create Hero Slide
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Configure a new headline and background photo or video for the public homepage carousel.
                        </p>
                    </div>

                    <Link href={route('admin.website.heroes.index')}>
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                            Back to List
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Create Hero Slide — EXFITS Admin" />

            <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
                {/* 1. Content Dossier */}
                <Card variant="default" className="p-6 space-y-6">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#faff69]" />
                        Slide Content & Typography
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                                Main Title / Headline <span className="text-[#ef4444]">*</span>
                            </label>
                            <TextInput
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="e.g. HIGH VOLTAGE FITNESS & ELITE TRAINING"
                                className="uppercase font-bold"
                                required
                            />
                            {errors.title && <p className="text-xs text-[#ef4444] mt-1">{errors.title}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                                Subtitle / Kicker (Optional)
                            </label>
                            <TextInput
                                value={data.subtitle}
                                onChange={(e) => setData('subtitle', e.target.value)}
                                placeholder="e.g. ENGINEERED FOR PEAK PERFORMANCE"
                                className="font-mono text-xs"
                            />
                            {errors.subtitle && <p className="text-xs text-[#ef4444] mt-1">{errors.subtitle}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                                Supporting Description (Optional)
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Short 1-2 sentence paragraph framing gym capabilities or facilities..."
                                rows={3}
                                className="w-full px-3.5 py-2.5 bg-[#121212] text-white text-xs rounded-xl border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69] leading-relaxed"
                            />
                            {errors.description && <p className="text-xs text-[#ef4444] mt-1">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                                    CTA Button Label (Optional)
                                </label>
                                <TextInput
                                    value={data.cta_label}
                                    onChange={(e) => setData('cta_label', e.target.value)}
                                    placeholder="e.g. EXPLORE MEMBERSHIPS"
                                />
                                {errors.cta_label && <p className="text-xs text-[#ef4444] mt-1">{errors.cta_label}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                                    CTA Destination URL (Optional)
                                </label>
                                <TextInput
                                    value={data.cta_url}
                                    onChange={(e) => setData('cta_url', e.target.value)}
                                    placeholder="e.g. /membership or https://wa.me/..."
                                />
                                {errors.cta_url && <p className="text-xs text-[#ef4444] mt-1">{errors.cta_url}</p>}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 2. Media Upload & Configuration */}
                <Card variant="default" className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-[#faff69]" />
                            Background Media
                        </h2>

                        {/* Media Type Switcher */}
                        <div className="flex items-center p-1 bg-[#121212] rounded-lg border border-[#2a2a2a]">
                            <button
                                type="button"
                                onClick={() => {
                                    setData('media_type', 'image');
                                    handleRemoveMedia();
                                }}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                    data.media_type === 'image'
                                        ? 'bg-[#faff69] text-[#0a0a0a] shadow-sm'
                                        : 'text-[#888888] hover:text-white'
                                }`}
                            >
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>Image</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setData('media_type', 'video');
                                    handleRemoveMedia();
                                }}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                    data.media_type === 'video'
                                        ? 'bg-[#faff69] text-[#0a0a0a] shadow-sm'
                                        : 'text-[#888888] hover:text-white'
                                }`}
                            >
                                <Video className="w-3.5 h-3.5" />
                                <span>Video</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Primary Media Upload */}
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-white uppercase tracking-wider">
                                {data.media_type === 'video' ? 'Upload Background Video (MP4 / WebM)' : 'Upload High-Res Cover Image (JPG / PNG / WEBP)'}
                            </label>

                            <input
                                type="file"
                                ref={mediaInputRef}
                                onChange={handleMediaChange}
                                accept={data.media_type === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/jpg,image/webp'}
                                className="hidden"
                            />

                            {mediaPreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-[#3a3a3a] bg-black aspect-video flex items-center justify-center group">
                                    {data.media_type === 'video' ? (
                                        <video src={mediaPreview} controls muted className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                                    )}
                                    <button
                                        type="button"
                                        onClick={handleRemoveMedia}
                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-[#ef4444] text-white transition-colors"
                                        title="Remove media"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => mediaInputRef.current?.click()}
                                    className="border-2 border-dashed border-[#2a2a2a] hover:border-[#faff69] rounded-xl p-8 text-center cursor-pointer transition-colors bg-[#121212]/50 aspect-video flex flex-col items-center justify-center space-y-2"
                                >
                                    <Upload className="w-8 h-8 text-[#5a5a5a]" />
                                    <div className="text-xs font-bold text-white">Click to Select {data.media_type === 'video' ? 'Video' : 'Image'}</div>
                                    <div className="text-[10px] text-[#888888]">
                                        {data.media_type === 'video' ? 'MP4 or WebM up to 50MB' : 'JPG, PNG, WEBP up to 10MB'}
                                    </div>
                                </div>
                            )}
                            {errors.media && <p className="text-xs text-[#ef4444]">{errors.media}</p>}
                        </div>

                        {/* Fallback / Poster Image */}
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                                <span>Poster / Fallback Image</span>
                                <span className="text-[10px] text-[#888888] font-normal">Recommended</span>
                            </label>

                            <input
                                type="file"
                                ref={posterInputRef}
                                onChange={handlePosterChange}
                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                className="hidden"
                            />

                            {posterPreview ? (
                                <div className="relative rounded-xl overflow-hidden border border-[#3a3a3a] bg-black aspect-video flex items-center justify-center group">
                                    <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={handleRemovePoster}
                                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-[#ef4444] text-white transition-colors"
                                        title="Remove poster"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => posterInputRef.current?.click()}
                                    className="border-2 border-dashed border-[#2a2a2a] hover:border-[#faff69] rounded-xl p-8 text-center cursor-pointer transition-colors bg-[#121212]/50 aspect-video flex flex-col items-center justify-center space-y-2"
                                >
                                    <ImageIcon className="w-8 h-8 text-[#5a5a5a]" />
                                    <div className="text-xs font-bold text-white">Click to Select Poster Image</div>
                                    <div className="text-[10px] text-[#888888]">Displayed before video loads or on mobile</div>
                                </div>
                            )}
                            {errors.poster && <p className="text-xs text-[#ef4444]">{errors.poster}</p>}
                        </div>
                    </div>
                </Card>

                {/* 3. Display Controls & Status */}
                <Card variant="default" className="p-6 space-y-6">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#faff69]" />
                        Display Controls
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                                Sort Sequence Order
                            </label>
                            <TextInput
                                type="number"
                                value={data.sort_order}
                                onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                min={0}
                                className="font-mono"
                            />
                            <p className="text-[11px] text-[#888888] mt-1">Lower numbers display first (0, 1, 2...)</p>
                            {errors.sort_order && <p className="text-xs text-[#ef4444] mt-1">{errors.sort_order}</p>}
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="w-5 h-5 rounded bg-[#121212] border-[#2a2a2a] text-[#faff69] focus:ring-[#faff69] focus:ring-offset-0 cursor-pointer"
                            />
                            <label htmlFor="is_active" className="text-xs font-bold text-white cursor-pointer select-none">
                                Active / Visible on Homepage
                                <span className="block text-[11px] text-[#888888] font-normal">
                                    When checked, this slide will be included in the live public hero carousel.
                                </span>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Link href={route('admin.website.heroes.index')}>
                        <Button variant="secondary" size="md">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" variant="primary" size="md" disabled={processing}>
                        <Save className="w-4 h-4" />
                        {processing ? 'Saving Hero Slide...' : 'Save Hero Slide'}
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
