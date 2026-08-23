import React, { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { CreditCard, Save, ArrowLeft, Sparkles } from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';

export default function PlanCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        price: '',
        billing_period: 'monthly',
        duration: 1,
        joining_fee: 0,
        trainer_quota: 0,
        benefits: ['Full Gym Access', 'Locker Room & Shower'],
        status: 'active',
        featured: false,
        sort_order: 0,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.membership-plans.store'));
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Membership Plans', href: route('admin.membership-plans.index') },
                { label: 'Create Plan' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <CreditCard className="w-6 h-6 text-[#faff69]" />
                            Create Membership Plan
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Define package durations, authoritative pricing, trainer session quotas, and benefits.
                        </p>
                    </div>

                    <Link href={route('admin.membership-plans.index')}>
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Plans
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Create Membership Plan — EXFITS Gym" />

            <form onSubmit={submit} className="max-w-3xl space-y-6">
                <Card variant="default">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a]">
                        Plan Details & Pricing
                    </h2>

                    <div className="space-y-4">
                        <TextInput
                            label="Plan Name *"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            placeholder="e.g. Premium Monthly, Annual VIP"
                            required
                        />

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                Description
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 bg-[#1a1a1a] text-white placeholder-[#5a5a5a] text-sm rounded-lg border border-[#2a2a2a] focus:outline-none focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                placeholder="Short description of this membership package..."
                            />
                            {errors.description && <p className="mt-1 text-xs text-[#ef4444]">{errors.description}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TextInput
                                label="Authoritative Price (IDR) *"
                                type="number"
                                value={data.price}
                                onChange={(e) => setData('price', e.target.value)}
                                error={errors.price}
                                placeholder="e.g. 500000"
                                required
                            />

                            <TextInput
                                label="One-Time Joining Fee (IDR)"
                                type="number"
                                value={data.joining_fee}
                                onChange={(e) => setData('joining_fee', Number(e.target.value))}
                                error={errors.joining_fee}
                                placeholder="0"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                    Billing Period *
                                </label>
                                <select
                                    value={data.billing_period}
                                    onChange={(e) => setData('billing_period', e.target.value)}
                                    className="w-full h-10 px-3 bg-[#1a1a1a] text-white text-sm rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                >
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly (3 Months Multiplier)</option>
                                    <option value="yearly">Yearly</option>
                                    <option value="custom">Custom (Days)</option>
                                </select>
                            </div>

                            <TextInput
                                label="Duration Count *"
                                type="number"
                                value={data.duration}
                                onChange={(e) => setData('duration', Number(e.target.value))}
                                error={errors.duration}
                                min={1}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TextInput
                                label="Included Personal Trainer Quota"
                                type="number"
                                value={data.trainer_quota}
                                onChange={(e) => setData('trainer_quota', Number(e.target.value))}
                                error={errors.trainer_quota}
                                min={0}
                                placeholder="e.g. 4 (sessions included)"
                            />

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                    Plan Status *
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full h-10 px-3 bg-[#1a1a1a] text-white text-sm rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                >
                                    <option value="active">Active (Available for subscriptions)</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="featured"
                                checked={data.featured}
                                onChange={(e) => setData('featured', e.target.checked)}
                                className="w-4 h-4 rounded bg-[#1a1a1a] border-[#2a2a2a] text-[#faff69] focus:ring-0"
                            />
                            <label htmlFor="featured" className="text-xs text-white cursor-pointer font-medium">
                                Highlight as Featured Plan in Member Portal & Website
                            </label>
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end gap-3">
                    <Link href={route('admin.membership-plans.index')}>
                        <Button type="button" variant="secondary">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" variant="primary" isLoading={processing}>
                        <Save className="w-4 h-4" />
                        Save Plan
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}