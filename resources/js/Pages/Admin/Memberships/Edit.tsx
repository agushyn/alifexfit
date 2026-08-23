import React, { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { FileText, Save, ArrowLeft, Lock } from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Badge } from '@/Components/Badge';
import { Membership } from '@/types';

interface MembershipEditProps {
    membership: Membership;
}

export default function MembershipEdit({ membership }: MembershipEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        start_date: membership.start_date ? membership.start_date.substring(0, 10) : '',
        end_date: membership.end_date ? membership.end_date.substring(0, 10) : '',
        status: membership.status,
        payment_status: membership.payment_status,
        notes: membership.notes || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('admin.memberships.update', membership.id));
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Subscriptions', href: route('admin.memberships.index') },
                { label: `Subscription #${membership.id}`, href: route('admin.memberships.show', membership.id) },
                { label: 'Edit' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <FileText className="w-6 h-6 text-[#faff69]" />
                            Edit Subscription Status: #{membership.id}
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Modify subscription validity period, status, payment records, and administrative remarks.
                        </p>
                    </div>

                    <Link href={route('admin.memberships.show', membership.id)}>
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Details
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title={`Edit Subscription #${membership.id} — EXFITS Gym`} />

            <form onSubmit={submit} className="max-w-3xl space-y-6">
                {/* Locked Snapshot Info Bar */}
                <div className="p-4 rounded-xl bg-[#121212] border border-[#2a2a2a] flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="text-xs text-[#888888]">Subscribed Member & Plan</div>
                        <div className="text-sm font-bold text-white">
                            {membership.member?.full_name} (<span className="text-[#faff69] font-mono">{membership.member?.member_number}</span>) • {membership.membership_plan?.name}
                        </div>
                    </div>
                    <Badge variant="pill" size="sm">
                        LOCKED RELATIONS
                    </Badge>
                </div>

                <Card variant="default">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a]">
                        Subscription Status & Dates
                    </h2>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                    Subscription Status *
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value as any)}
                                    className="w-full h-10 px-3 bg-[#1a1a1a] text-white text-sm rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                >
                                    <option value="active">Active</option>
                                    <option value="pending">Pending Activation</option>
                                    <option value="expired">Expired</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                    Payment Status *
                                </label>
                                <select
                                    value={data.payment_status}
                                    onChange={(e) => setData('payment_status', e.target.value as any)}
                                    className="w-full h-10 px-3 bg-[#1a1a1a] text-white text-sm rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                >
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <TextInput
                                label="Start Date *"
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                error={errors.start_date}
                                required
                            />

                            <TextInput
                                label="End Date / Expiry *"
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                error={errors.end_date}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                Subscription Remarks / Notes
                            </label>
                            <textarea
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 bg-[#1a1a1a] text-white placeholder-[#5a5a5a] text-sm rounded-lg border border-[#2a2a2a] focus:outline-none focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                placeholder="Administrative comments..."
                            />
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end gap-3">
                    <Link href={route('admin.memberships.show', membership.id)}>
                        <Button type="button" variant="secondary">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" variant="primary" isLoading={processing}>
                        <Save className="w-4 h-4" />
                        Save Subscription Changes
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}