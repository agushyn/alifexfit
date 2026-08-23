import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    FileText,
    ArrowLeft,
    Edit2,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    User,
    CreditCard,
    Sparkles,
    Calendar,
    Building2,
    Phone,
    Mail,
    Activity
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { Membership } from '@/types';

interface MembershipShowProps {
    membership: Membership;
}

export default function MembershipShow({ membership }: MembershipShowProps) {
    const formatPrice = (val: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(val));
    };

    const getStatusBadge = (status: Membership['status']) => {
        switch (status) {
            case 'active':
                return (
                    <Badge variant="active" size="md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ACTIVE
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="yellow" size="md">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        PENDING
                    </Badge>
                );
            case 'expired':
                return (
                    <Badge variant="rose" size="md">
                        <Clock className="w-3.5 h-3.5" />
                        EXPIRED
                    </Badge>
                );
            case 'suspended':
                return (
                    <Badge variant="pill" size="md">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        SUSPENDED
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="rose" size="md">
                        <XCircle className="w-3.5 h-3.5" />
                        CANCELLED
                    </Badge>
                );
            default:
                return <Badge variant="pill" size="md">{status}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Subscriptions', href: route('admin.memberships.index') },
                { label: `Pass #${membership.id}` },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                                <FileText className="w-6 h-6 text-[#faff69]" />
                                Subscription Pass #{membership.id}
                            </h1>
                            {getStatusBadge(membership.status)}
                        </div>
                        <p className="text-xs text-[#888888] mt-1">
                            Membership subscription of <strong className="text-white">{membership.member?.full_name}</strong> ({membership.member?.member_number}).
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('admin.memberships.index')}>
                            <Button variant="secondary" size="sm">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Subscriptions
                            </Button>
                        </Link>
                        <Link href={route('admin.memberships.edit', membership.id)}>
                            <Button variant="primary" size="sm">
                                <Edit2 className="w-4 h-4" />
                                Edit Pass
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Pass #${membership.id} — ${membership.member?.full_name} — EXFITS`} />

            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Subscription Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Plan & Pricing Card */}
                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#faff69]" />
                                Plan Terms & Pricing (Snapshotted)
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Package Name</div>
                                    <div className="text-white font-bold text-base">{membership.membership_plan?.name}</div>
                                    <div className="text-[11px] text-[#888888] capitalize">
                                        {membership.membership_plan?.duration} {membership.membership_plan?.billing_period}
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Snapshotted Subscription Price</div>
                                    <div className="text-xl font-extrabold font-mono text-[#faff69]">
                                        {formatPrice(membership.price)}
                                    </div>
                                    <div className="text-[10px] text-[#888888]">Payment Status: <strong className="text-white uppercase">{membership.payment_status}</strong></div>
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Start Date</div>
                                    <div className="text-white font-bold text-sm font-mono flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-[#888888]" />
                                        {new Date(membership.start_date).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">End Date / Expiry</div>
                                    <div className="text-white font-bold text-sm font-mono flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-[#888888]" />
                                        {new Date(membership.end_date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Trainer Quota Progress Box */}
                            <div className="mt-4 p-4 rounded-xl bg-[#121212] border border-[#2a2a2a] flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-lg bg-[#1a1a1a] text-[#22c55e] border border-[#2a2a2a]">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white">Included Personal Trainer Quota</div>
                                        <div className="text-[11px] text-[#888888]">Session allowance attached to this subscription plan</div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-lg font-extrabold font-mono text-[#22c55e]">
                                        {membership.trainer_quota_total - membership.trainer_quota_used} / {membership.trainer_quota_total}
                                    </div>
                                    <div className="text-[10px] text-[#888888]">Sessions remaining</div>
                                </div>
                            </div>

                            {membership.notes && (
                                <div className="mt-4 p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] text-xs">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Subscription Notes</div>
                                    <p className="text-white mt-1 leading-relaxed">{membership.notes}</p>
                                </div>
                            )}
                        </Card>

                        {/* Recent Gate Visits for this Membership */}
                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#faff69]" />
                                Gate Visits Under This Pass ({membership.attendances?.length ?? 0})
                            </h2>

                            {membership.attendances && membership.attendances.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#121212] text-[#888888] uppercase tracking-wider font-semibold">
                                            <tr>
                                                <th className="px-4 py-2.5">Date</th>
                                                <th className="px-4 py-2.5">Check-In</th>
                                                <th className="px-4 py-2.5">Check-Out</th>
                                                <th className="px-4 py-2.5">Duration</th>
                                                <th className="px-4 py-2.5">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#2a2a2a]">
                                            {membership.attendances.map((att) => (
                                                <tr key={att.id} className="hover:bg-[#1a1a1a]">
                                                    <td className="px-4 py-3 font-mono text-white">
                                                        {new Date(att.check_in_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-[#cccccc]">
                                                        {new Date(att.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-[#888888]">
                                                        {att.check_out_at ? new Date(att.check_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono font-bold text-[#cccccc]">
                                                        {att.duration_formatted ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {att.status === 'in_gym' ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded border border-[#22c55e]/20">
                                                                IN GYM
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#888888]">
                                                                {att.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-xs text-[#888888] py-3 text-center">No attendance visits recorded under this subscription yet.</p>
                            )}
                        </Card>

                        {/* Recent Workout Sessions Under This Pass */}
                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
                                <Activity className="w-4 h-4 text-[#faff69]" />
                                Workout Sessions Under This Pass ({membership.training_sessions?.length ?? 0})
                            </h2>

                            {membership.training_sessions && membership.training_sessions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#121212] text-[#888888] uppercase tracking-wider font-semibold">
                                            <tr>
                                                <th className="px-4 py-2.5">Date</th>
                                                <th className="px-4 py-2.5">Discipline</th>
                                                <th className="px-4 py-2.5">Coach</th>
                                                <th className="px-4 py-2.5">Duration</th>
                                                <th className="px-4 py-2.5">Status</th>
                                                <th className="px-4 py-2.5">Quota</th>
                                                <th className="px-4 py-2.5 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#2a2a2a]">
                                            {membership.training_sessions.map((ws) => (
                                                <tr key={ws.id} className="hover:bg-[#1a1a1a]">
                                                    <td className="px-4 py-3 font-mono text-white">
                                                        {new Date(ws.started_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-white">
                                                        {ws.workout_type?.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-[#cccccc]">
                                                        {ws.trainer ? (
                                                            <span className="text-[#faff69] font-medium flex items-center gap-1">
                                                                <Sparkles className="w-3 h-3" />
                                                                {ws.trainer.name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[#5a5a5a] italic">Solo</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono font-bold text-[#faff69]">
                                                        {ws.duration_formatted}
                                                    </td>
                                                    <td className="px-4 py-3 capitalize text-[#888888]">
                                                        {ws.status}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {ws.trainer_quota_consumed_at ? (
                                                            <span className="text-[10px] font-bold text-[#22c55e] bg-[#22c55e]/10 px-1.5 py-0.5 rounded border border-[#22c55e]/20">
                                                                Deducted
                                                            </span>
                                                        ) : (
                                                            <span className="text-[#5a5a5a]">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Link href={route('admin.workout-sessions.show', ws.id)}>
                                                            <span className="text-xs text-[#faff69] hover:underline font-bold">Details →</span>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-xs text-[#888888] py-3 text-center">No workout sessions logged under this subscription pass yet.</p>
                            )}
                        </Card>
                    </div>

                    {/* Right 1 Col: Member Profile & Home Branch */}
                    <div className="space-y-6">
                        {/* Member Identity Card */}
                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
                                <User className="w-4 h-4 text-[#faff69]" />
                                Subscribing Member
                            </h2>

                            <div className="space-y-3 text-xs">
                                <div>
                                    <Link
                                        href={route('admin.members.show', membership.member_id)}
                                        className="text-base font-bold text-white hover:text-[#faff69] transition-colors"
                                    >
                                        {membership.member?.full_name}
                                    </Link>
                                    <div className="text-xs font-mono text-[#faff69] mt-0.5">
                                        {membership.member?.member_number}
                                    </div>
                                </div>

                                {membership.member?.phone && (
                                    <div className="flex items-center gap-2 text-xs text-[#cccccc]">
                                        <Phone className="w-3.5 h-3.5 text-[#888888]" />
                                        {membership.member.phone}
                                    </div>
                                )}

                                {membership.member?.email && (
                                    <div className="flex items-center gap-2 text-xs text-[#cccccc]">
                                        <Mail className="w-3.5 h-3.5 text-[#888888]" />
                                        {membership.member.email}
                                    </div>
                                )}

                                <div className="pt-2">
                                    <Link href={route('admin.members.show', membership.member_id)} className="block">
                                        <Button variant="secondary" size="sm" className="w-full">
                                            View Full Member Profile
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>

                        {/* Tenant Home Branch Card */}
                        <Card variant="elevated">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#faff69]" />
                                Home Branch
                            </h2>

                            <div className="space-y-1.5 text-xs">
                                <div className="font-bold text-white text-sm">{membership.gym?.name}</div>
                                <div className="text-[#888888] font-mono">Code: <strong className="text-white">{membership.gym?.code}</strong></div>
                                {membership.gym?.address && <div className="text-[#888888] text-[11px]">{membership.gym.address}</div>}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}