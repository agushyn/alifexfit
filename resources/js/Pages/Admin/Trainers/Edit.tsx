import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Sparkles,
    ArrowLeft,
    Save,
    Upload,
    Award,
    User,
    Phone,
    Mail,
    Calendar,
    ShieldCheck
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Trainer } from '@/types';

interface TrainersEditProps {
    trainer: Trainer;
}

export default function TrainersEdit({ trainer }: TrainersEditProps) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: trainer.name || '',
        role: trainer.role || '',
        email: trainer.email || '',
        phone: trainer.phone || '',
        bio: trainer.bio || '',
        specialization: trainer.specialization || '',
        certification: trainer.certification || '',
        sort_order: trainer.sort_order ?? 0,
        hire_date: trainer.hire_date ? trainer.hire_date.substring(0, 10) : '',
        status: trainer.status || 'active',
        notes: trainer.notes || '',
        profile_photo: null as File | null,
    });

    const [photoPreview, setPhotoPreview] = useState<string | null>(trainer.profile_photo_url || null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('profile_photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.trainers.update', trainer.id), {
            forceFormData: true,
        });
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Trainers', href: route('admin.trainers.index') },
                { label: trainer.name, href: route('admin.trainers.show', trainer.id) },
                { label: 'Edit' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <Sparkles className="w-6 h-6 text-[#faff69]" />
                            Edit Coach: {trainer.name}
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Update coach credentials, public photocard details, or contact information.
                        </p>
                    </div>

                    <Link href={route('admin.trainers.show', trainer.id)}>
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Detail
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title={`Edit ${trainer.name} — EXFITS Gym`} />

            <div className="max-w-4xl mx-auto space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info & Specialization */}
                    <Card variant="default" className="p-6">
                        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
                            <User className="w-4 h-4 text-[#faff69]" />
                            Trainer Identity & Photocard Assets
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Photocard Portrait Photo */}
                            <div className="sm:col-span-2 flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-xl bg-[#121212] border border-[#2a2a2a]">
                                <div className="flex-shrink-0">
                                    {photoPreview ? (
                                        <div className="w-24 h-30 rounded-xl overflow-hidden border-2 border-[#faff69] shadow-lg aspect-[4/5] bg-black">
                                            <img
                                                src={photoPreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-30 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-[#5a5a5a] flex flex-col items-center justify-center text-xs aspect-[4/5]">
                                            <Upload className="w-6 h-6 mb-1 text-[#888888]" />
                                            <span className="text-[10px] text-center px-1 font-mono">4:5 Portrait</span>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5 flex-1">
                                    <label className="block text-xs font-bold text-white uppercase tracking-wider">
                                        Portrait Profile Photo (Public Photocard)
                                    </label>
                                    <p className="text-[11px] text-[#888888]">
                                        Upload high-resolution 4:5 vertical portrait headshot or full-body pose (JPEG, PNG, WEBP, up to 10MB).
                                    </p>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg,image/webp"
                                        onChange={handlePhotoChange}
                                        className="text-xs text-[#888888] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#242424] file:text-white hover:file:bg-[#2a2a2a] cursor-pointer"
                                    />
                                    {errors.profile_photo && (
                                        <p className="text-xs text-[#ef4444] mt-1">{errors.profile_photo}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                                    Full Name <span className="text-[#ef4444]">*</span>
                                </label>
                                <TextInput
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Budi Pratama"
                                    required
                                />
                                {errors.name && <p className="text-xs text-[#ef4444] mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                                    Coach Role / Title (Photocard Display)
                                </label>
                                <TextInput
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    placeholder="e.g. Head Strength Coach, Senior PT"
                                />
                                {errors.role && <p className="text-xs text-[#ef4444] mt-1">{errors.role}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                                    Primary Specialization
                                </label>
                                <div className="relative">
                                    <Award className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a5a]" />
                                    <TextInput
                                        value={data.specialization}
                                        onChange={(e) => setData('specialization', e.target.value)}
                                        placeholder="e.g. Strength & Conditioning, Hypertrophy"
                                        className="pl-9"
                                    />
                                </div>
                                {errors.specialization && <p className="text-xs text-[#ef4444] mt-1">{errors.specialization}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                                    Certifications & Credentials
                                </label>
                                <div className="relative">
                                    <ShieldCheck className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a5a]" />
                                    <TextInput
                                        value={data.certification}
                                        onChange={(e) => setData('certification', e.target.value)}
                                        placeholder="e.g. CSCS, NASM-CPT, Precision Nutrition"
                                        className="pl-9"
                                    />
                                </div>
                                {errors.certification && <p className="text-xs text-[#ef4444] mt-1">{errors.certification}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                                    Status <span className="text-[#ef4444]">*</span>
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value as 'active' | 'inactive')}
                                    className="w-full h-10 px-3 bg-[#121212] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                >
                                    <option value="active">Active (Visible on Website & Available for PT)</option>
                                    <option value="inactive">Inactive (Hidden from Website / On Leave)</option>
                                </select>
                                {errors.status && <p className="text-xs text-[#ef4444] mt-1">{errors.status}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                                    Display Sort Sequence
                                </label>
                                <TextInput
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', parseInt(e.target.value) || 0)}
                                    min={0}
                                    className="font-mono"
                                />
                                {errors.sort_order && <p className="text-xs text-[#ef4444] mt-1">{errors.sort_order}</p>}
                            </div>
                        </div>
                    </Card>

                    {/* Contact & Bio */}
                    <Card variant="default" className="p-6">
                        <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#faff69]" />
                            Contact & Public Biography
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a5a]" />
                                    <TextInput
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="e.g. trainer@exfits.com"
                                        className="pl-9"
                                    />
                                </div>
                                {errors.email && <p className="text-xs text-[#ef4444] mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                                    Phone Number / WhatsApp
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a5a]" />
                                    <TextInput
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="e.g. +62 812 3456 7890"
                                        className="pl-9"
                                    />
                                </div>
                                {errors.phone && <p className="text-xs text-[#ef4444] mt-1">{errors.phone}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                                    Hire Date
                                </label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5a5a]" />
                                    <TextInput
                                        type="date"
                                        value={data.hire_date}
                                        onChange={(e) => setData('hire_date', e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                {errors.hire_date && <p className="text-xs text-[#ef4444] mt-1">{errors.hire_date}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                                    Public Biography / Overview
                                </label>
                                <textarea
                                    value={data.bio}
                                    onChange={(e) => setData('bio', e.target.value)}
                                    rows={4}
                                    placeholder="Describe coach background, philosophy, training focus, and athletic accomplishments..."
                                    className="w-full px-3.5 py-2.5 bg-[#121212] text-white text-xs rounded-xl border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69] leading-relaxed"
                                />
                                {errors.bio && <p className="text-xs text-[#ef4444] mt-1">{errors.bio}</p>}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1.5">
                                    Internal Staff Notes (Private)
                                </label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    rows={2}
                                    placeholder="Private administration notes (contract terms, emergency contact, etc.)..."
                                    className="w-full px-3.5 py-2.5 bg-[#121212] text-white text-xs rounded-xl border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                />
                                {errors.notes && <p className="text-xs text-[#ef4444] mt-1">{errors.notes}</p>}
                            </div>
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <Link href={route('admin.trainers.show', trainer.id)}>
                            <Button variant="secondary" size="md">
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" variant="primary" size="md" disabled={processing}>
                            <Save className="w-4 h-4" />
                            {processing ? 'Saving Changes...' : 'Update Coach'}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
