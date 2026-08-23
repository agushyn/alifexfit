import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Sparkles,
    ArrowLeft,
    Edit2,
    Calendar,
    Award,
    Clock,
    UserCheck,
    CheckCircle2,
    XCircle,
    UserX,
    Trash2,
    Mail,
    Phone,
    Building2,
    Activity,
    FileText,
    Plus
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { Modal } from '@/Components/Modal';
import { Trainer, TrainerSchedule } from '@/types';

interface TrainersShowProps {
    trainer: Trainer;
    stats: {
        total_sessions: number;
        completed_sessions: number;
        active_schedules_count: number;
    };
}

export default function TrainersShow({ trainer, stats }: TrainersShowProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleToggleStatus = () => {
        router.post(route('admin.trainers.toggle-status', trainer.id), {}, {
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        router.delete(route('admin.trainers.destroy', trainer.id), {
            onFinish: () => setIsDeleting(false),
        });
    };

    const getStatusBadge = (trainerStatus: Trainer['status']) => {
        if (trainerStatus === 'active') {
            return (
                <Badge variant="active" size="md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ACTIVE COACH
                </Badge>
            );
        }
        return (
            <Badge variant="inactive" size="md">
                <XCircle className="w-3.5 h-3.5" />
                INACTIVE
            </Badge>
        );
    };

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Trainers', href: route('admin.trainers.index') },
                { label: trainer.name },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {trainer.profile_photo_url ? (
                            <img
                                src={trainer.profile_photo_url}
                                alt={trainer.name}
                                className="w-16 h-16 rounded-xl object-cover border-2 border-[#faff69] shadow-xl"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-xl bg-[#242424] text-[#faff69] font-bold text-2xl flex items-center justify-center border border-[#2a2a2a]">
                                {trainer.name.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                                    {trainer.name}
                                </h1>
                                {getStatusBadge(trainer.status)}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs flex-wrap">
                                {trainer.role && (
                                    <span className="text-[#faff69] font-mono font-bold">
                                        {trainer.role}
                                    </span>
                                )}
                                <span className="text-[#cccccc] font-semibold flex items-center gap-1">
                                    <Award className="w-3.5 h-3.5 text-[#faff69]" />
                                    {trainer.specialization || 'General Fitness Coach'}
                                </span>
                                {trainer.certification && (
                                    <span className="text-[#888888] font-mono">
                                        ({trainer.certification})
                                    </span>
                                )}
                                <span className="text-[#888888] flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5 text-[#5a5a5a]" />
                                    {trainer.gym?.name} ({trainer.gym?.code})
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('admin.trainers.index')}>
                            <Button variant="secondary" size="sm">
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                        </Link>
                        <Link href={route('admin.trainers.schedules.index', trainer.id)}>
                            <Button variant="secondary" size="sm">
                                <Calendar className="w-4 h-4 text-[#faff69]" />
                                Manage Schedule
                            </Button>
                        </Link>
                        <Link href={route('admin.trainers.edit', trainer.id)}>
                            <Button variant="primary" size="sm">
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`${trainer.name} — EXFITS Gym`} />

            <div className="space-y-6">
                {/* Live Availability Status Card */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card
                        variant="elevated"
                        className={`p-4 col-span-1 md:col-span-2 flex items-center justify-between ${
                            trainer.is_available_now
                                ? 'border-[#22c55e]/40 bg-gradient-to-r from-[#1a1a1a] to-[#121212]'
                                : 'border-[#2a2a2a] bg-[#1a1a1a]'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-3 rounded-xl border ${
                                    trainer.is_available_now
                                        ? 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30 animate-pulse'
                                        : 'bg-[#242424] text-[#888888] border-[#3a3a3a]'
                                }`}
                            >
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#888888]">
                                    Live Availability Status
                                </div>
                                <div className="text-base font-bold text-white mt-0.5">
                                    {trainer.is_available_now ? (
                                        <span className="text-[#22c55e] flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                                            Available On Shift Now
                                        </span>
                                    ) : (
                                        <span className="text-[#888888]">Not On Active Shift</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={handleToggleStatus}
                            className={trainer.status === 'active' ? 'text-[#ef4444]' : 'text-[#22c55e]'}
                        >
                            {trainer.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                    </Card>

                    <Card variant="default" className="p-4 bg-gradient-to-br from-[#1a1a1a] to-[#121212]">
                        <div className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                            Total PT Sessions
                        </div>
                        <div className="text-2xl font-extrabold font-mono text-white mt-1">
                            {stats.total_sessions}
                        </div>
                        <div className="text-[10px] text-[#22c55e] mt-0.5">
                            {stats.completed_sessions} completed
                        </div>
                    </Card>

                    <Card variant="default" className="p-4 bg-gradient-to-br from-[#1a1a1a] to-[#121212]">
                        <div className="text-[10px] font-bold text-[#888888] uppercase tracking-wider">
                            Weekly Schedule Slots
                        </div>
                        <div className="text-2xl font-extrabold font-mono text-[#faff69] mt-1">
                            {stats.active_schedules_count}
                        </div>
                        <div className="text-[10px] text-[#888888] mt-0.5">Active time windows</div>
                    </Card>
                </div>

                {/* Main 2-Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Details & Sessions */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile & Biography */}
                        <Card variant="default">
                            <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4 pb-2 border-b border-[#2a2a2a] flex items-center gap-2">
                                <Award className="w-4 h-4 text-[#faff69]" />
                                Trainer Profile & Credentials
                            </h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Email Address</div>
                                    <div className="text-white font-medium text-sm flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5 text-[#888888]" />
                                        {trainer.email ?? 'Not provided'}
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Phone Number</div>
                                    <div className="text-white font-medium text-sm flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5 text-[#888888]" />
                                        {trainer.phone ?? 'Not provided'}
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Specialization</div>
                                    <div className="text-white font-medium text-sm">
                                        {trainer.specialization ?? 'General Fitness'}
                                    </div>
                                </div>

                                <div className="p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] space-y-1">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Hire Date</div>
                                    <div className="text-white font-medium text-sm font-mono flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-[#888888]" />
                                        {trainer.hire_date ? new Date(trainer.hire_date).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            </div>

                            {trainer.bio && (
                                <div className="mt-4 p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] text-xs">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Public Bio</div>
                                    <p className="text-white mt-1 leading-relaxed">{trainer.bio}</p>
                                </div>
                            )}

                            {trainer.notes && (
                                <div className="mt-4 p-3 rounded-lg bg-[#121212] border border-[#2a2a2a] text-xs">
                                    <div className="text-[#888888] uppercase tracking-wider text-[10px] font-bold">Internal Staff Notes</div>
                                    <p className="text-[#cccccc] mt-1 leading-relaxed">{trainer.notes}</p>
                                </div>
                            )}
                        </Card>

                        {/* Recent Training Sessions */}
                        <Card variant="default">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2a2a2a]">
                                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-[#faff69]" />
                                    Recent Coached Sessions ({trainer.training_sessions?.length ?? 0})
                                </h2>
                                <Link href={route('admin.workout-sessions.index')}>
                                    <span className="text-xs text-[#faff69] hover:underline font-bold">View All Sessions →</span>
                                </Link>
                            </div>

                            {trainer.training_sessions && trainer.training_sessions.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-[#121212] text-[#888888] uppercase tracking-wider font-semibold">
                                            <tr>
                                                <th className="px-4 py-2.5">Date</th>
                                                <th className="px-4 py-2.5">Member</th>
                                                <th className="px-4 py-2.5">Workout</th>
                                                <th className="px-4 py-2.5">Duration</th>
                                                <th className="px-4 py-2.5">Status</th>
                                                <th className="px-4 py-2.5">Quota</th>
                                                <th className="px-4 py-2.5 text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#2a2a2a]">
                                            {trainer.training_sessions.map((ws) => (
                                                <tr key={ws.id} className="hover:bg-[#1a1a1a]">
                                                    <td className="px-4 py-3 font-mono text-white">
                                                        {new Date(ws.started_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-white">
                                                        <Link href={route('admin.members.show', ws.member_id)} className="hover:text-[#faff69]">
                                                            {ws.member?.full_name}
                                                        </Link>
                                                    </td>
                                                    <td className="px-4 py-3 text-[#cccccc]">
                                                        {ws.workout_type?.name}
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
                                                            <span className="text-[10px] font-mono font-bold text-[#22c55e] bg-[#22c55e]/10 px-2 py-0.5 rounded border border-[#22c55e]/20">
                                                                DEDUCTED
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-[#888888]">
                                                                —
                                                            </span>
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
                                <p className="text-xs text-[#888888] py-4 text-center">No workout sessions logged for this trainer yet.</p>
                            )}
                        </Card>
                    </div>

                    {/* Right 1 Col: Weekly Schedule Sidebar */}
                    <div className="space-y-6">
                        {/* Weekly Schedule Summary */}
                        <Card variant="default">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2a2a2a]">
                                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#faff69]" />
                                    Weekly Schedule
                                </h2>
                                <Link href={route('admin.trainers.schedules.index', trainer.id)}>
                                    <Button variant="secondary" size="sm">
                                        <Plus className="w-3.5 h-3.5" />
                                        Manage
                                    </Button>
                                </Link>
                            </div>

                            <div className="space-y-2.5 text-xs">
                                {days.map((dayName, dayIndex) => {
                                    const daySchedules = (trainer.schedules || []).filter(
                                        (s) => s.day_of_week === dayIndex && s.status === 'active'
                                    );

                                    return (
                                        <div
                                            key={dayIndex}
                                            className="p-2.5 rounded-lg bg-[#121212] border border-[#2a2a2a] flex items-center justify-between"
                                        >
                                            <span className="font-bold text-white w-24">{dayName}</span>
                                            <div className="text-right">
                                                {daySchedules.length > 0 ? (
                                                    daySchedules.map((s) => (
                                                        <div key={s.id} className="font-mono text-[#faff69] text-xs">
                                                            {s.formatted_time_range}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-[#5a5a5a] text-[11px] italic">Off</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        {/* Danger Zone */}
                        <Card variant="default" className="border-[#ef4444]/20">
                            <h2 className="text-xs font-bold text-[#ef4444] uppercase tracking-wider mb-2">
                                Danger Zone
                            </h2>
                            <p className="text-xs text-[#888888] mb-3">
                                Remove this trainer record. Historical session records remain preserved.
                            </p>
                            <Button
                                variant="danger"
                                size="sm"
                                className="w-full"
                                onClick={() => setIsDeleting(true)}
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Trainer
                            </Button>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            <Modal
                isOpen={isDeleting}
                onClose={() => setIsDeleting(false)}
                title="Delete Trainer"
                description="Are you sure you want to delete this trainer record?"
            >
                <div className="space-y-4">
                    <p className="text-xs text-[#cccccc]">
                        Trainer: <strong className="text-white">{trainer.name}</strong>
                    </p>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
                        <Button variant="secondary" size="sm" onClick={() => setIsDeleting(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" size="sm" onClick={handleDelete}>
                            Confirm Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
