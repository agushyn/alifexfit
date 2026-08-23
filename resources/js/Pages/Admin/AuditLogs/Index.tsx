import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Shield, Search, Filter, Eye, Clock, Terminal } from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Badge } from '@/Components/Badge';
import { Modal } from '@/Components/Modal';
import { AuditLog, PaginatedData, PageProps } from '@/types';

interface AuditLogsIndexProps {
    logs: PaginatedData<AuditLog>;
    filters: {
        action?: string;
        search?: string;
    };
}

export default function AuditLogsIndex({ logs, filters }: AuditLogsIndexProps) {
    const { auth } = usePage<PageProps>().props;
    const isSuperAdmin = auth.user?.is_super_admin ?? false;
    const [search, setSearch] = useState(filters.search || '');
    const [actionFilter, setActionFilter] = useState(filters.action || '');
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.audit-logs.index'), { search, action: actionFilter }, { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Audit Logs' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <Shield className="w-6 h-6 text-[#faff69]" />
                            Security & Operational Audit Trail
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Tamper-resistant audit logs tracking logins, tenant modifications, and data changes.
                        </p>
                    </div>

                    <Badge variant="pill" size="sm">
                        <Terminal className="w-3.5 h-3.5 text-[#faff69]" />
                        {logs.total} Total Records
                    </Badge>
                </div>
            }
        >
            <Head title="Audit Logs — EXFITS Gym" />

            <div className="space-y-6">
                {/* Search & Filter */}
                <Card variant="default" className="p-4">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex-1 w-full">
                            <TextInput
                                placeholder="Search by action, user name, email, IP..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                icon={<Search className="w-4 h-4" />}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select
                                value={actionFilter}
                                onChange={(e) => {
                                    setActionFilter(e.target.value);
                                    router.get(route('admin.audit-logs.index'), { search, action: e.target.value }, { preserveState: true });
                                }}
                                className="h-10 px-3 bg-[#1a1a1a] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                            >
                                <option value="">All Actions</option>
                                <option value="auth.login">auth.login</option>
                                <option value="auth.logout">auth.logout</option>
                                <option value="gym.created">gym.created</option>
                                <option value="gym.updated">gym.updated</option>
                                <option value="gym.switch_context">gym.switch_context</option>
                                <option value="settings.updated">settings.updated</option>
                            </select>

                            <Button type="submit" variant="secondary" size="md">
                                Filter
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Audit Logs Table */}
                <Card variant="default" className="p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#121212] border-b border-[#2a2a2a] text-[#888888] uppercase tracking-wider font-semibold">
                                <tr>
                                    <th className="px-6 py-3.5">Timestamp</th>
                                    <th className="px-6 py-3.5">Action</th>
                                    <th className="px-6 py-3.5">Actor User</th>
                                    <th className="px-6 py-3.5">Tenant Scope</th>
                                    <th className="px-6 py-3.5">IP Address</th>
                                    <th className="px-6 py-3.5 text-right">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2a2a2a]/60">
                                {logs.data.length > 0 ? (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-[#1a1a1a] transition-colors">
                                            <td className="px-6 py-3.5 font-mono text-[#888888]">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>

                                            <td className="px-6 py-3.5">
                                                <span className="font-mono font-bold text-[#faff69] px-2 py-0.5 rounded bg-[#242424] border border-[#3a3a3a]">
                                                    {log.action}
                                                </span>
                                            </td>

                                            <td className="px-6 py-3.5">
                                                <div className="font-semibold text-white">{log.user?.name ?? 'System'}</div>
                                                <div className="text-[11px] text-[#888888]">{log.user?.email ?? 'N/A'}</div>
                                            </td>

                                            <td className="px-6 py-3.5">
                                                {log.gym ? (
                                                    <div>
                                                        <span className="font-semibold text-white">{log.gym.name}</span>
                                                        <span className="text-[10px] font-mono text-[#888888] ml-1">({log.gym.code})</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[#888888] font-mono">GLOBAL / NULL</span>
                                                )}
                                            </td>

                                            <td className="px-6 py-3.5 font-mono text-[#cccccc]">
                                                {log.ip_address ?? '127.0.0.1'}
                                            </td>

                                            <td className="px-6 py-3.5 text-right">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => setSelectedLog(log)}
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View Metadata
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-[#888888]">
                                            No audit records found matching criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Metadata Modal */}
            <Modal
                isOpen={selectedLog !== null}
                onClose={() => setSelectedLog(null)}
                title={`Audit Log #${selectedLog?.id}`}
                description={`Action: ${selectedLog?.action} recorded at ${selectedLog ? new Date(selectedLog.created_at).toLocaleString() : ''}`}
                maxWidth="lg"
            >
                {selectedLog && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-xs bg-[#242424] p-3 rounded-lg border border-[#3a3a3a]">
                            <div>
                                <span className="text-[#888888]">Actor:</span>{' '}
                                <strong className="text-white">{selectedLog.user?.name ?? 'System'}</strong>
                            </div>
                            <div>
                                <span className="text-[#888888]">IP Address:</span>{' '}
                                <span className="font-mono text-white">{selectedLog.ip_address ?? 'N/A'}</span>
                            </div>
                            <div>
                                <span className="text-[#888888]">Entity:</span>{' '}
                                <span className="font-mono text-white">{selectedLog.entity_type ?? 'N/A'} #{selectedLog.entity_id ?? ''}</span>
                            </div>
                            <div>
                                <span className="text-[#888888]">Tenant Gym ID:</span>{' '}
                                <span className="font-mono text-white">{selectedLog.gym_id ?? 'GLOBAL'}</span>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs font-semibold text-[#888888] uppercase tracking-wider block mb-1.5">
                                Raw JSON Metadata Payload
                            </span>
                            <pre className="p-3.5 bg-[#0a0a0a] text-[#faff69] border border-[#2a2a2a] rounded-lg font-mono text-xs overflow-x-auto max-h-64">
                                {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                            </pre>
                        </div>

                        <div className="flex justify-end pt-2">
                            <Button variant="secondary" size="sm" onClick={() => setSelectedLog(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}