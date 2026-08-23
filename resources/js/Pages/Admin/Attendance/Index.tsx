import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    UserCheck,
    Search,
    Eye,
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    Maximize2,
    Activity,
    LogOut,
    Tag,
    User,
    Building2,
    Flame
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Attendance, PaginatedData } from '@/types';

interface AttendanceIndexProps {
    attendances: PaginatedData<Attendance>;
    stats: {
        in_gym: number;
        today: number;
        checked_out_today: number;
        total: number;
    };
    filters: {
        search?: string;
        date?: string;
        status?: string;
        source?: string;
    };
}

export default function AttendanceIndex({
    attendances,
    stats,
    filters,
}: AttendanceIndexProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');
    const [status, setStatus] = useState(filters.status || '');
    const [source, setSource] = useState(filters.source || '');
    const [checkingOutId, setCheckingOutId] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            route('admin.attendance.index'),
            { search, date, status, source },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setDate('');
        setStatus('');
        setSource('');
        router.get(route('admin.attendance.index'));
    };

    const handleManualCheckout = (attendanceId: number) => {
        setCheckingOutId(attendanceId);
        router.post(
            route('admin.attendance.checkout', attendanceId),
            { notes: 'Manual checkout by staff' },
            {
                preserveScroll: true,
                onFinish: () => setCheckingOutId(null),
            }
        );
    };

    const getStatusBadge = (attStatus: Attendance['status']) => {
        switch (attStatus) {
            case 'in_gym':
                return (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                        IN GYM
                    </span>
                );
            case 'checked_out':
                return (
                    <Badge variant="pill" size="sm">
                        <CheckCircle2 className="w-3 h-3 text-[#888888]" />
                        CHECKED OUT
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
                return <Badge variant="pill" size="sm">{attStatus}</Badge>;
        }
    };

    const getSourcePill = (attSource: Attendance['source']) => {
        switch (attSource) {
            case 'kiosk':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#faff69] bg-[#242424] px-2 py-0.5 rounded border border-[#3a3a3a] uppercase">
                        KIOSK
                    </span>
                );
            case 'app':
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded border border-[#38bdf8]/20 uppercase">
                        APP
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#888888] bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#2a2a2a] uppercase">
                        ADMIN
                    </span>
                );
        }
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Attendance & Gate' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <UserCheck className="w-6 h-6 text-[#faff69]" />
                            Attendance & Gate Control
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Live turnstile entrance logs, active gym presence, check-in timestamps, and session durations.
                        </p>
                    </div>

                    <Link href={route('admin.attendance.kiosk')}>
                        <Button variant="primary" size="md" className="font-bold shadow-lg shadow-[#faff69]/10">
                            <Maximize2 className="w-4 h-4" />
                            Open Kiosk Scanner Mode
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Attendance & Gate — EXFITS Gym" />

            <div className="space-y-6">
                {/* 4 Summary KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card variant="elevated" className="border-[#22c55e]/30 bg-gradient-to-br from-[#1a1a1a] to-[#121212] p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#22c55e] flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                                In Gym Right Now
                            </span>
                            <Flame className="w-4 h-4 text-[#22c55e]" />
                        </div>
                        <div className="text-3xl font-extrabold font-mono text-[#22c55e] mt-2">
                            {stats.in_gym}
                        </div>
                        <div className="text-[11px] text-[#888888] mt-1">Active visitors inside</div>
                    </Card>

                    <Card variant="default" className="p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Total Visits Today</div>
                        <div className="text-3xl font-extrabold font-mono text-white mt-2">{stats.today}</div>
                        <div className="text-[11px] text-[#888888] mt-1">Gate check-ins logged</div>
                    </Card>

                    <Card variant="default" className="p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#888888]">Checked Out Today</div>
                        <div className="text-3xl font-extrabold font-mono text-[#cccccc] mt-2">{stats.checked_out_today}</div>
                        <div className="text-[11px] text-[#888888] mt-1">Completed training sessions</div>
                    </Card>

                    <Card variant="default" className="p-4">
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#888888]">All-Time Visits</div>
                        <div className="text-3xl font-extrabold font-mono text-[#faff69] mt-2">{stats.total}</div>
                        <div className="text-[11px] text-[#888888] mt-1">Historical attendance records</div>
                    </Card>
                </div>

                {/* Filter and Search Bar */}
                <Card variant="default" className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-col lg:flex-row items-center gap-3">
                        <div className="flex-1 w-full">
                            <TextInput
                                placeholder="Search by member # (MEM-000001) or member name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={<Search className="w-4 h-4" />}
                            />
                        </div>

                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full lg:w-auto">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="h-10 px-3 bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                title="Filter by Check-in Date"
                            />

                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="h-10 px-3 bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            >
                                <option value="">All Statuses</option>
                                <option value="in_gym">In Gym (Active)</option>
                                <option value="checked_out">Checked Out</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <select
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                className="h-10 px-3 bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            >
                                <option value="">All Sources</option>
                                <option value="kiosk">Kiosk</option>
                                <option value="app">App</option>
                                <option value="admin">Admin</option>
                            </select>

                            <Button type="submit" variant="secondary" size="md">
                                Filter
                            </Button>

                            {(search || date || status || source) && (
                                <Button type="button" variant="ghost" size="md" onClick={handleReset}>
                                    Reset
                                </Button>
                            )}
                        </div>
                    </form>
                </Card>

                {/* Attendance Records Table */}
                <Card variant="default" className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#121212] border-b border-[#2a2a2a] text-[#888888] uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">Member</th>
                                    <th className="px-6 py-3.5">Membership Plan</th>
                                    <th className="px-6 py-3.5">Check-In</th>
                                    <th className="px-6 py-3.5">Check-Out</th>
                                    <th className="px-6 py-3.5">Duration</th>
                                    <th className="px-6 py-3.5">Source</th>
                                    <th className="px-6 py-3.5">Status</th>
                                    <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a2a2a]/60">
                                {attendances.data.length > 0 ? (
                                    attendances.data.map((att) => (
                                        <tr key={att.id} className="hover:bg-[#1a1a1a] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {att.member?.profile_photo_url ? (
                                                        <img
                                                            src={att.member.profile_photo_url}
                                                            alt={att.member.full_name}
                                                            className="w-8 h-8 rounded-full object-cover border border-[#3a3a3a]"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-[#242424] text-[#faff69] font-bold text-xs flex items-center justify-center border border-[#3a3a3a]">
                                                            {att.member?.first_name?.charAt(0) ?? 'M'}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <Link
                                                            href={route('admin.members.show', att.member_id)}
                                                            className="font-bold text-white hover:text-[#faff69] transition-colors"
                                                        >
                                                            {att.member?.full_name}
                                                        </Link>
                                                        <div className="text-[11px] font-mono text-[#faff69]">
                                                            {att.member?.member_number}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-white">
                                                    {att.membership?.membership_plan?.name ?? 'Standard Plan'}
                                                </div>
                                                <div className="text-[10px] text-[#888888] font-mono">
                                                    #{att.membership_id}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 font-mono text-xs">
                                                <div className="text-white font-bold">
                                                    {new Date(att.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="text-[10px] text-[#888888]">
                                                    {new Date(att.check_in_at).toLocaleDateString()}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 font-mono text-xs">
                                                {att.check_out_at ? (
                                                    <div>
                                                        <div className="text-white font-bold">
                                                            {new Date(att.check_out_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                        <div className="text-[10px] text-[#888888]">
                                                            {new Date(att.check_out_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-[#5a5a5a] text-[11px] italic">In progress</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 font-mono font-bold text-[#cccccc]">
                                                {att.duration_formatted ?? '—'}
                                            </td>

                                            <td className="px-6 py-4">
                                                {getSourcePill(att.source)}
                                            </td>

                                            <td className="px-6 py-4">
                                                {getStatusBadge(att.status)}
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {att.status === 'in_gym' && (
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="text-[#22c55e] hover:bg-[#22c55e]/15 border-[#22c55e]/30"
                                                            onClick={() => handleManualCheckout(att.id)}
                                                            isLoading={checkingOutId === att.id}
                                                            title="Check-out member"
                                                        >
                                                            <LogOut className="w-3 h-3" />
                                                            Check Out
                                                        </Button>
                                                    )}

                                                    <Link href={route('admin.attendance.show', att.id)}>
                                                        <Button variant="secondary" size="sm" title="View details">
                                                            <Eye className="w-3 h-3" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-[#888888]">
                                            No attendance records found matching filter criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {attendances.last_page > 1 && (
                        <div className="p-4 border-t border-[#2a2a2a] flex items-center justify-between text-xs text-[#888888]">
                            <div>
                                Showing <strong>{attendances.from}</strong> to <strong>{attendances.to}</strong> of <strong>{attendances.total}</strong> visits
                            </div>
                            <div className="flex items-center gap-1.5">
                                {attendances.links.map((link, idx) => (
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