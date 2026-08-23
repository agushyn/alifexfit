import React, { FormEventHandler, useState } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    UserPlus,
    Save,
    ArrowLeft,
    Upload,
    Building2,
    Shield,
    Sparkles,
    PhoneCall,
    User
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Badge } from '@/Components/Badge';
import { PageProps } from '@/types';

export default function MemberCreate() {
    const { gym } = usePage<PageProps>().props;
    const currentGym = gym.current;

    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors } = useForm<{
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        date_of_birth: string;
        gender: string;
        address: string;
        emergency_contact: {
            name: string;
            phone: string;
            relationship: string;
        };
        photo: File | null;
        status: string;
    }>({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date_of_birth: '',
        gender: 'male',
        address: '',
        emergency_contact: {
            name: '',
            phone: '',
            relationship: '',
        },
        photo: null,
        status: 'active',
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('photo', file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.members.store'));
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Members', href: route('admin.members.index') },
                { label: 'Register New Member' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <UserPlus className="w-6 h-6 text-[#faff69]" />
                            Register New Member
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Tenant-scoped member creation for <strong className="text-white">{currentGym ? currentGym.name : 'Current Branch'}</strong>.
                        </p>
                    </div>

                    <Link href={route('admin.members.index')}>
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Directory
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Register Member — EXFITS Gym" />

            <form onSubmit={submit} className="max-w-4xl space-y-6">
                {/* Auto Member ID Informational Banner */}
                <div className="p-4 rounded-xl bg-[#121212] border border-[#2a2a2a] flex items-start gap-3.5">
                    <div className="p-2 rounded-lg bg-[#1a1a1a] text-[#faff69] border border-[#2a2a2a] flex-shrink-0">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 text-xs">
                        <div className="font-bold text-white flex items-center gap-2">
                            <span>Automatic Single-Source Member ID Assignment</span>
                            <Badge variant="phase" size="sm">CONCURRENCY SAFE</Badge>
                        </div>
                        <p className="text-[#888888] leading-relaxed">
                            Upon submission, a unique sequential Member ID (e.g. <code className="text-[#faff69] font-mono">MEM-000001</code>) will be generated automatically by the backend <code className="text-[#faff69]">MemberIdGenerator</code> service under <strong>{currentGym?.name}</strong>.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Details */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Section 1: Personal Details */}
                        <Card variant="default">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-[#2a2a2a]">
                                <User className="w-4 h-4 text-[#faff69]" />
                                Personal Information
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <TextInput
                                        label="First Name *"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        error={errors.first_name}
                                        placeholder="e.g. John"
                                        required
                                    />

                                    <TextInput
                                        label="Last Name"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        error={errors.last_name}
                                        placeholder="e.g. Doe"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <TextInput
                                        label="Email Address"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        error={errors.email}
                                        placeholder="member@example.com"
                                    />

                                    <TextInput
                                        label="Phone / WhatsApp"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        error={errors.phone}
                                        placeholder="+62 812 ..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <TextInput
                                        label="Date of Birth"
                                        type="date"
                                        value={data.date_of_birth}
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                        error={errors.date_of_birth}
                                    />

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                            Gender
                                        </label>
                                        <select
                                            value={data.gender}
                                            onChange={(e) => setData('gender', e.target.value)}
                                            className="w-full h-10 px-3 bg-[#1a1a1a] text-white text-sm rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other / Prefer not to say</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                        Residential Address
                                    </label>
                                    <textarea
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 bg-[#1a1a1a] text-white placeholder-[#5a5a5a] text-sm rounded-lg border border-[#2a2a2a] focus:outline-none focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                        placeholder="Street, City, Postal code..."
                                    />
                                    {errors.address && <p className="mt-1 text-xs text-[#ef4444]">{errors.address}</p>}
                                </div>
                            </div>
                        </Card>

                        {/* Section 2: Emergency Contact */}
                        <Card variant="default">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-[#2a2a2a]">
                                <PhoneCall className="w-4 h-4 text-[#22c55e]" />
                                Emergency Contact Information
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <TextInput
                                        label="Contact Person Name"
                                        value={data.emergency_contact.name}
                                        onChange={(e) =>
                                            setData('emergency_contact', {
                                                ...data.emergency_contact,
                                                name: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. Jane Doe"
                                    />

                                    <TextInput
                                        label="Emergency Phone"
                                        value={data.emergency_contact.phone}
                                        onChange={(e) =>
                                            setData('emergency_contact', {
                                                ...data.emergency_contact,
                                                phone: e.target.value,
                                            })
                                        }
                                        placeholder="+62 811 ..."
                                    />

                                    <TextInput
                                        label="Relationship"
                                        value={data.emergency_contact.relationship}
                                        onChange={(e) =>
                                            setData('emergency_contact', {
                                                ...data.emergency_contact,
                                                relationship: e.target.value,
                                            })
                                        }
                                        placeholder="e.g. Spouse, Parent"
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right 1 Col: Photo & Status */}
                    <div className="space-y-6">
                        {/* Profile Photo Card */}
                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                                Member Profile Photo
                            </h2>

                            <div className="flex flex-col items-center justify-center p-4 border border-dashed border-[#3a3a3a] rounded-xl bg-[#121212]">
                                {photoPreview ? (
                                    <div className="relative group">
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            className="w-32 h-32 rounded-full object-cover border-2 border-[#faff69]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData('photo', null);
                                                setPhotoPreview(null);
                                            }}
                                            className="mt-2 text-[11px] text-[#ef4444] hover:underline block text-center"
                                        >
                                            Remove photo
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                                        <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#888888] flex items-center justify-center mb-2">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-semibold text-white">Click to upload photo</span>
                                        <span className="text-[10px] text-[#5a5a5a] mt-1">JPEG, PNG, WEBP (Max 2MB)</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoChange}
                                        />
                                    </label>
                                )}
                            </div>
                            {errors.photo && <p className="mt-1 text-xs text-[#ef4444]">{errors.photo}</p>}
                        </Card>

                        {/* Status & Scope Card */}
                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                                Member Status
                            </h2>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-[#888888] mb-1.5">
                                        Initial Status
                                    </label>
                                    <select
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="w-full h-10 px-3 bg-[#1a1a1a] text-white text-sm rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                    >
                                        <option value="active">Active (Full access)</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                    {errors.status && <p className="mt-1 text-xs text-[#ef4444]">{errors.status}</p>}
                                </div>

                                <div className="p-3 rounded-lg bg-[#242424] border border-[#3a3a3a] text-xs">
                                    <div className="text-[10px] uppercase font-bold text-[#888888]">Assigned Tenant</div>
                                    <div className="font-semibold text-white mt-0.5">{currentGym?.name}</div>
                                    <div className="text-[11px] text-[#faff69] font-mono">{currentGym?.code}</div>
                                </div>
                            </div>
                        </Card>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full h-11 font-bold text-sm"
                                isLoading={processing}
                            >
                                <Save className="w-4 h-4" />
                                Complete Registration
                            </Button>

                            <Link href={route('admin.members.index')} className="block">
                                <Button type="button" variant="secondary" className="w-full">
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}