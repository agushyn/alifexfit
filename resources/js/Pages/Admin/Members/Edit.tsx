import React, { FormEventHandler, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Edit3,
    Save,
    ArrowLeft,
    Upload,
    Lock,
    PhoneCall,
    User
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Badge } from '@/Components/Badge';
import { Member } from '@/types';

interface MemberEditProps {
    member: Member;
}

export default function MemberEdit({ member }: MemberEditProps) {
    const [photoPreview, setPhotoPreview] = useState<string | null>(member.profile_photo_url || null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [form, setForm] = useState({
        first_name: member.first_name || '',
        last_name: member.last_name || '',
        email: member.email || '',
        phone: member.phone || '',
        date_of_birth: member.date_of_birth ? member.date_of_birth.substring(0, 10) : '',
        gender: member.gender || 'male',
        address: member.address || '',
        emergency_contact: {
            name: member.emergency_contact?.name || '',
            phone: member.emergency_contact?.phone || '',
            relationship: member.emergency_contact?.relationship || '',
        },
        status: member.status || 'active',
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('first_name', form.first_name);
        formData.append('last_name', form.last_name);
        formData.append('email', form.email);
        formData.append('phone', form.phone);
        formData.append('date_of_birth', form.date_of_birth);
        formData.append('gender', form.gender);
        formData.append('address', form.address);
        formData.append('status', form.status);

        formData.append('emergency_contact[name]', form.emergency_contact.name);
        formData.append('emergency_contact[phone]', form.emergency_contact.phone);
        formData.append('emergency_contact[relationship]', form.emergency_contact.relationship);

        if (photoFile) {
            formData.append('photo', photoFile);
        }

        router.post(route('admin.members.update', member.id), formData, {
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Members', href: route('admin.members.index') },
                { label: member.full_name, href: route('admin.members.show', member.id) },
                { label: 'Edit Profile' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <Edit3 className="w-6 h-6 text-[#faff69]" />
                            Edit Member: {member.full_name}
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Modify member personal records, emergency contacts, and account status.
                        </p>
                    </div>

                    <Link href={route('admin.members.show', member.id)}>
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Profile
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title={`Edit ${member.full_name} — EXFITS Gym`} />

            <form onSubmit={submit} className="max-w-4xl space-y-6">
                <div className="p-4 rounded-xl bg-[#121212] border border-[#2a2a2a] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#242424] text-[#888888] border border-[#3a3a3a]">
                            <Lock className="w-4 h-4 text-[#faff69]" />
                        </div>
                        <div>
                            <div className="text-xs text-[#888888]">Assigned Member Number (Read-Only)</div>
                            <div className="text-sm font-bold font-mono text-[#faff69]">{member.member_number}</div>
                        </div>
                    </div>

                    <Badge variant="pill" size="sm">
                        LOCKED BY SYSTEM
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <Card variant="default">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-[#2a2a2a]">
                                <User className="w-4 h-4 text-[#faff69]" />
                                Personal Information
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <TextInput
                                        label="First Name *"
                                        value={form.first_name}
                                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                        error={errors.first_name}
                                        required
                                    />

                                    <TextInput
                                        label="Last Name"
                                        value={form.last_name}
                                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                        error={errors.last_name}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <TextInput
                                        label="Email Address"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        error={errors.email}
                                    />

                                    <TextInput
                                        label="Phone / WhatsApp"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        error={errors.phone}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <TextInput
                                        label="Date of Birth"
                                        type="date"
                                        value={form.date_of_birth}
                                        onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                                        error={errors.date_of_birth}
                                    />

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                            Gender
                                        </label>
                                        <select
                                            value={form.gender}
                                            onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                            className="w-full h-10 px-3 bg-[#1a1a1a] text-white text-sm rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                        Residential Address
                                    </label>
                                    <textarea
                                        value={form.address}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        rows={2}
                                        className="w-full px-3 py-2 bg-[#1a1a1a] text-white placeholder-[#5a5a5a] text-sm rounded-lg border border-[#2a2a2a] focus:outline-none focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                    />
                                    {errors.address && <p className="mt-1 text-xs text-[#ef4444]">{errors.address}</p>}
                                </div>
                            </div>
                        </Card>

                        <Card variant="default">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-4 pb-2 border-b border-[#2a2a2a]">
                                <PhoneCall className="w-4 h-4 text-[#22c55e]" />
                                Emergency Contact Information
                            </h2>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <TextInput
                                        label="Contact Name"
                                        value={form.emergency_contact.name}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                emergency_contact: {
                                                    ...form.emergency_contact,
                                                    name: e.target.value,
                                                },
                                            })
                                        }
                                    />

                                    <TextInput
                                        label="Emergency Phone"
                                        value={form.emergency_contact.phone}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                emergency_contact: {
                                                    ...form.emergency_contact,
                                                    phone: e.target.value,
                                                },
                                            })
                                        }
                                    />

                                    <TextInput
                                        label="Relationship"
                                        value={form.emergency_contact.relationship}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                emergency_contact: {
                                                    ...form.emergency_contact,
                                                    relationship: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                                Profile Photo
                            </h2>

                            <div className="flex flex-col items-center justify-center p-4 border border-dashed border-[#3a3a3a] rounded-xl bg-[#121212]">
                                {photoPreview ? (
                                    <div className="text-center">
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            className="w-32 h-32 rounded-full object-cover border-2 border-[#faff69] mx-auto"
                                        />
                                        <label className="mt-2 text-xs text-[#faff69] hover:underline cursor-pointer block">
                                            Change photo
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handlePhotoChange}
                                            />
                                        </label>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                                        <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#888888] flex items-center justify-center mb-2">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-semibold text-white">Click to upload photo</span>
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

                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
                                Member Status
                            </h2>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-[#888888] mb-1.5">
                                        Account Status
                                    </label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                                        className="w-full h-10 px-3 bg-[#1a1a1a] text-white text-sm rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="suspended">Suspended</option>
                                        <option value="expired">Expired</option>
                                    </select>
                                    {errors.status && <p className="mt-1 text-xs text-[#ef4444]">{errors.status}</p>}
                                </div>
                            </div>
                        </Card>

                        <div className="space-y-2">
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full h-11 font-bold text-sm"
                                isLoading={processing}
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </Button>

                            <Link href={route('admin.members.show', member.id)} className="block">
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