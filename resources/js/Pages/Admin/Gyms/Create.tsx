import React, { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, Save, ArrowLeft } from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';

export default function GymCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
        code: '',
        phone: '',
        email: '',
        address: '',
        timezone: 'Asia/Jakarta',
        status: 'active',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.gyms.store'));
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Gyms', href: route('admin.gyms.index') },
                { label: 'Create New Branch' },
            ]}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <Building2 className="w-6 h-6 text-[#faff69]" />
                            Create Gym Branch
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">Register a new gym branch as an isolated tenant entity.</p>
                    </div>

                    <Link href={route('admin.gyms.index')}>
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Gyms
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Create Gym — EXFITS Gym" />

            <div className="max-w-3xl">
                <Card variant="default">
                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TextInput
                                label="Gym Branch Name *"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                error={errors.name}
                                placeholder="e.g. Exfits West Branch"
                                required
                            />

                            <TextInput
                                label="Gym Code (Unique) *"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                error={errors.code}
                                placeholder="e.g. EXF-JKT-03"
                                helperText="Leave empty to auto-generate"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TextInput
                                label="Slug (URL identifier)"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                error={errors.slug}
                                placeholder="e.g. exfits-west-branch"
                                helperText="Leave empty to auto-generate from name"
                            />

                            <TextInput
                                label="Timezone *"
                                value={data.timezone}
                                onChange={(e) => setData('timezone', e.target.value)}
                                error={errors.timezone}
                                placeholder="Asia/Jakarta"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TextInput
                                label="Contact Phone"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                error={errors.phone}
                                placeholder="+62 21 ..."
                            />

                            <TextInput
                                label="Official Email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                error={errors.email}
                                placeholder="branch@exfits.com"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                Physical Address
                            </label>
                            <textarea
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 bg-[#1a1a1a] text-white placeholder-[#5a5a5a] text-sm rounded-lg border border-[#2a2a2a] focus:outline-none focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                placeholder="Enter complete gym street address..."
                            />
                            {errors.address && <p className="mt-1 text-xs text-[#ef4444]">{errors.address}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                Operational Status *
                            </label>
                            <select
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                                className="w-full h-10 px-3 bg-[#1a1a1a] text-white text-sm rounded-lg border border-[#2a2a2a] focus:outline-none focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            >
                                <option value="active">Active (Operational & Open)</option>
                                <option value="inactive">Inactive (Suspended / Closed)</option>
                            </select>
                            {errors.status && <p className="mt-1 text-xs text-[#ef4444]">{errors.status}</p>}
                        </div>

                        <div className="pt-4 border-t border-[#2a2a2a] flex justify-end gap-3">
                            <Link href={route('admin.gyms.index')}>
                                <Button variant="secondary" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button variant="primary" type="submit" isLoading={processing}>
                                <Save className="w-4 h-4" />
                                Save & Create Gym
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}