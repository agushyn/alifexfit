import React, { ReactNode, useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Building2,
    Users,
    UserCheck,
    CreditCard,
    Sparkles,
    Calendar,
    Globe,
    BarChart3,
    Settings,
    FileText,
    LogOut,
    Menu,
    X,
    Dumbbell,
    Shield,
    ChevronRight,
    Lock,
    Activity,
    UserPlus,
    Flame
} from 'lucide-react';
import { PageProps } from '@/types';
import { GymSwitcher } from '@/Components/GymSwitcher';
import { FlashMessage } from '@/Components/FlashMessage';
import { Badge } from '@/Components/Badge';

export interface HeaderConfig {
    title: string;
    subtitle?: string;
    badge?: ReactNode;
}

export interface AuthenticatedLayoutProps {
    children: ReactNode;
    header?: ReactNode | HeaderConfig;
    title?: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AuthenticatedLayout({ children, header, breadcrumbs }: AuthenticatedLayoutProps) {
    const { auth, gym } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const user = auth.user;
    const isSuperAdmin = user?.is_super_admin ?? false;
    const currentGym = gym.current;

    const handleLogout = () => {
        router.post(route('admin.logout'));
    };

    const navigationGroups = [
        {
            name: 'Overview',
            items: [
                { name: 'Dashboard', href: route('admin.dashboard'), icon: LayoutDashboard, current: route().current('admin.dashboard') },
                ...(isSuperAdmin || user?.permissions?.includes('gyms.view') ? [
                    { name: 'Gyms & Branches', href: route('admin.gyms.index'), icon: Building2, current: route().current('admin.gyms.*') }
                ] : []),
            ],
        },
        {
            name: 'Operations',
            items: [
                { name: 'Leads & CRM', href: route('admin.leads.index'), icon: Flame, current: route().current('admin.leads.*') },
                { name: 'Registrations', href: route('admin.membership-registrations.index'), icon: UserPlus, current: route().current('admin.membership-registrations.*') },
                { name: 'Members', href: route('admin.members.index'), icon: Users, current: route().current('admin.members.*') },
                { name: 'Attendance & Gate', href: route('admin.attendance.index'), icon: UserCheck, current: route().current('admin.attendance.*') },
                { name: 'Workout Sessions', href: route('admin.workout-sessions.index'), icon: Activity, current: route().current('admin.workout-sessions.*') },
            ],
        },
        {
            name: 'Membership',
            items: [
                { name: 'Plans & Packages', href: route('admin.membership-plans.index'), icon: CreditCard, current: route().current('admin.membership-plans.*') },
                { name: 'Subscriptions', href: route('admin.memberships.index'), icon: FileText, current: route().current('admin.memberships.*') },
                { name: 'Orders & Invoices', href: route('admin.modules.show', 'membership-orders'), icon: FileText, current: route().current('admin.modules.show', { module: 'membership-orders' }), phase: 'Phase 7' },
                { name: 'Payments & QRIS', href: route('admin.modules.show', 'membership-payments'), icon: CreditCard, current: route().current('admin.modules.show', { module: 'membership-payments' }), phase: 'Phase 7' },
                { name: 'Identity KYC', href: route('admin.modules.show', 'membership-verification'), icon: Lock, current: route().current('admin.modules.show', { module: 'membership-verification' }), phase: 'Phase 7' },
            ],
        },
        {
            name: 'Services & CMS',
            items: [
                { name: 'Workout Types', href: route('admin.workout-types.index'), icon: Calendar, current: route().current('admin.workout-types.*') },
                { name: 'Trainers', href: route('admin.trainers.index'), icon: Sparkles, current: route().current('admin.trainers.*') },
                { name: 'Website CMS', href: route('admin.website.overview'), icon: Globe, current: route().current('admin.website.*') },
                { name: 'Reports & Analytics', href: route('admin.modules.show', 'reports'), icon: BarChart3, current: route().current('admin.modules.show', { module: 'reports' }), phase: 'Phase 6' },
            ],
        },
        {
            name: 'Administration',
            items: [
                { name: 'Settings', href: route('admin.settings.index'), icon: Settings, current: route().current('admin.settings.*') },
                { name: 'Audit Logs', href: route('admin.audit-logs.index'), icon: Shield, current: route().current('admin.audit-logs.*') },
            ],
        },
    ];

    const getPrimaryRoleBadge = () => {
        if (isSuperAdmin) {
            return <Badge variant="yellow" size="sm">SUPER ADMIN</Badge>;
        }
        if (user?.roles?.includes('gym_admin')) {
            return <Badge variant="active" size="sm">GYM ADMIN</Badge>;
        }
        if (user?.roles?.includes('staff')) {
            return <Badge variant="blue" size="sm">STAFF</Badge>;
        }
        if (user?.roles?.includes('trainer')) {
            return <Badge variant="emerald" size="sm">TRAINER</Badge>;
        }
        return <Badge variant="pill" size="sm">USER</Badge>;
    };

    const renderHeader = () => {
        if (!header) return null;

        if (React.isValidElement(header)) {
            return header;
        }

        if (typeof header === 'object' && header !== null && 'title' in header) {
            const h = header as HeaderConfig;
            return (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            {h.title}
                        </h1>
                        {h.subtitle && (
                            <p className="text-xs text-[#888888] mt-1">
                                {h.subtitle}
                            </p>
                        )}
                    </div>
                    {h.badge && (
                        <div>
                            {typeof h.badge === 'string' ? (
                                <Badge variant="yellow" size="sm">
                                    {h.badge}
                                </Badge>
                            ) : (
                                h.badge
                            )}
                        </div>
                    )}
                </div>
            );
        }

        return header as ReactNode;
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-[#cccccc] flex flex-col font-sans">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 h-16 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#2a2a2a] px-4 sm:px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Mobile Hamburger */}
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 rounded-lg bg-[#1a1a1a] text-white border border-[#2a2a2a] hover:bg-[#242424]"
                    >
                        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>

                    {/* Logo & Brand */}
                    <Link href={route('admin.dashboard')} className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-[#faff69] flex items-center justify-center font-bold">
                            <Dumbbell className="w-5 h-5" />
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                                EXFITS <span className="text-[#faff69]">GYM</span>
                            </div>
                            <div className="text-[10px] uppercase font-mono tracking-widest text-[#888888] -mt-1">
                                Core Engine
                            </div>
                        </div>
                    </Link>

                    {/* Gym Context Switcher */}
                    <div className="ml-2 sm:ml-6">
                        <GymSwitcher />
                    </div>
                </div>

                {/* Right Profile & Actions */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Role Badge */}
                    <div className="hidden sm:flex items-center">
                        {getPrimaryRoleBadge()}
                    </div>

                    {/* User Identity Pill */}
                    <div className="flex items-center gap-3 pl-3 border-l border-[#2a2a2a]">
                        <div className="hidden md:block text-right">
                            <div className="text-xs font-semibold text-white">{user?.name}</div>
                            <div className="text-[11px] text-[#888888]">{user?.email}</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#242424] border border-[#3a3a3a] text-white flex items-center justify-center font-bold text-xs">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <button
                            type="button"
                            onClick={handleLogout}
                            title="Sign out"
                            className="p-2 rounded-lg bg-[#1a1a1a] hover:bg-[#ef4444]/15 text-[#888888] hover:text-[#ef4444] border border-[#2a2a2a] hover:border-[#ef4444]/30 transition-colors cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <aside
                    className={`fixed inset-y-16 left-0 z-30 w-64 bg-[#0a0a0a] border-r border-[#2a2a2a] transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
                        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                >
                    <div className="h-full flex flex-col justify-between overflow-y-auto p-4 space-y-6">
                        <div className="space-y-6">
                            {navigationGroups.map((group) => (
                                <div key={group.name} className="space-y-1">
                                    <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#5a5a5a]">
                                        {group.name}
                                    </div>
                                    <div className="space-y-0.5 mt-1.5">
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            const active = item.current;
                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={`flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                                                        active
                                                            ? 'bg-[#1a1a1a] text-[#faff69] border border-[#2a2a2a]'
                                                            : 'text-[#cccccc] hover:text-white hover:bg-[#121212]'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-[#faff69]' : 'text-[#888888]'}`} />
                                                        <span className="truncate">{item.name}</span>
                                                    </div>
                                                    {item.phase && (
                                                        <span className="text-[9px] bg-[#1a1a1a] text-[#888888] border border-[#2a2a2a] px-1.5 py-0.5 rounded font-mono">
                                                            {item.phase}
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tenant Context Summary in Sidebar */}
                        <div className="p-3.5 rounded-xl bg-[#121212] border border-[#2a2a2a] space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#888888]">Active Tenant</span>
                                <span className={`w-2 h-2 rounded-full ${currentGym?.status === 'active' ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} />
                            </div>
                            <div className="text-xs font-semibold text-white truncate">
                                {currentGym ? currentGym.name : 'Global Master Context'}
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-[#888888] font-mono">
                                <span>{currentGym?.code ?? 'ROOT'}</span>
                                <span>{currentGym?.timezone ?? 'UTC'}</span>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto bg-[#0a0a0a]">
                    {/* Active Tenant Scope Info Banner */}
                    <div className="bg-[#121212] border-b border-[#2a2a2a] px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="text-[#888888]">Current Gym Context:</span>
                            <span className="font-semibold text-white">{currentGym ? currentGym.name : 'Global System Scope'}</span>
                            <span className="font-mono text-[#faff69] text-[11px]">({currentGym?.code ?? 'SUPER_ROOT'})</span>
                            {currentGym && (
                                <Badge variant={currentGym.status === 'active' ? 'active' : 'inactive'} size="sm">
                                    {currentGym.status.toUpperCase()}
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center gap-4 text-[11px] text-[#888888]">
                            <span>Timezone: <strong className="text-[#e6e6e6]">{currentGym?.timezone ?? 'Asia/Jakarta'}</strong></span>
                            <span>Tenant Isolation: <strong className="text-[#22c55e]">ENFORCED</strong></span>
                        </div>
                    </div>

                    {/* Breadcrumbs & Header */}
                    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
                        {breadcrumbs && breadcrumbs.length > 0 && (
                            <nav className="flex items-center gap-1.5 text-xs text-[#888888] mb-3">
                                {breadcrumbs.map((crumb, idx) => (
                                    <React.Fragment key={crumb.label}>
                                        {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#5a5a5a]" />}
                                        {crumb.href ? (
                                            <Link href={crumb.href} className="hover:text-white transition-colors">
                                                {crumb.label}
                                            </Link>
                                        ) : (
                                            <span className="text-white font-medium">{crumb.label}</span>
                                        )}
                                    </React.Fragment>
                                ))}
                            </nav>
                        )}

                        {header && (
                            <div className="mb-6">
                                {renderHeader()}
                            </div>
                        )}

                        {/* Page Body */}
                        {children}
                    </div>
                </main>
            </div>

            <FlashMessage />
        </div>
    );
};