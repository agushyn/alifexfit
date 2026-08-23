import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    Users,
    Edit2,
    ArrowLeft,
    Phone,
    Mail,
    MapPin,
    Calendar,
    PhoneCall,
    Building2,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Clock,
    CreditCard,
    Sparkles,
    Activity,
    Plus,
    UserCheck,
    Flame,
    LogOut
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { Member } from '@/types';

interface MemberShowProps {
    member: Member;
}

export default function MemberShow({ member }: MemberShowProps) {
    const activeMembership = member.active_membership;
    const membershipsHistory = member.memberships || [];
    const activeAttendance = member.active_attendance;
    const attendancesHistory = member.attendances || [];
    const workoutSessionsHistory = member.training_sessions || [];

    const formatPrice = (val: number | string) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(Number(val));
    };

    const getStatusBadge = (status: Member['status']) => {
        switch (status) {
            case 'active':
                return (
                    <Badge variant="active" size="md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ACTIVE MEMBER
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge variant="inactive" size="md">
                        <XCircle className="w-3.5 h-3.5" />
                        INACTIVE
                    </Badge>
                );
            case 'suspended':
                return (
                    <Badge variant="yellow" size="md">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        SUSPENDED
                    </Badge>
                );
            case 'expired':
                return (
                    <Badge variant="rose" size="md">
                        <Clock className="w-3.5 h-3.5" />
                        EXPIRED
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
                { label: 'Members', href: route('admin.members.index') },
                { label: member.full_name },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {member.profile_photo_url ? (
                            <img
                                src={member.profile_photo_url}
                                alt={member.full_name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-[#faff69] shadow-xl"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-[#faff69] flex items-center justify-center font-bold text-2xl">
                                {member.first_name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                                    {member.full_name}
                                </h1>
                                {getStatusBadge(member.status)}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs">
                                <span className="font-mono font-bold text-[#faff69] bg-[#242424] px-2.5 py-0.5 rounded border border-[#3a3a3a]">
                                    {member.member_number}
                                </span>
                                <span className="text-[#888888] flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5 text-[#5a5a5a]" />
                                    {member.gym?.name} ({member.gym?.code})
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('admin.memberships.create', { member_id: member.id })}>
                            <Button variant="primary" size="sm">
                                <Plus className="w-4 h-4" />
                                Assign Membership
                            </Button>
                        </Link>
                        <Link href={route('admin.members.edit', member.id)}>
                            <Button variant="secondary" size="sm">
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`${member.full_name} (${member.member_number}) — EXFITS Gym`} />

            <div className="space-y-6">
                {/* Gate & Presence Live Status Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Gate Presence Card */}
                    {activeAttendance ? (
                        <Card variant="elevated" className="border-[#22c55e]/40 p-4 bg-gradient-to-r from-[#1a1a1a] to-[#121212] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 animate-pulse">
                                    <Flame className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#22c55e]">
                                            CURRENTLY IN GYM
                                        </span>
                                    </div>
                                    <div className="text-white font-bold text-sm mt-0.5">
                                        Checked in at {new Date(activeAttendance.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="text-[11px] text-[#888888]">
                                        Duration: <strong className="text-white font-mono">{activeAttendance.duration_formatted}</strong> ({activeAttendance.source.toUpperCase()})
                                    </div>
                                </div>
                            </div>

                            <Link href={route('admin.attendance.show', activeAttendance.id)}>
                                <Button variant="secondary" size="sm">
                                    View Visit
                                </Button>
                            </Link>
                        </Card>
                    ) : (
                        <Card variant="default" className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-[#1a1a1a] text-[#888888] border border-[#2a2a2a]">
                                    <UserCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#888888]">
                                        GATE PRESENCE
                                    </div>
                                    <div className="text-white font-semibold text-sm mt-0.5">
                                        Not Currently in Gym
                                    </div>
                                    <div className="text-[11px] text-[#888888]">
                                        {member.latest_attendance ? (
                                            <>Last visit: <span className="font-mono text-[#cccccc]">{new Date(member.latest_attendance.check_in_at).toLocaleDateString()}</span></>
                                        ) : (
                                            'No recorded gym visits yet'
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Link href={route('admin.attendance.kiosk')}>
                                <Button variant="secondary" size="sm">
                                    Open Kiosk
                                </Button>
                            </Link>
                        </Card>
                    )}

                    {/* Active Membership Hero Mini-Card */}
                    {activeMembership ? (
                        <Card variant="elevated" className="border-[#faff69]/40 p-4 bg-gradient-to-r from-[#1a1a1a] to-[#121212] flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#faff69] bg-[#faff69]/10 px-2 py-0.5 rounded border border-[#faff69]/20">
                                        ACTIVE PASS
                                    </span>
                                    <span className="text-[10px] font-bold uppercase text-[#22c55e]">
                                        {activeMembership.payment_status}
                                    </span>
                                </div>
                                <div className="text-base font-extrabold text-white">
                                    {activeMembership.membership_plan?.name}
                                </div>
                                <div className="text-[11px] text-[#888888] font-mono">
                                    {new Date(activeMembership.start_date).toLocaleDateString()} → {new Date(activeMembership.end_date).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-[10px] uppercase font-bold text-[#888888]">PT Quota</div>
                                <div className="text-sm font-extrabold font-mono text-[#22c55e]">
                                    {activeMembership.trainer_quota_total - activeMembership.trainer_quota_used} / {activeMembership.trainer_quota_total}
                                </div>
                            </div>
                        </Card>
                    ) : (
                        <Card variant="default" className="p-4 flex items-center justify-between border-dashed border-[#3a3a3a]">
                            <div>
                                <div className="text-xs font-bold text-white">No Active Membership</div>
                                <div className="text-[11px] text-[#888888]">Member has no valid access pass.</div>
                            </div>
                            <Link href={route('admin.memberships.create', { member_id: member.id })}>
                                <Button variant="primary" size="sm">
                                    + Assign Plan
                                </Button>
                            </Link>
                        </Card>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal & Contact Details */}
                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a]">
                                Personal & Contact Details
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Email Address</div>
                                    <div className="text-white font-medium text-sm flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-[#888888]" />
                                        {member.email ?? 'Not provided'}
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Phone Number</div>
                                    <div className="text-white font-medium text-sm flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-[#888888]" />
                                        {member.phone ?? 'Not provided'}
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Date of Birth & Gender</div>
                                    <div className="text-white font-medium text-sm flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-[#888888]" />
                                        {member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : 'N/A'} • <span className="capitalize">{member.gender ?? 'N/A'}</span>
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Registration Date</div>
                                    <div className="text-white font-medium text-sm font-mono flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 text-[#888888]" />
                                        {new Date(member.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] text-xs">
                                <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Residential Address</div>
                                <div className="text-white mt-1 flex items-start gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-[#5a5a5a] mt-0.5 flex-shrink-0" />
                                    <span>{member.address || 'No physical address on file.'}</span>
                                </div>
                            </div>
                        </Card>

                        {/* Recent Gate Visits Log */}
                        <Card variant="default">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2a2a2a]">
                                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-[#faff69]" />
                                    Recent Gate Attendance History ({attendancesHistory.length})
                                </h2>
                                <Link href={route('admin.attendance.index', { search: member.member_number })}>
                                    <span className="text-xs text-[#faff69] hover:underline font-bold">View All Visits →</span>
                                </Link>
                            </div>

                            {attendancesHistory.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#121212] text-[#888888] uppercase tracking-wider font-semibold">
                                            <tr>
                                                <th className="px-4 py-2.5">Date</th>
                                                <th className="px-4 py-2.5">Check-In</th>
                                                <th className="px-4 py-2.5">Check-Out</th>
                                                <th className="px-4 py-2.5">Duration</th>
                                                <th className="px-4 py-2.5">Source</th>
                                                <th className="px-4 py-2.5">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#2a2a2a]">
                                            {attendancesHistory.map((att) => (
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
                                                    <td className="px-4 py-3 font-mono text-[#cccccc] font-bold">
                                                        {att.duration_formatted ?? '—'}
                                                    </td>
                                                    <td className="px-4 py-3 uppercase text-[10px] font-bold text-[#888888]">
                                                        {att.source}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {att.status === 'in_gym' ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded border border-[#22c55e]/20 animate-pulse">
                                                                IN GYM
                                                            </span>
                                                        ) : att.status === 'checked_out' ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#888888]">
                                                                Checked Out
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#ef4444]">
                                                                Cancelled
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-xs text-[#888888] py-3 text-center">No attendance visits recorded for this member.</p>
                            )}
                        </Card>

                        {/* Recent Workout Sessions Log */}
                        <Card variant="default">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2a2a2a]">
                                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-[#faff69]" />
                                    Recent Workout Sessions ({workoutSessionsHistory.length})
                                </h2>
                                <Link href={route('admin.workout-sessions.index', { search: member.member_number })}>
                                    <span className="text-xs text-[#faff69] hover:underline font-bold">View All Sessions →</span>
                                </Link>
                            </div>

                            {workoutSessionsHistory.length > 0 ? (
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
                                            {workoutSessionsHistory.map((ws) => (
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
                                                    <td className="px-4 py-3">
                                                        {ws.status === 'in_progress' ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#faff69] bg-[#faff69]/10 px-2 py-0.5 rounded border border-[#faff69]/20 animate-pulse">
                                                                IN PROGRESS
                                                            </span>
                                                        ) : ws.status === 'completed' ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#22c55e]">
                                                                Completed
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#ef4444]">
                                                                Cancelled
                                                            </span>
                                                        )}
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
                                <p className="text-xs text-[#888888] py-3 text-center">No workout sessions recorded for this member.</p>
                            )}
                        </Card>

                        {/* Membership History Table */}
                        <Card variant="default">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2a2a2a]">
                                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-[#faff69]" />
                                    Subscription History ({membershipsHistory.length})
                                </h2>
                                <Link href={route('admin.memberships.create', { member_id: member.id })}>
                                    <span className="text-xs text-[#faff69] hover:underline font-bold">+ New Subscription</span>
                                </Link>
                            </div>

                            {membershipsHistory.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#121212] text-[#888888] uppercase tracking-wider font-semibold">
                                            <tr>
                                                <th className="px-4 py-2.5">Plan</th>
                                                <th className="px-4 py-2.5">Period</th>
                                                <th className="px-4 py-2.5">Status</th>
                                                <th className="px-4 py-2.5">Payment</th>
                                                <th className="px-4 py-2.5 text-right">Price</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#2a2a2a]">
                                            {membershipsHistory.map((m) => (
                                                <tr key={m.id} className="hover:bg-[#1a1a1a]">
                                                    <td className="px-4 py-3 font-semibold text-white">
                                                        {m.membership_plan?.name}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-[#cccccc]">
                                                        {new Date(m.start_date).toLocaleDateString()} → {new Date(m.end_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 capitalize text-[#888888]">
                                                        {m.status}
                                                    </td>
                                                    <td className="px-4 py-3 uppercase text-[10px] font-bold text-[#22c55e]">
                                                        {m.payment_status}
                                                    </td>
                                                    <td className="px-4 py-3 text-right font-mono font-bold text-[#faff69]">
                                                        {formatPrice(m.price)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-xs text-[#888888] py-3 text-center">No subscription history recorded.</p>
                            )}
                        </Card>
                    </div>

                    {/* Right 1 Col */}
                    <div className="space-y-6">
                        {/* Tenant Home Branch */}
                        <Card variant="elevated">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#faff69]" />
                                Home Branch
                            </h2>

                            <div className="space-y-2 text-xs">
                                <div className="font-bold text-white text-sm">{member.gym?.name}</div>
                                <div className="text-[#888888] font-mono">Code: <strong className="text-white">{member.gym?.code}</strong></div>
                                {member.gym?.address && <div className="text-[#888888] text-[11px]">{member.gym.address}</div>}
                            </div>
                        </Card>

                        {/* Emergency Contact */}
                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
                                <PhoneCall className="w-4 h-4 text-[#22c55e]" />
                                Emergency Contact
                            </h2>

                            {member.emergency_contact?.name || member.emergency_contact?.phone ? (
                                <div className="space-y-2 text-xs">
                                    <div className="p-2.5 rounded-lg bg-[#121212] border border-[#2a2a2a]">
                                        <div className="text-[#888888] text-[10px] font-bold uppercase">Name</div>
                                        <div className="text-white font-bold text-xs mt-0.5">{member.emergency_contact.name || 'N/A'}</div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-[#121212] border border-[#2a2a2a]">
                                        <div className="text-[#888888] text-[10px] font-bold uppercase">Phone</div>
                                        <div className="text-white font-mono text-xs mt-0.5">{member.emergency_contact.phone || 'N/A'}</div>
                                    </div>
                                    <div className="p-2.5 rounded-lg bg-[#121212] border border-[#2a2a2a]">
                                        <div className="text-[#888888] text-[10px] font-bold uppercase">Relationship</div>
                                        <div className="text-white text-xs mt-0.5">{member.emergency_contact.relationship || 'N/A'}</div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-xs text-[#888888] py-2">No emergency contact configured.</p>
                            )}
                        </Card>

                        {/* Personal Trainer Quota Card */}
                        <Card variant="default">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-white mb-3 pb-2 border-b border-[#2a2a2a] flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#faff69]" />
                                    Trainer Quota
                                </span>
                                {activeMembership && (
                                    <span className="font-mono text-xs text-[#22c55e] font-bold">
                                        {activeMembership.trainer_quota_total - activeMembership.trainer_quota_used} Left
                                    </span>
                                )}
                            </h2>

                            {activeMembership ? (
                                <div className="space-y-3 text-xs">
                                    <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-[#888888]">Plan Allowance</span>
                                            <span className="font-bold text-white font-mono">{activeMembership.trainer_quota_total} sessions</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-[#888888]">Consumed / Used</span>
                                            <span className="font-bold text-[#faff69] font-mono">{activeMembership.trainer_quota_used} sessions</span>
                                        </div>
                                        <div className="pt-2 border-t border-[#242424] flex items-center justify-between text-xs">
                                            <span className="text-white font-bold">Remaining Balance</span>
                                            <span className="font-extrabold text-[#22c55e] font-mono text-sm">
                                                {activeMembership.trainer_quota_total - activeMembership.trainer_quota_used}
                                            </span>
                                        </div>
                                    </div>

                                    <Link href={route('admin.trainers.index')} className="block">
                                        <Button variant="secondary" size="sm" className="w-full">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            View Available Coaches
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <p className="text-xs text-[#888888] py-2">
                                    No active membership pass. Assign a membership to enable personal trainer quota.
                                </p>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}