import React, { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Activity, Save, ArrowLeft } from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';

export default function WorkoutCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        category: 'Strength',
        description: '',
        status: 'active',
        sort_order: 0,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.workout-types.store'));
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Workout Types', href: route('admin.workout-types.index') },
                { label: 'Add Workout Type' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <Activity className="w-6 h-6 text-[#faff69]" />
                            Add Workout Type
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Configure an exercise discipline or training category for this gym branch.
                        </p>
                    </div>

                    <Link href={route('admin.workout-types.index')}>
                        <Button variant="secondary" size="sm">
                            <ArrowLeft className="w-4 h-4" />
                            Back to Workout Types
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Add Workout Type — EXFITS Gym" />

            <form onSubmit={submit} className="max-w-2xl space-y-6">
                <Card variant="default">
                    <div className="space-y-4">
                        <TextInput
                            label="Workout Discipline Name *"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            error={errors.name}
                            placeholder="e.g. Functional Training, HIIT, Powerlifting"
                            required
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                    Discipline Category
                                </label>
                                <select
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    className="w-full h-10 px-3 bg-[#1a1a1a] text-white text-sm rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                >
                                    <option value="Strength">Strength & Hypertrophy</option>
                                    <option value="Cardio">Cardiovascular & Endurance</option>
                                    <option value="HIIT">HIIT & Circuit</option>
                                    <option value="Mobility">Mobility & Recovery</option>
                                    <option value="Functional">Functional & Athletic</option>
                                    <option value="Combat">Boxing & Combat</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                    Status *
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="w-full h-10 px-3 bg-[#1a1a1a] text-white text-sm rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-[#888888] mb-1.5">
                                Description
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 bg-[#1a1a1a] text-white placeholder-[#5a5a5a] text-sm rounded-lg border border-[#2a2a2a] focus:outline-none focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                                placeholder="Summary of workouts, equipment involved, or muscle groups targeted..."
                            />
                            {errors.description && <p className="mt-1 text-xs text-[#ef4444]">{errors.description}</p>}
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end gap-3">
                    <Link href={route('admin.workout-types.index')}>
                        <Button type="button" variant="secondary">
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" variant="primary" isLoading={processing}>
                        <Save className="w-4 h-4" />
                        Save Workout Type
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}