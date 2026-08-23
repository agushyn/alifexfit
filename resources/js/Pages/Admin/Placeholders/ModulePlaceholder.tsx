import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Sparkles, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { Badge } from '@/Components/Badge';

interface PlaceholderProps {
    moduleKey: string;
    config: {
        title: string;
        phase: string;
        description: string;
        features: string[];
    };
}

export default function ModulePlaceholder({ moduleKey, config }: PlaceholderProps) {
    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: config.title },
            ]}
            header={
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
                            {config.title}
                            <Badge variant="phase" size="sm">{config.phase}</Badge>
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">{config.description}</p>
                    </div>

                    <Link href={route('admin.dashboard')}>
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title={`${config.title} — EXFITS Gym`} />

            <div className="max-w-3xl space-y-6">
                <Card variant="elevated" className="border-l-4 border-l-[#faff69]">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] text-[#faff69]">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <h2 className="text-lg font-bold text-white">Module Foundation Ready</h2>
                            <p className="text-xs text-[#cccccc] leading-relaxed">
                                This business module is scheduled for implementation in <strong>{config.phase}</strong>. Phase 1 provides the underlying Gym entity, multi-tenant scoping, permissions architecture, and role policies to support this feature seamlessly.
                            </p>
                        </div>
                    </div>
                </Card>

                <Card variant="default">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-3">
                        Planned Core Functionality in {config.phase}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {config.features.map((feature, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-[#242424] border border-[#3a3a3a] flex items-center gap-2.5 text-xs text-white">
                                <CheckCircle2 className="w-4 h-4 text-[#faff69] flex-shrink-0" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="p-4 rounded-xl bg-[#121212] border border-[#2a2a2a] text-xs text-[#888888] flex items-center gap-3">
                    <ShieldAlert className="w-5 h-5 text-[#faff69] flex-shrink-0" />
                    <span>
                        Per Phase 1 architectural rules, business transactions and modules from subsequent phases remain strictly placeholder-bound until Phase 1 foundation is locked and verified.
                    </span>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}