import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    CreditCard,
    Calendar,
    Building2,
    Flame,
    Trash2,
    UserCheck,
    Sparkles
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { Modal } from '@/Components/Modal';
import { TrainingSession } from '@/types';

interface WorkoutSessionsShowProps {
    session: TrainingSession;
}

export default function WorkoutSessionsShow({ session }: WorkoutSessionsShowProps) {
    const [isCancelling, setIsCancelling] = useState<boolean>(false);
    const [cancelReason, setCancelReason] = useState<string>('');
    const [isCompleting, setIsCompleting] = useState<boolean>(false);

    const handleComplete = () => {
        setIsCompleting(true);
        router.post(
            route('admin.workout-sessions.complete', session.id),
            { notes: 'Manual completion from detail view' },
            {
                onFinish: () => setIsCompleting(false),
            }
        );
    };

    const handleCancel = () => {
        router.post(
            route('admin.workout-sessions.cancel', session.id),
            { reason: cancelReason },
            {
                onFinish: () => {
                    setIsCancelling(false);
                    setCancelReason('');
                },
            }
        );
    };

    const getStatusBadge = (sessionStatus: TrainingSession['status']) => {
        switch (sessionStatus) {
            case 'in_progress':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#faff69]/15 text-[#faff69] border border-[#faff69]/30 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-[#faff69]" />
                        IN PROGRESS
                    </span>
                );
            case 'completed':
                return (
                    <Badge variant="active" size="md">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        COMPLETED
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
                return <Badge variant="pill" size="md">{sessionStatus}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Workout Sessions', href: route('admin.workout-sessions.index') },
                { label: `Session #${session.id}` },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                                <Activity className="w-6 h-6 text-[#faff69]" />
                                Workout Session #{session.id}
                            </h1>
                            {getStatusBadge(session.status)}
                        </div>
                        <p className="text-xs text-[#888888] mt-1">
                            <strong className="text-white">{session.workout_type?.name}</strong> training log for <strong className="text-white">{session.member?.full_name}</strong>.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('admin.workout-sessions.index')}>
                            <Button variant="secondary" size="sm">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Log
                            </Button>
                        </Link>

                        {session.status === 'in_progress' && (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleComplete}
                                isLoading={isCompleting}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Complete Workout
                            </Button>
                        )}

                        {session.status !== 'cancelled' && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#ef4444] hover:bg-[#ef4444]/15"
                                onClick={() => setIsCancelling(true)}
                            >
                                <Trash2 className="w-4 h-4" />
                                Cancel Session
                            </Button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Session #${session.id} — ${session.workout_type?.name} — EXFITS`} />

            <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Session Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Timestamps & Duration Card */}
                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#faff69]" />
                                Workout Timing & Duration
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Started At</div>
                                    <div className="text-white font-bold text-base font-mono">
                                        {new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </div>
                                    <div className="text-[11px] text-[#888888]">
                                        {new Date(session.started_at).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Completed At</div>
                                    {session.completed_at ? (
                                        <>
                                            <div className="text-white font-bold text-base font-mono">
                                                {new Date(session.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                            </div>
                                            <div className="text-[11px] text-[#888888]">
                                                {new Date(session.completed_at).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-[#faff69] font-bold text-sm italic py-2">
                                            Currently active workout
                                        </div>
                                    )}
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Total Duration</div>
                                    <div className="text-xl font-extrabold font-mono text-[#faff69]">
                                        {session.duration_formatted}
                                    </div>
                                    <div className="text-[10px] text-[#888888]">{session.duration_in_minutes} total minutes</div>
                                </div>
                            </div>

                            {session.notes && (
                                <div className="mt-4 p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] text-xs">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Workout Session Notes / Remarks</div>
                                    <p className="text-white mt-1 leading-relaxed whitespace-pre-line">{session.notes}</p>
                                </div>
                            )}
                        </Card>

                        {/* Workout Discipline & Category Card */}
                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
                                <Flame className="w-4 h-4 text-[#faff69]" />
                                Workout Discipline
                            </h2>

                            <div className="space-y-3 text-xs">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-[#121212] border border-[#2a2a2a]">
                                    <div>
                                        <div className="text-base font-extrabold text-white">{session.workout_type?.name}</div>
                                        <div className="text-[11px] text-[#888888] mt-0.5">{session.workout_type?.description || 'No description provided.'}</div>
                                    </div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#faff69] bg-[#faff69]/10 px-2.5 py-1 rounded border border-[#faff69]/20">
                                        {session.workout_type?.category || 'General'}
                                    </span>
                                </div>
                            </div>
                        </Card>

                        {/* Gate Attendance Visit Reference Card */}
                        <Card variant="default">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2a2a2a]">
                                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-[#faff69]" />
                                    Attached Gate Attendance Visit #{session.attendance_id}
                                </h2>
                                <Link href={route('admin.attendance.show', session.attendance_id)}>
                                    <span className="text-xs text-[#faff69] hover:underline font-bold">View Visit Record →</span>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a]">
                                    <div className="text-[#888888] text-[10px] font-bold uppercase">Gate Check-In</div>
                                    <div className="text-white font-mono font-bold text-xs mt-1">
                                        {session.attendance?.check_in_at ? new Date(session.attendance.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a]">
                                    <div className="text-[#888888] text-[10px] font-bold uppercase">Gate Check-Out</div>
                                    <div className="text-white font-mono font-bold text-xs mt-1">
                                        {session.attendance?.check_out_at ? new Date(session.attendance.check_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Inside Gym'}
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a]">
                                    <div className="text-[#888888] text-[10px] font-bold uppercase">Gate Status</div>
                                    <div className="text-white uppercase font-bold text-xs mt-1">
                                        {session.attendance?.status}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right 1 Col: Member Identity & Branch */}
                    <div className="space-y-6">
                        {/* Member Identity Card */}
                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
                                <User className="w-4 h-4 text-[#faff69]" />
                                Member Profile
                            </h2>

                            <div className="space-y-3 text-xs">
                                <div className="flex items-center gap-3">
                                    {session.member?.profile_photo_url ? (
                                        <img
                                            src={session.member.profile_photo_url}
                                            alt={session.member.full_name}
                                            className="w-12 h-12 rounded-full object-cover border border-[#3a3a3a]"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-[#242424] text-[#faff69] font-bold text-base flex items-center justify-center border border-[#3a3a3a]">
                                            {session.member?.first_name?.charAt(0) ?? 'M'}
                                        </div>
                                    )}

                                    <div>
                                        <Link
                                            href={route('admin.members.show', session.member_id)}
                                            className="text-base font-bold text-white hover:text-[#faff69] transition-colors"
                                        >
                                            {session.member?.full_name}
                                        </Link>
                                        <div className="text-xs font-mono text-[#faff69]">
                                            {session.member?.member_number}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <Link href={route('admin.members.show', session.member_id)} className="block">
                                        <Button variant="secondary" size="sm" className="w-full">
                                            View Full Member Profile
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>

                        {/* Branch Location Card */}
                        <Card variant="elevated">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-[#faff69]" />
                                Branch Location
                            </h2>

                            <div className="space-y-1.5 text-xs">
                                <div className="font-bold text-white text-sm">{session.gym?.name}</div>
                                <div className="text-[#888888] font-mono">Code: <strong className="text-white">{session.gym?.code}</strong></div>
                                {session.gym?.address && <div className="text-[#888888] text-[11px]">{session.gym.address}</div>}
                            </div>
                        </Card>

                        {/* Assigned Personal Trainer & Quota */}
                        <Card variant="default">
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#2a2a2a]">
                                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#faff69]" />
                                    Assigned Personal Trainer
                                </h2>
                                {session.trainer && (
                                    <Badge variant="active" size="sm">PT SESSION</Badge>
                                )}
                            </div>

                            {session.trainer ? (
                                <div className="space-y-3 text-xs">
                                    <div className="flex items-center gap-3">
                                        {session.trainer.profile_photo_url ? (
                                            <img
                                                src={session.trainer.profile_photo_url}
                                                alt={session.trainer.name}
                                                className="w-12 h-12 rounded-xl object-cover border border-[#2a2a2a]"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-[#242424] text-[#faff69] font-bold text-base flex items-center justify-center border border-[#2a2a2a]">
                                                {session.trainer.name.charAt(0)}
                                            </div>
                                        )}

                                        <div>
                                            <Link
                                                href={route('admin.trainers.show', session.trainer.id)}
                                                className="text-sm font-extrabold text-white hover:text-[#faff69] transition-colors"
                                            >
                                                {session.trainer.name}
                                            </Link>
                                            <div className="text-[11px] text-[#faff69] font-semibold">
                                                {session.trainer.specialization || 'Fitness Coach'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quota Deduction Status */}
                                    <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-[#888888] uppercase">Trainer Quota Status</span>
                                            {session.trainer_quota_consumed_at ? (
                                                <span className="text-[10px] font-bold text-[#22c55e] bg-[#22c55e]/15 px-2 py-0.5 rounded border border-[#22c55e]/30">
                                                    1 SESSION DEDUCTED
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-[#faff69] bg-[#faff69]/15 px-2 py-0.5 rounded border border-[#faff69]/30">
                                                    PENDING COMPLETION
                                                </span>
                                            )}
                                        </div>

                                        {session.trainer_quota_consumed_at && (
                                            <div className="text-[10px] text-[#888888] font-mono">
                                                Deducted at: {new Date(session.trainer_quota_consumed_at).toLocaleString()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-1">
                                        <Link href={route('admin.trainers.show', session.trainer.id)} className="block">
                                            <Button variant="secondary" size="sm" className="w-full">
                                                View Coach Profile
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-3 text-center">
                                    <div className="text-xs text-white font-medium">Solo Workout (No Coach)</div>
                                    <p className="text-[11px] text-[#888888] mt-0.5">
                                        Member trained independently. No trainer quota deducted.
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            {/* Cancellation Modal */}
            <Modal
                isOpen={isCancelling}
                onClose={() => setIsCancelling(false)}
                title="Cancel Workout Session"
                description="Marks this workout session as cancelled and records staff audit reason."
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
                            placeholder="e.g. Member selected wrong discipline, session aborted early..."
                            className="w-full px-3 py-2 bg-[#1a1a1a] text-white placeholder-[#5a5a5a] text-sm rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
                        <Button variant="secondary" size="sm" onClick={() => setIsCancelling(false)}>
                            Keep Session
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