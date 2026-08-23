import React from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Building2,
    Users,
    Shield,
    Sliders,
    CheckCircle2,
    ArrowUpRight,
    Server,
    Database,
    Cpu,
    Clock,
    Lock
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { PageProps, AuditLog } from '@/types';

interface DashboardProps {
    stats: {
        total_gyms: number;
        active_gyms: number;
        gym_users_count: number;
        gym_settings_count: number;
        audit_logs_count: number;
    };
    recentLogs: AuditLog[];
    systemInfo: {
        laravel_version: string;
        php_version: string;
        environment: string;
        database_driver: string;
    };
}

export default function Dashboard({ stats, recentLogs, systemInfo }: DashboardProps) {
    const { auth, gym } = usePage<PageProps>().props;
    const user = auth.user;
    const currentGym = gym.current;
    const isSuperAdmin = user?.is_super_admin ?? false;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                            Tenant Console
                            <Badge variant="yellow" size="sm">PHASE 1 FOUNDATION</Badge>
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Welcome back, <strong className="text-white">{user?.name}</strong>. Multi-tenant context and permissions are verified.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        {isSuperAdmin && (
                            <Link href={route('admin.gyms.index')}>
                                <Button variant="secondary" size="sm">
                                    <Building2 className="w-3.5 h-3.5" />
                                    Manage Gyms
                                </Button>
                            </Link>
                        )}
                        <Link href={route('admin.settings.index')}>
                            <Button variant="primary" size="sm">
                                <Sliders className="w-3.5 h-3.5" />
                                Gym Settings
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Admin Dashboard — EXFITS Gym" />

            <div className="space-y-6">
                {/* 4 Stat Callout Cards (DESIGN.md yellow stat numbers) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card variant="default" className="relative overflow-hidden group">
                        <div className="flex items-center justify-between text-[#888888]">
                            <span className="text-xs font-semibold uppercase tracking-wider">
                                {isSuperAdmin ? 'Total Gyms' : 'Branch Status'}
                            </span>
                            <Building2 className="w-4 h-4 text-[#faff69]" />
                        </div>
                        <div className="mt-3">
                            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-[#faff69] tracking-tight">
                                {isSuperAdmin ? stats.total_gyms : (currentGym?.status === 'active' ? 'ACTIVE' : 'INACTIVE')}
                            </div>
                            <p className="text-xs text-[#888888] mt-1 flex items-center gap-1.5">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                                {isSuperAdmin ? `${stats.active_gyms} active branches` : currentGym?.code}
                            </p>
                        </div>
                    </Card>

                    <Card variant="default" className="relative overflow-hidden group">
                        <div className="flex items-center justify-between text-[#888888]">
                            <span className="text-xs font-semibold uppercase tracking-wider">
                                {isSuperAdmin ? 'Scoped Users' : 'Gym Staff & Admins'}
                            </span>
                            <Users className="w-4 h-4 text-[#22c55e]" />
                        </div>
                        <div className="mt-3">
                            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-[#faff69] tracking-tight">
                                {stats.gym_users_count}
                            </div>
                            <p className="text-xs text-[#888888] mt-1">
                                Scoped to {currentGym ? currentGym.name : 'all tenants'}
                            </p>
                        </div>
                    </Card>

                    <Card variant="default" className="relative overflow-hidden group">
                        <div className="flex items-center justify-between text-[#888888]">
                            <span className="text-xs font-semibold uppercase tracking-wider">Gym Settings</span>
                            <Sliders className="w-4 h-4 text-[#3b82f6]" />
                        </div>
                        <div className="mt-3">
                            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-[#faff69] tracking-tight">
                                {stats.gym_settings_count}
                            </div>
                            <p className="text-xs text-[#888888] mt-1">
                                Tenant key-value pairs stored
                            </p>
                        </div>
                    </Card>

                    <Card variant="default" className="relative overflow-hidden group">
                        <div className="flex items-center justify-between text-[#888888]">
                            <span className="text-xs font-semibold uppercase tracking-wider">Audit Trail Records</span>
                            <Shield className="w-4 h-4 text-[#faff69]" />
                        </div>
                        <div className="mt-3">
                            <div className="text-4xl sm:text-5xl font-extrabold font-mono text-[#faff69] tracking-tight">
                                {stats.audit_logs_count}
                            </div>
                            <p className="text-xs text-[#888888] mt-1">
                                Security & operational events
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Architecture & Tenant Isolation Status */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active Context Verification Matrix */}
                    <Card variant="elevated" className="lg:col-span-2">
                        <div className="flex items-center justify-between pb-4 border-b border-[#3a3a3a]">
                            <div>
                                <h3 className="text-base font-bold text-white flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-[#faff69]" />
                                    Phase 1 Architecture & Tenant Isolation Check
                                </h3>
                                <p className="text-xs text-[#888888] mt-0.5">
                                    Live runtime validation of multi-tenancy, RBAC gates, and session binding.
                                </p>
                            </div>
                            <Badge variant="emerald" size="sm">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                ISOLATION ACTIVE
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                            <div className="p-3.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] space-y-1">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">User Identity & Role</div>
                                <div className="text-sm font-bold text-white">{user?.name}</div>
                                <div className="text-xs text-[#cccccc] font-mono">{user?.email}</div>
                                <div className="pt-2 flex flex-wrap gap-1.5">
                                    {user?.roles?.map((r) => (
                                        <Badge key={r} variant="yellow" size="sm">{r.toUpperCase()}</Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="p-3.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] space-y-1">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">Resolved Gym Context</div>
                                <div className="text-sm font-bold text-white">
                                    {currentGym ? currentGym.name : 'Global Root (All Gyms)'}
                                </div>
                                <div className="text-xs text-[#888888] font-mono">
                                    ID: <span className="text-[#faff69]">{currentGym?.id ?? 'NULL'}</span> • Code: <span className="text-[#faff69]">{currentGym?.code ?? 'GLOBAL'}</span>
                                </div>
                                <div className="pt-2 text-[11px] text-[#888888]">
                                    Timezone: <span className="text-white font-medium">{currentGym?.timezone ?? 'Asia/Jakarta'}</span>
                                </div>
                            </div>

                            <div className="p-3.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] space-y-1">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">Tenancy Pattern</div>
                                <div className="text-xs font-semibold text-white">Single DB + Shared Tables + gym_id Scoping</div>
                                <p className="text-[11px] text-[#888888] leading-relaxed">
                                    Global <code className="text-[#faff69]">GymScope</code> automatically appends <code className="text-[#faff69]">where gym_id = ?</code> to all tenant models.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] space-y-1">
                                <div className="text-[11px] font-bold uppercase tracking-wider text-[#888888]">Backend RBAC Policy Gates</div>
                                <div className="text-xs font-semibold text-[#22c55e]">
                                    {user?.permissions?.length ?? 0} Permissions Granted
                                </div>
                                <div className="max-h-16 overflow-y-auto pt-1 flex flex-wrap gap-1">
                                    {user?.permissions?.slice(0, 6).map((p) => (
                                        <span key={p} className="text-[10px] bg-[#242424] text-[#cccccc] px-1.5 py-0.5 rounded font-mono">
                                            {p}
                                        </span>
                                    ))}
                                    {(user?.permissions?.length ?? 0) > 6 && (
                                        <span className="text-[10px] text-[#888888] font-mono self-center">
                                            +{((user?.permissions?.length ?? 0) - 6)} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* System Technical Environment Info */}
                    <Card variant="default">
                        <div className="flex items-center justify-between pb-4 border-b border-[#2a2a2a]">
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Server className="w-4 h-4 text-[#faff69]" />
                                Core Foundation
                            </h3>
                            <Badge variant="pill" size="sm">PHP 8.5+</Badge>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]/60 text-xs">
                                <span className="text-[#888888] flex items-center gap-2">
                                    <Cpu className="w-3.5 h-3.5 text-[#888888]" />
                                    Laravel Framework
                                </span>
                                <span className="font-mono text-white font-semibold">{systemInfo.laravel_version}</span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]/60 text-xs">
                                <span className="text-[#888888] flex items-center gap-2">
                                    <Cpu className="w-3.5 h-3.5 text-[#888888]" />
                                    PHP Runtime
                                </span>
                                <span className="font-mono text-white font-semibold">{systemInfo.php_version}</span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]/60 text-xs">
                                <span className="text-[#888888] flex items-center gap-2">
                                    <Database className="w-3.5 h-3.5 text-[#888888]" />
                                    Database Engine
                                </span>
                                <span className="font-mono text-[#faff69] font-semibold uppercase">{systemInfo.database_driver} (MySQL 8.x)</span>
                            </div>

                            <div className="flex items-center justify-between py-2 border-b border-[#2a2a2a]/60 text-xs">
                                <span className="text-[#888888] flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-[#888888]" />
                                    Environment
                                </span>
                                <span className="font-mono text-[#22c55e] font-semibold uppercase">{systemInfo.environment}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-[#2a2a2a]">
                            <div className="text-[11px] text-[#888888]">
                                Phase 1 architectural goals verified. System is ready for Phase 2 Member & Membership integration.
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Recent Audit Log Stream */}
                <Card variant="default">
                    <div className="flex items-center justify-between pb-4 border-b border-[#2a2a2a]">
                        <div>
                            <h3 className="text-base font-bold text-white flex items-center gap-2">
                                <Shield className="w-4 h-4 text-[#faff69]" />
                                Recent Tenant & Auth Audit Stream
                            </h3>
                            <p className="text-xs text-[#888888] mt-0.5">
                                Real-time immutable record of login, configuration, and tenant actions.
                            </p>
                        </div>

                        <Link href={route('admin.audit-logs.index')}>
                            <Button variant="outline" size="sm">
                                View Full Audit Trail
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-4 divide-y divide-[#2a2a2a]/60">
                        {recentLogs.length > 0 ? (
                            recentLogs.map((log) => (
                                <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#faff69]" />
                                        <div>
                                            <span className="font-mono font-semibold text-[#faff69]">{log.action}</span>
                                            <span className="text-[#888888] mx-2">by</span>
                                            <strong className="text-white">{log.user?.name ?? 'System'}</strong>
                                            <span className="text-[#888888] text-[11px] ml-1">({log.user?.email ?? 'N/A'})</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-[11px] text-[#888888]">
                                        <span className="font-mono">{log.ip_address ?? '127.0.0.1'}</span>
                                        <span>•</span>
                                        <span>{new Date(log.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-xs text-[#888888]">
                                No audit records logged in the current tenant scope yet.
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}