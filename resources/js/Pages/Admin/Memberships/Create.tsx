import React, { FormEventHandler, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { FileText, Save, ArrowLeft, User, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Badge } from '@/Components/Badge';
import { Member, MembershipPlan } from '@/types';

interface MembershipCreateProps {
    members: Member[];
    plans: MembershipPlan[];
    preselectedMemberId: number | null;
}

export default function MembershipCreate({
    members,
    plans,
    preselectedMemberId,
}: MembershipCreateProps) {
    const today = new Date().toISOString().substring(0, 10);

    const { data, setData, post, processing, errors } = useForm({
        member_id: preselectedMemberId ? String(preselectedMemberId) : (members[0]?.id ? String(members[0].id) : ''),
        membership_plan_id: plans[0]?.id ? String(plans[0].id) : '',
        start_date: today,
        end_date: '',
        status: 'active',
        payment_status: 'paid',
        notes: '',
    });

    const selectedPlan = plans.find((p) => String(p.id) === String(data.membership_plan_id));
    const selectedMember = members.find((m) => String(m.id) === String(data.member_id));

    const formatPrice = (val: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(val));
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.memberships.store'));
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Subscriptions', href: route('admin.memberships.index') },
                { label: 'New Subscription' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <FileText className="w-6 h-6 text-[#faff69]" />
                            Assign Member Subscription
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Link a member to a gym membership plan with authoritative price and trainer quota snapshots.
                        </p>
                    </div>

                    <Link href={route('admin.memberships.index')}>
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Subscriptions
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Assign Subscription — EXFITS Gym" />

            <form onSubmit={submit} className="max-w-4xl space-y-6">
                {errors.member_id && (
                    <div className="p-4 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/30 text-xs text-[#ef4444] flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{errors.member_id}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card variant="default">
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
                                <User className="w-4 h-4 text-[#faff69]" />
                                Subscription Assignment
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                        Select Member *
                                    </label>
                                    <select
                                        value={data.member_id}
                                        onChange={(e) => setData('member_id', e.target.value)}
                                        className="w-full h-11 px-3 bg-[#1a1a1a] text-white text-sm rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                        required
                                    >
                                        <option value="">-- Choose Member --</option>
                                        {members.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.full_name} ({m.member_number}) {m.email ? `— ${m.email}` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                        Membership Plan *
                                    </label>
                                    <select
                                        value={data.membership_plan_id}
                                        onChange={(e) => setData('membership_plan_id', e.target.value)}
                                        className="w-full h-11 px-3 bg-[#1a1a1a] text-white text-sm rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                        required
                                    >
                                        <option value="">-- Choose Plan --</option>
                                        {plans.map((p) => (
                                            <option key={p.id} value={p.id}>
                                                {p.name} — {formatPrice(p.price)} ({p.duration} {p.billing_period})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.membership_plan_id && (
                                        <p className="mt-1 text-xs text-[#ef4444]">{errors.membership_plan_id}</p>
                                    )}
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

                                    <div>
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                            Payment Status *
                                        </label>
                                        <select
                                            value={data.payment_status}
                                            onChange={(e) => setData('payment_status', e.target.value)}
                                            className="w-full h-10 px-3 bg-[#1a1a1a] text-white text-sm rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                        >
                                            <option value="paid">Paid</option>
                                            <option value="pending">Pending Payment</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                        Subscription Notes / Internal Comments
                                    </label>
                                    <textarea
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 bg-[#1a1a1a] text-white placeholder-[#5a5a5a] text-sm rounded-lg border border-[#2a2a2a] focus:outline-none focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                        placeholder="Optional subscription remarks or reference..."
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right 1 Col: Live Summary Receipt Card */}
                    <div className="space-y-6">
                        <Card variant="elevated" className="border-[#faff69]/30">
                            <h2 className="text-xs font-bold text-[#faff69] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                <CreditCard className="w-4 h-4" />
                                Authoritative Plan Terms
                            </h2>

                            {selectedPlan ? (
                                <div className="space-y-3 text-xs">
                                    <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a]">
                                        <div className="text-[10px] text-[#888888] uppercase font-bold">Plan Name</div>
                                        <div className="text-base font-extrabold text-white mt-0.5">{selectedPlan.name}</div>
                                        <div className="text-[11px] text-[#888888] capitalize">{selectedPlan.duration} {selectedPlan.billing_period} Validity</div>
                                    </div>

                                    <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a]">
                                        <div className="text-[10px] text-[#888888] uppercase font-bold">Authoritative Price</div>
                                        <div className="text-xl font-extrabold font-mono text-[#faff69] mt-0.5">
                                            {formatPrice(selectedPlan.price)}
                                        </div>
                                        <div className="text-[10px] text-[#888888]">Snapshotted at creation time</div>
                                    </div>

                                    <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] text-[#888888] uppercase font-bold">Personal Trainer Quota</div>
                                            <div className="text-sm font-bold text-white mt-0.5">{selectedPlan.trainer_quota} Sessions</div>
                                        </div>
                                        <Sparkles className="w-5 h-5 text-[#22c55e]" />
                                    </div>

                                    {selectedMember && (
                                        <div className="p-3 rounded-lg bg-[#242424] border border-[#3a3a3a]">
                                            <div className="text-[10px] text-[#888888] uppercase font-bold">Subscribing Member</div>
                                            <div className="font-bold text-white mt-0.5">{selectedMember.full_name}</div>
                                            <div className="text-xs font-mono text-[#faff69]">{selectedMember.member_number}</div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-[#888888] py-4 text-center">Select a plan to preview authoritative terms.</p>
                            )}
                        </Card>

                        <div className="space-y-2">
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full h-11 font-bold text-sm"
                                isLoading={processing}
                            >
                                <Save className="w-4 h-4" />
                                Confirm & Create Subscription
                            </Button>

                            <Link href={route('admin.memberships.index')} className="block">
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