import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    UserCheck,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    CreditCard,
    Calendar,
    Building2,
    LogOut,
    AlertTriangle,
    Trash2,
    Activity,
    Eye
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { Modal } from '@/Components/Modal';
import { Attendance } from '@/types';

interface AttendanceShowProps {
    attendance: Attendance;
}

export default function AttendanceShow({ attendance }: AttendanceShowProps) {
    const [isCancelling, setIsCancelling] = useState<boolean>(false);
    const [cancelReason, setCancelReason] = useState<string>('');
    const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false);

    const handleCheckout = () => {
        setIsCheckingOut(true);
        router.post(
            route('admin.attendance.checkout', attendance.id),
            { notes: 'Manual checkout from detail view' },
            {
                onFinish: () => setIsCheckingOut(false),
            }
        );
    };

    const handleCancel = () => {
        router.post(
            route('admin.attendance.cancel', attendance.id),
            { reason: cancelReason },
            {
                onFinish: () => {
                    setIsCancelling(false);
                    setCancelReason('');
                },
            }
        );
    };

    const getStatusBadge = (attStatus: Attendance['status']) => {
        switch (attStatus) {
            case 'in_gym':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                        IN GYM (ACTIVE VISIT)
                    </span>
                );
            case 'checked_out':
                return (
                    <Badge variant="pill" size="md">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#888888]" />
                        CHECKED OUT
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="rose" size="md">
                        <XCircle className="w-3.5 h-3.5" />
                        VISIT CANCELLED
                    </Badge>
                );
            default:
                return <Badge variant="pill" size="md">{attStatus}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Attendance & Gate', href: route('admin.attendance.index') },
                { label: `Visit #${attendance.id}` },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                                <UserCheck className="w-6 h-6 text-[#faff69]" />
                                Visit Record #{attendance.id}
                            </h1>
                            {getStatusBadge(attendance.status)}
                        </div>
                        <p className="text-xs text-[#888888] mt-1">
                            Attendance log for <strong className="text-white">{attendance.member?.full_name}</strong> at <strong className="text-white">{attendance.gym?.name}</strong>.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('admin.attendance.index')}>
                            <Button variant="secondary" size="sm">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Log
                            </Button>
                        </Link>

                        {attendance.status === 'in_gym' && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleCheckout}
                                isLoading={isCheckingOut}
                            >
                                <LogOut className="w-4 h-4" />
                                Check Out Member
                            </Button>
                        )}

                        {attendance.status !== 'cancelled' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#ef4444] hover:bg-[#ef4444]/15"
                                onClick={() => setIsCancelling(true)}
                            >
                                <Trash2 className="w-4 h-4" />
                                Cancel Record
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Visit #${attendance.id} — EXFITS Gym`} />

            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Visit Log Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#faff69]" />
                                Gate Timestamps & Duration
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Check-In Timestamp</div>
                                    <div className="text-white font-bold text-base font-mono">
                                        {new Date(attendance.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                    <div className="text-[11px] text-[#888888]">{new Date(attendance.check_in_at).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Check-Out Timestamp</div>
                                    {attendance.check_out_at ? (
                                        <>
                                            <div className="text-white font-bold text-base font-mono">
                                                {new Date(attendance.check_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </div>
                                            <div className="text-[11px] text-[#888888]">{new Date(attendance.check_out_at).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                        </>
                                    ) : (
                                        <div className="text-[#22c55e] font-bold text-sm italic py-2">
                                            Currently active inside gym
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Total Duration</div>
                                    <div className="text-xl font-extrabold font-mono text-[#faff69]">
                                        {attendance.duration_formatted ?? '—'}
                                    </div>
                                    <div className="text-[10px] text-[#888888]">{attendance.duration_in_minutes ?? 0} total minutes</div>
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Gate Source & Device</div>
                                    <div className="text-white font-bold uppercase text-sm">{attendance.source}</div>
                                    <div className="text-[11px] text-[#888888] font-mono">{attendance.device_identifier || 'Main Turnstile'}</div>
                                </div>
                            </div>

                            {attendance.notes && (
                                <div className="mt-4 p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] text-xs">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Audit Remarks / Notes</div>
                                    <p className="text-white mt-1 leading-relaxed">{attendance.notes}</p>
                                </div>
                            )}
                        </Card>

                        {/* Workout Sessions Logged During This Visit */}
                        <Card variant="default">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2a2a2a]">
                                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-[#faff69]" />
                                    Workout Sessions Performed ({attendance.training_sessions?.length ?? 0})
                                </h2>
                                <Link href={route('admin.workout-sessions.index', { search: attendance.member?.member_number })}>
                                    <span className="text-xs text-[#faff69] hover:underline font-bold">All Sessions →</span>
                                </Link>
                            </div>

                            {attendance.training_sessions && attendance.training_sessions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#121212] text-[#888888] uppercase tracking-wider font-semibold">
                                            <tr>
                                                <th className="px-4 py-2.5">Discipline</th>
                                                <th className="px-4 py-2.5">Category</th>
                                                <th className="px-4 py-2.5">Started</th>
                                                <th className="px-4 py-2.5">Completed</th>
                                                <th className="px-4 py-2.5">Duration</th>
                                                <th className="px-4 py-2.5">Status</th>
                                                <th className="px-4 py-2.5 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#2a2a2a]">
                                            {attendance.training_sessions.map((ws) => (
                                                <tr key={ws.id} className="hover:bg-[#1a1a1a]">
                                                    <td className="px-4 py-3 font-bold text-white">
                                                        {ws.workout_type?.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-[10px] font-bold text-[#888888] uppercase">
                                                        {ws.workout_type?.category || 'General'}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-[#cccccc]">
                                                        {new Date(ws.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-[#888888]">
                                                        {ws.completed_at ? new Date(ws.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Running...'}
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
                                                    <td className="px-4 py-3 text-right">
                                                        <Link href={route('admin.workout-sessions.show', ws.id)}>
                                                            <Button variant="ghost" size="sm">
                                                                <Eye className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-xs text-[#888888] py-3 text-center">No workout sessions logged during this gate visit yet.</p>
                            )}
                        </Card>

                        {/* Membership Reference Card */}
                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-[#faff69]" />
                                Membership Plan Attached
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a]">
                                    <div className="text-[#888888] text-[10px] font-bold uppercase">Plan</div>
                                    <div className="text-white font-bold text-sm mt-1">{attendance.membership?.membership_plan?.name}</div>
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a]">
                                    <div className="text-[#888888] text-[10px] font-bold uppercase">Validity Period</div>
                                    <div className="text-white font-mono text-xs mt-1">
                                        {attendance.membership?.start_date ? new Date(attendance.membership.start_date).toLocaleDateString() : ''} → {attendance.membership?.end_date ? new Date(attendance.membership.end_date).toLocaleDateString() : ''}
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a]">
                                    <div className="text-[#888888] text-[10px] font-bold uppercase">Trainer Quota</div>
                                    <div className="text-[#22c55e] font-bold font-mono text-sm mt-1">
                                        {((attendance.membership?.trainer_quota_total ?? 0) - (attendance.membership?.trainer_quota_used ?? 0))} Sessions Left
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right 1 Col: Member Identity & Branch */}
                    <div className="space-y-6">
                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
                                <User className="w-4 h-4 text-[#faff69]" />
                                Member Profile
                            </h2>

                            <div className="space-y-3 text-xs">
                                <div className="flex items-center gap-3">
                                    {attendance.member?.profile_photo_url ? (
                                        <img
                                            src={attendance.member.profile_photo_url}
                                            alt={attendance.member.full_name}
                                            className="w-12 h-12 rounded-full object-cover border border-[#3a3a3a]"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-[#242424] text-[#faff69] font-bold text-base flex items-center justify-center border border-[#3a3a3a]">
                                            {attendance.member?.first_name?.charAt(0) ?? 'M'}
                                        </div>
                                    )}

                                    <div>
                                        <Link
                                            href={route('admin.members.show', attendance.member_id)}
                                            className="text-base font-bold text-white hover:text-[#faff69] transition-colors"
                                        >
                                            {attendance.member?.full_name}
                                        </Link>
                                        <div className="text-xs font-mono text-[#faff69]">
                                            {attendance.member?.member_number}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Link href={route('admin.members.show', attendance.member_id)} className="block">
                                        <Button variant="secondary" size="sm" className="w-full">
                                            View Full Member Profile
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>

                        <Card variant="elevated">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#faff69]" />
                                Gate Branch Location
                            </h2>

                            <div className="space-y-1.5 text-xs">
                                <div className="font-bold text-white text-sm">{attendance.gym?.name}</div>
                                <div className="text-[#888888] font-mono">Code: <strong className="text-white">{attendance.gym?.code}</strong></div>
                                {attendance.gym?.address && <div className="text-[#888888] text-[11px]">{attendance.gym.address}</div>}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Cancellation Modal */}
            <Modal
                isOpen={isCancelling}
                onClose={() => setIsCancelling(false)}
                title="Cancel Attendance Record"
                description="Marks this visit as cancelled and records staff reason for auditing."
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                            Reason for Cancellation *
                        </label>
                        <textarea
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            rows={3}
                            placeholder="e.g. Accidental kiosk double scan, system test..."
                            className="w-full px-3 py-2 bg-[#1a1a1a] text-white placeholder-[#5a5a5a] text-sm rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
                        <Button variant="secondary" size="sm" onClick={() => setIsCancelling(false)}>
                            Keep Record
                        </Button>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={handleCancel}
                            disabled={!cancelReason.trim()}
                        >
                            Confirm Cancellation
                        </Button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}