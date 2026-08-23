import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    Search,
    Calendar,
    Filter,
    Clock,
    Flame,
    CheckCircle2,
    XCircle,
    User,
    ArrowRight,
    Sparkles,
    Eye,
    RotateCcw
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Pagination } from '@/Components/Pagination';
import { TrainingSession, WorkoutType } from '@/types';

interface WorkoutSessionsIndexProps {
    sessions: {
        data: TrainingSession[];
        links: any[];
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        workout_type_id?: string;
        status?: string;
        date?: string;
    };
    stats: {
        in_progress: number;
        today: number;
        completed_today: number;
        total: number;
    };
    workoutTypes: WorkoutType[];
}

export default function WorkoutSessionsIndex({
    sessions,
    filters,
    stats,
    workoutTypes,
}: WorkoutSessionsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [workoutTypeId, setWorkoutTypeId] = useState(filters.workout_type_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [date, setDate] = useState(filters.date || '');

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            route('admin.workout-sessions.index'),
            {
                search: search || undefined,
                workout_type_id: workoutTypeId || undefined,
                status: status || undefined,
                date: date || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setWorkoutTypeId('');
        setStatus('');
        setDate('');
        router.get(route('admin.workout-sessions.index'));
    };

    const handleComplete = (sessionId: number) => {
        router.post(route('admin.workout-sessions.complete', sessionId), {
            notes: 'Completed via admin dashboard',
        });
    };

    const getStatusBadge = (sessionStatus: TrainingSession['status']) => {
        switch (sessionStatus) {
            case 'in_progress':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#faff69]/15 text-[#faff69] border border-[#faff69]/30 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#faff69]" />
                        IN PROGRESS
                    </span>
                );
            case 'completed':
                return (
                    <Badge variant="active" size="sm">
                        <CheckCircle2 className="w-3 h-3" />
                        COMPLETED
                    </Badge>
                );
            case 'cancelled':
                return (
                    <Badge variant="rose" size="sm">
                        <XCircle className="w-3 h-3" />
                        CANCELLED
                    </Badge>
                );
            default:
                return <Badge variant="pill" size="sm">{sessionStatus}</Badge>;
        }
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Workout Sessions' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <Activity className="w-6 h-6 text-[#faff69]" />
                            Workout Sessions & History
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Monitor live member workout activities, disciplines, and training durations across branch gates.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('admin.workout-types.index')}>
                            <Button variant="secondary" size="sm">
                                Manage Workout Types
                            </Button>
                        </Link>
                        <Link href={route('admin.attendance.index')}>
                            <Button variant="secondary" size="sm">
                                View Gate Attendance
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Workout Sessions — EXFITS Gym" />

            <div className="space-y-6">
                {/* 4 KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card variant="elevated" className="border-[#faff69]/30 p-4 bg-gradient-to-br from-[#1c1c1c] to-[#121212]">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#faff69]">
                                    Active In Progress
                                </div>
                                <div className="text-2xl font-black font-mono text-white mt-1">
                                    {stats.in_progress}
                                </div>
                                <div className="text-[11px] text-[#888888] mt-0.5">Live workouts right now</div>
                            </div>
                            <div className="p-3 rounded-2xl bg-[#faff69]/10 text-[#faff69] border border-[#faff69]/20 animate-pulse">
                                <Flame className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>

                    <Card variant="default" className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#888888]">
                                    Sessions Today
                                </div>
                                <div className="text-2xl font-black font-mono text-white mt-1">
                                    {stats.today}
                                </div>
                                <div className="text-[11px] text-[#888888] mt-0.5">Started today</div>
                            </div>
                            <div className="p-3 rounded-2xl bg-[#1f1f1f] text-[#888888] border border-[#2a2a2a]">
                                <Calendar className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>

                    <Card variant="default" className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#22c55e]">
                                    Completed Today
                                </div>
                                <div className="text-2xl font-black font-mono text-white mt-1">
                                    {stats.completed_today}
                                </div>
                                <div className="text-[11px] text-[#888888] mt-0.5">Finished sessions</div>
                            </div>
                            <div className="p-3 rounded-2xl bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>

                    <Card variant="default" className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#888888]">
                                    All-Time Logged
                                </div>
                                <div className="text-2xl font-black font-mono text-white mt-1">
                                    {stats.total}
                                </div>
                                <div className="text-[11px] text-[#888888] mt-0.5">Historical training total</div>
                            </div>
                            <div className="p-3 rounded-2xl bg-[#1f1f1f] text-[#888888] border border-[#2a2a2a]">
                                <Activity className="w-6 h-6" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Filter and Search Bar */}
                <Card variant="default" className="p-4">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 text-[#888888] absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search member / number..."
                                className="w-full pl-9 pr-3 py-2 bg-[#121212] text-xs text-white placeholder-[#5a5a5a] rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            />
                        </div>

                        <div>
                            <select
                                value={workoutTypeId}
                                onChange={(e) => setWorkoutTypeId(e.target.value)}
                                className="w-full px-3 py-2 bg-[#121212] text-xs text-white rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            >
                                <option value="">All Workout Types</option>
                                {workoutTypes.map((wt) => (
                                    <option key={wt.id} value={wt.id}>
                                        {wt.name} ({wt.category || 'General'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 bg-[#121212] text-xs text-white rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            >
                                <option value="">All Statuses</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2 bg-[#121212] text-xs text-white rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <Button type="submit" variant="primary" size="sm" className="flex-1">
                                <Filter className="w-3.5 h-3.5" />
                                Filter
                            </Button>
                            {(search || workoutTypeId || status || date) && (
                                <Button type="button" variant="secondary" size="sm" onClick={handleReset}>
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </Button>
                            )}
                        </div>
                    </form>
                </Card>

                {/* Workout Sessions Table */}
                <Card variant="default" className="overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#141414] text-[#888888] uppercase tracking-wider font-semibold border-b border-[#2a2a2a]">
                                <tr>
                                    <th className="px-5 py-3.5">Member</th>
                                    <th className="px-5 py-3.5">Workout Discipline</th>
                                    <th className="px-5 py-3.5">Coach / Trainer</th>
                                    <th className="px-5 py-3.5">Started</th>
                                    <th className="px-5 py-3.5">Completed</th>
                                    <th className="px-5 py-3.5">Duration</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#242424]">
                                {sessions.data.length > 0 ? (
                                    sessions.data.map((session) => (
                                        <tr key={session.id} className="hover:bg-[#161616] transition-colors">
                                            {/* Member */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    {session.member?.profile_photo_url ? (
                                                        <img
                                                            src={session.member.profile_photo_url}
                                                            alt={session.member.full_name}
                                                            className="w-8 h-8 rounded-full object-cover border border-[#3a3a3a]"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-[#202020] text-[#faff69] font-bold text-xs flex items-center justify-center border border-[#3a3a3a]">
                                                            {session.member?.first_name?.charAt(0) ?? 'M'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <Link
                                                            href={route('admin.members.show', session.member_id)}
                                                            className="font-bold text-white hover:text-[#faff69] transition-colors"
                                                        >
                                                            {session.member?.full_name}
                                                        </Link>
                                                        <div className="text-[11px] font-mono text-[#888888]">
                                                            {session.member?.member_number}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Workout Type */}
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-white">
                                                    {session.workout_type?.name}
                                                </div>
                                                <div className="text-[10px] uppercase font-bold text-[#888888] tracking-wider">
                                                    {session.workout_type?.category || 'General Workout'}
                                                </div>
                                            </td>

                                            {/* Trainer / Coach */}
                                            <td className="px-5 py-4">
                                                {session.trainer ? (
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="w-3.5 h-3.5 text-[#faff69] flex-shrink-0" />
                                                        <div>
                                                            <Link
                                                                href={route('admin.trainers.show', session.trainer.id)}
                                                                className="font-bold text-white hover:text-[#faff69]"
                                                            >
                                                                {session.trainer.name}
                                                            </Link>
                                                            <div className="text-[10px] text-[#888888]">
                                                                {session.trainer.specialization || 'Personal Trainer'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[#5a5a5a] text-[11px] italic">
                                                        Solo (No Coach)
                                                    </span>
                                                )}
                                            </td>

                                            {/* Started */}
                                            <td className="px-5 py-4 font-mono text-[#cccccc]">
                                                <div>{new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                <div className="text-[10px] text-[#888888]">{new Date(session.started_at).toLocaleDateString()}</div>
                                            </td>

                                            {/* Completed */}
                                            <td className="px-5 py-4 font-mono text-[#888888]">
                                                {session.completed_at ? (
                                                    <>
                                                        <div className="text-[#cccccc]">{new Date(session.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                                        <div className="text-[10px]">{new Date(session.completed_at).toLocaleDateString()}</div>
                                                    </>
                                                ) : (
                                                    <span className="text-[#faff69] font-sans italic text-[11px]">Running...</span>
                                                )}
                                            </td>

                                            {/* Duration */}
                                            <td className="px-5 py-4">
                                                <span className="font-mono font-bold text-[#faff69] bg-[#1a1a1a] px-2.5 py-1 rounded border border-[#2a2a2a]">
                                                    {session.duration_formatted}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4">
                                                {getStatusBadge(session.status)}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {session.status === 'in_progress' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleComplete(session.id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 hover:bg-[#22c55e]/25 transition-colors"
                                                            title="Finish Session"
                                                        >
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Finish
                                                        </button>
                                                    )}

                                                    <Link href={route('admin.workout-sessions.show', session.id)}>
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="w-3.5 h-3.5" />
                                                            Details
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-[#888888]">
                                            <Activity className="w-8 h-8 text-[#444444] mx-auto mb-2" />
                                            <div className="text-sm font-semibold text-white">No workout sessions found</div>
                                            <p className="text-xs text-[#666666] mt-1">
                                                Workout sessions created via Member App or Gate attendance will appear here.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {sessions.last_page > 1 && (
                        <div className="p-4 border-t border-[#2a2a2a] flex items-center justify-between text-xs text-[#888888]">
                            <div>
                                Showing <strong>{sessions.from}</strong> to <strong>{sessions.to}</strong> of <strong>{sessions.total}</strong> workout sessions
                            </div>
                            <div className="flex items-center gap-1.5">
                                {sessions.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveScroll
                                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                                            link.active
                                                ? 'bg-[#faff69] text-[#0a0a0a]'
                                                : link.url
                                                ? 'bg-[#1a1a1a] text-white hover:bg-[#242424]'
                                                : 'text-[#5a5a5a] cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}