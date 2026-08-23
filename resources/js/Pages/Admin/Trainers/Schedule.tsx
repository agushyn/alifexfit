import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import {
    Calendar,
    ArrowLeft,
    Plus,
    Clock,
    CheckCircle2,
    XCircle,
    Edit2,
    Trash2,
    Sparkles,
    Save,
    Award
} from 'lucide-react';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Modal } from '@/Components/Modal';
import { Trainer, TrainerSchedule } from '@/types';

interface TrainersScheduleProps {
    trainer: Trainer;
    days: Record<number, string>;
}

export default function TrainersSchedule({ trainer, days }: TrainersScheduleProps) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<TrainerSchedule | null>(null);
    const [deletingSchedule, setDeletingSchedule] = useState<TrainerSchedule | null>(null);

    // Create form
    const createForm = useForm({
        day_of_week: 1,
        start_time: '08:00',
        end_time: '12:00',
        status: 'active',
        notes: '',
    });

    // Edit form
    const editForm = useForm({
        day_of_week: 1,
        start_time: '08:00',
        end_time: '12:00',
        status: 'active',
        notes: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(route('admin.trainers.schedules.store', trainer.id), {
            onSuccess: () => {
                setIsAddModalOpen(false);
                createForm.reset();
            },
        });
    };

    const handleOpenEdit = (schedule: TrainerSchedule) => {
        setEditingSchedule(schedule);
        editForm.setData({
            day_of_week: schedule.day_of_week,
            start_time: schedule.start_time.substring(0, 5),
            end_time: schedule.end_time.substring(0, 5),
            status: schedule.status,
            notes: schedule.notes || '',
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSchedule) return;
        editForm.put(route('admin.trainers.schedules.update', editingSchedule.id), {
            onSuccess: () => {
                setEditingSchedule(null);
            },
        });
    };

    const handleDelete = () => {
        if (!deletingSchedule) return;
        router.delete(route('admin.trainers.schedules.destroy', deletingSchedule.id), {
            onFinish: () => setDeletingSchedule(null),
        });
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Trainers', href: route('admin.trainers.index') },
                { label: trainer.name, href: route('admin.trainers.show', trainer.id) },
                { label: 'Schedule Management' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        {trainer.profile_photo_url ? (
                            <img
                                src={trainer.profile_photo_url}
                                alt={trainer.name}
                                className="w-14 h-14 rounded-xl object-cover border border-[#2a2a2a]"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-xl bg-[#242424] text-[#faff69] font-bold text-xl flex items-center justify-center border border-[#2a2a2a]">
                                {trainer.name.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <div>
                            <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                                <Calendar className="w-6 h-6 text-[#faff69]" />
                                Schedule: {trainer.name}
                            </h1>
                            <p className="text-xs text-[#888888] mt-1 flex items-center gap-2">
                                <span className="text-[#faff69] font-semibold">{trainer.specialization || 'Fitness Coach'}</span>
                                • Set weekly on-shift working windows.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('admin.trainers.show', trainer.id)}>
                            <Button variant="secondary" size="sm">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Detail
                            </Button>
                        </Link>
                        <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
                            <Plus className="w-4 h-4" />
                            Add Schedule Slot
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={`Schedule — ${trainer.name} — EXFITS Gym`} />

            <div className="space-y-6">
                {/* 7 Days Visual Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => {
                        const dayName = days[dayIndex] ?? `Day ${dayIndex}`;
                        const daySchedules = (trainer.schedules || []).filter(
                            (s) => s.day_of_week === dayIndex
                        );

                        return (
                            <Card
                                key={dayIndex}
                                variant="default"
                                className="p-4 flex flex-col justify-between min-h-[220px] bg-gradient-to-b from-[#1a1a1a] to-[#141414] border-[#2a2a2a]"
                            >
                                <div>
                                    <div className="flex items-center justify-between pb-2 border-b border-[#2a2a2a]">
                                        <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                                            {dayName}
                                        </span>
                                        <span className="text-[10px] font-mono text-[#888888]">
                                            {daySchedules.length} slots
                                        </span>
                                    </div>

                                    {/* Slots List */}
                                    <div className="mt-3 space-y-2">
                                        {daySchedules.length > 0 ? (
                                            daySchedules.map((schedule) => (
                                                <div
                                                    key={schedule.id}
                                                    className={`p-2.5 rounded-lg border text-xs group transition-colors ${
                                                        schedule.status === 'active'
                                                            ? 'bg-[#121212] border-[#2a2a2a] hover:border-[#faff69]/40'
                                                            : 'bg-[#181818] border-[#242424] opacity-60'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono font-bold text-white text-xs flex items-center gap-1">
                                                            <Clock className="w-3 h-3 text-[#faff69]" />
                                                            {schedule.formatted_time_range}
                                                        </span>
                                                        {schedule.status === 'active' ? (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
                                                        ) : (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
                                                        )}
                                                    </div>

                                                    {schedule.notes && (
                                                        <div className="text-[10px] text-[#888888] mt-1 truncate">
                                                            {schedule.notes}
                                                        </div>
                                                    )}

                                                    {/* Quick Slot Actions */}
                                                    <div className="mt-2 pt-1.5 border-t border-[#242424] flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEdit(schedule)}
                                                            className="p-1 rounded text-[#888888] hover:text-white hover:bg-[#242424] transition-colors"
                                                            title="Edit Slot"
                                                        >
                                                            <Edit2 className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingSchedule(schedule)}
                                                            className="p-1 rounded text-[#888888] hover:text-[#ef4444] hover:bg-[#ef4444]/15 transition-colors"
                                                            title="Delete Slot"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center text-[11px] text-[#5a5a5a] italic">
                                                No Shift
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-3 pt-2 border-t border-[#242424]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            createForm.setData('day_of_week', dayIndex);
                                            setIsAddModalOpen(true);
                                        }}
                                        className="w-full py-1.5 rounded text-[11px] font-semibold text-[#888888] hover:text-white hover:bg-[#242424] flex items-center justify-center gap-1 transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Add Slot
                                    </button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Add Schedule Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Availability Slot"
                description={`Configure a working shift for ${trainer.name}.`}
            >
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1">
                            Day of Week *
                        </label>
                        <select
                            value={createForm.data.day_of_week}
                            onChange={(e) => createForm.setData('day_of_week', parseInt(e.target.value))}
                            className="w-full h-10 px-3 bg-[#121212] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                        >
                            {Object.entries(days).map(([val, label]) => (
                                <option key={val} value={val}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        {createForm.errors.day_of_week && (
                            <p className="text-xs text-[#ef4444] mt-1">{createForm.errors.day_of_week}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1">
                                Start Time (HH:MM) *
                            </label>
                            <TextInput
                                type="time"
                                value={createForm.data.start_time}
                                onChange={(e) => createForm.setData('start_time', e.target.value)}
                                required
                            />
                            {createForm.errors.start_time && (
                                <p className="text-xs text-[#ef4444] mt-1">{createForm.errors.start_time}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1">
                                End Time (HH:MM) *
                            </label>
                            <TextInput
                                type="time"
                                value={createForm.data.end_time}
                                onChange={(e) => createForm.setData('end_time', e.target.value)}
                                required
                            />
                            {createForm.errors.end_time && (
                                <p className="text-xs text-[#ef4444] mt-1">{createForm.errors.end_time}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1">
                            Status *
                        </label>
                        <select
                            value={createForm.data.status}
                            onChange={(e) => createForm.setData('status', e.target.value)}
                            className="w-full h-10 px-3 bg-[#121212] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1">
                            Shift Notes
                        </label>
                        <TextInput
                            value={createForm.data.notes}
                            onChange={(e) => createForm.setData('notes', e.target.value)}
                            placeholder="e.g. Morning Shift, Weight room floor..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
                        <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="sm" type="submit" isLoading={createForm.processing}>
                            <Save className="w-4 h-4" />
                            Save Slot
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Edit Schedule Modal */}
            <Modal
                isOpen={!!editingSchedule}
                onClose={() => setEditingSchedule(null)}
                title="Edit Availability Slot"
                description={`Update shift time window for ${trainer.name}.`}
            >
                <form onSubmit={handleUpdate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1">
                            Day of Week *
                        </label>
                        <select
                            value={editForm.data.day_of_week}
                            onChange={(e) => editForm.setData('day_of_week', parseInt(e.target.value))}
                            className="w-full h-10 px-3 bg-[#121212] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                        >
                            {Object.entries(days).map(([val, label]) => (
                                <option key={val} value={val}>
                                    {label}
                                </option>
                            ))}
                        </select>
                        {editForm.errors.day_of_week && (
                            <p className="text-xs text-[#ef4444] mt-1">{editForm.errors.day_of_week}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1">
                                Start Time (HH:MM) *
                            </label>
                            <TextInput
                                type="time"
                                value={editForm.data.start_time}
                                onChange={(e) => editForm.setData('start_time', e.target.value)}
                                required
                            />
                            {editForm.errors.start_time && (
                                <p className="text-xs text-[#ef4444] mt-1">{editForm.errors.start_time}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1">
                                End Time (HH:MM) *
                            </label>
                            <TextInput
                                type="time"
                                value={editForm.data.end_time}
                                onChange={(e) => editForm.setData('end_time', e.target.value)}
                                required
                            />
                            {editForm.errors.end_time && (
                                <p className="text-xs text-[#ef4444] mt-1">{editForm.errors.end_time}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1">
                            Status *
                        </label>
                        <select
                            value={editForm.data.status}
                            onChange={(e) => editForm.setData('status', e.target.value)}
                            className="w-full h-10 px-3 bg-[#121212] text-white text-xs rounded-lg border border-[#2a2a2a] focus:ring-1 focus:ring-[#faff69] focus:border-[#faff69]"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1">
                            Shift Notes
                        </label>
                        <TextInput
                            value={editForm.data.notes}
                            onChange={(e) => editForm.setData('notes', e.target.value)}
                            placeholder="e.g. Morning Shift, Weight room floor..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
                        <Button variant="secondary" size="sm" type="button" onClick={() => setEditingSchedule(null)}>
                            Cancel
                        </Button>
                        <Button variant="primary" size="sm" type="submit" isLoading={editForm.processing}>
                            <Save className="w-4 h-4" />
                            Update Slot
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Schedule Confirmation Modal */}
            <Modal
                isOpen={!!deletingSchedule}
                onClose={() => setDeletingSchedule(null)}
                title="Delete Availability Slot"
                description="Are you sure you want to remove this schedule slot?"
            >
                <div className="space-y-4">
                    <p className="text-xs text-[#cccccc]">
                        Day: <strong className="text-white">{days[deletingSchedule?.day_of_week ?? 0]}</strong> ({deletingSchedule?.formatted_time_range})
                    </p>

                    <div className="flex justify-end gap-3 pt-4 border-t border-[#2a2a2a]">
                        <Button variant="secondary" size="sm" onClick={() => setDeletingSchedule(null)}>
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
