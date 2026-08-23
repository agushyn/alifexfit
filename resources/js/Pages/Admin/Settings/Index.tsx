import React, { useState, useEffect, FormEventHandler } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Settings,
    Building2,
    Globe,
    Shield,
    Save,
    Clock,
    DollarSign,
    Layers,
    Server,
    Camera,
    Video,
    Play,
    Square
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { AuthenticatedLayout } from '@/Layouts/AuthenticatedLayout';
import { Card } from '@/Components/Card';
import { Button } from '@/Components/Button';
import { TextInput } from '@/Components/TextInput';
import { Badge } from '@/Components/Badge';
import { GymSetting, PageProps } from '@/types';

interface SettingsIndexProps {
    gymSettings: GymSetting[];
    systemSettings: GymSetting[];
}

interface CameraDevice {
    id: string;
    label: string;
}

export default function SettingsIndex({ gymSettings, systemSettings }: SettingsIndexProps) {
    const { auth, gym } = usePage<PageProps>().props;
    const isSuperAdmin = auth.user?.is_super_admin ?? false;
    const currentGym = gym.current;

    const [activeTab, setActiveTab] = useState<'general' | 'kiosk' | 'business' | 'website' | 'system'>('general');
    const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
    const [isTestingCamera, setIsTestingCamera] = useState<boolean>(false);
    const [testError, setTestError] = useState<string | null>(null);

    // Helper to find setting value
    const findSetting = (settings: GymSetting[], group: string, key: string, fallback = '') => {
        const found = settings.find((s) => s.group === group && s.key === key);
        return found?.value ?? fallback;
    };

    const { data, setData, post, processing } = useForm({
        gym_id: currentGym?.id ?? null,
        settings: [
            // General
            { group: 'general', key: 'operating_hours', value: findSetting(gymSettings, 'general', 'operating_hours', '06:00 - 22:00 WIB') },
            { group: 'general', key: 'facility_capacity', value: findSetting(gymSettings, 'general', 'facility_capacity', '150') },
            { group: 'general', key: 'emergency_contact', value: findSetting(gymSettings, 'general', 'emergency_contact', '+62 811 999 888') },
            // Kiosk & Camera Scanner
            { group: 'kiosk', key: 'scanner_camera_source', value: findSetting(gymSettings, 'kiosk', 'scanner_camera_source', 'auto') },
            { group: 'kiosk', key: 'scanner_camera_device_id', value: findSetting(gymSettings, 'kiosk', 'scanner_camera_device_id', localStorage.getItem('exfits_kiosk_camera_device_id') || '') },
            { group: 'kiosk', key: 'scanner_camera_resolution', value: findSetting(gymSettings, 'kiosk', 'scanner_camera_resolution', 'auto') },
            // Business
            { group: 'business', key: 'currency', value: findSetting(gymSettings, 'business', 'currency', 'IDR') },
            { group: 'business', key: 'tax_percentage', value: findSetting(gymSettings, 'business', 'tax_percentage', '11') },
            { group: 'business', key: 'invoice_prefix', value: findSetting(gymSettings, 'business', 'invoice_prefix', 'INV-EXF') },
            // Website
            { group: 'website', key: 'hero_tagline', value: findSetting(gymSettings, 'website', 'hero_tagline', 'Elevate Your Fitness & Strength') },
            { group: 'website', key: 'instagram_handle', value: findSetting(gymSettings, 'website', 'instagram_handle', '@exfits_gym') },
            // System (Global)
            { group: 'system', key: 'maintenance_mode', value: findSetting(systemSettings, 'system', 'maintenance_mode', 'false') },
            { group: 'system', key: 'security_enforce_2fa', value: findSetting(systemSettings, 'system', 'security_enforce_2fa', 'false') },
        ],
    });

    // Enumerate cameras when kiosk tab is viewed
    useEffect(() => {
        if (activeTab === 'kiosk') {
            Html5Qrcode.getCameras()
                .then((devices) => {
                    if (devices && devices.length > 0) {
                        setAvailableCameras(
                            devices.map((d, index) => ({
                                id: d.id,
                                label: d.label || `Camera ${index + 1} (${d.id.substring(0, 8)})`,
                            }))
                        );
                    }
                })
                .catch(() => {
                    setAvailableCameras([]);
                });
        }
    }, [activeTab]);

    const updateSettingValue = (group: string, key: string, value: string) => {
        setData('settings', data.settings.map((s) => (s.group === group && s.key === key ? { ...s, value } : s)));
        if (group === 'kiosk' && key === 'scanner_camera_device_id') {
            localStorage.setItem('exfits_kiosk_camera_device_id', value);
        }
    };

    const getSettingValue = (group: string, key: string) => {
        return data.settings.find((s) => s.group === group && s.key === key)?.value ?? '';
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    // Camera test helper
    const handleToggleTestCamera = async () => {
        if (isTestingCamera) {
            setIsTestingCamera(false);
            setTestError(null);
            return;
        }

        setIsTestingCamera(true);
        setTestError(null);

        setTimeout(async () => {
            try {
                const container = document.getElementById('settings-camera-test');
                if (!container) return;

                const deviceId = getSettingValue('kiosk', 'scanner_camera_device_id') || availableCameras[0]?.id;
                if (!deviceId) {
                    setTestError('No camera device available for testing.');
                    return;
                }

                const scanner = new Html5Qrcode('settings-camera-test');
                await scanner.start(deviceId, { fps: 15, qrbox: 200 }, () => {}, () => {});
            } catch (err: any) {
                setTestError('Camera test failed: ' + (err?.message || 'Permission denied'));
            }
        }, 100);
    };

    return (
        <AuthenticatedLayout
            breadcrumbs={[
                { label: 'Dashboard', href: route('admin.dashboard') },
                { label: 'Settings' },
            ]}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                            <Settings className="w-6 h-6 text-[#faff69]" />
                            Configuration & Settings
                        </h1>
                        <p className="text-xs text-[#888888] mt-1">
                            Tenant-scoped key-value configuration repository.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="pill" size="sm">
                            <Building2 className="w-3.5 h-3.5 text-[#faff69]" />
                            Scope: {currentGym ? currentGym.name : 'System Global'}
                        </Badge>
                    </div>
                </div>
            }
        >
            <Head title="Settings — EXFITS Gym" />

            <div className="space-y-6">
                {/* Horizontal Navigation Tabs */}
                <div className="flex items-center gap-2 border-b border-[#2a2a2a] pb-3 overflow-x-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab('general')}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'general'
                                ? 'bg-[#1a1a1a] text-[#faff69] border border-[#2a2a2a]'
                                : 'text-[#888888] hover:text-white hover:bg-[#121212]'
                        }`}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        General & Facility
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('kiosk')}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'kiosk'
                                ? 'bg-[#1a1a1a] text-[#faff69] border border-[#2a2a2a]'
                                : 'text-[#888888] hover:text-white hover:bg-[#121212]'
                        }`}
                    >
                        <Camera className="w-3.5 h-3.5" />
                        Scanner & Kiosk Camera
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('business')}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'business'
                                ? 'bg-[#1a1a1a] text-[#faff69] border border-[#2a2a2a]'
                                : 'text-[#888888] hover:text-white hover:bg-[#121212]'
                        }`}
                    >
                        <DollarSign className="w-3.5 h-3.5" />
                        Business & Billing
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('website')}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                            activeTab === 'website'
                                ? 'bg-[#1a1a1a] text-[#faff69] border border-[#2a2a2a]'
                                : 'text-[#888888] hover:text-white hover:bg-[#121212]'
                        }`}
                    >
                        <Globe className="w-3.5 h-3.5" />
                        Website & Branding
                    </button>

                    {isSuperAdmin && (
                        <button
                            type="button"
                            onClick={() => setActiveTab('system')}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
                                activeTab === 'system'
                                    ? 'bg-[#1a1a1a] text-[#faff69] border border-[#2a2a2a]'
                                    : 'text-[#888888] hover:text-white hover:bg-[#121212]'
                            }`}
                        >
                            <Server className="w-3.5 h-3.5" />
                            System Global
                        </button>
                    )}
                </div>

                {/* Form Container */}
                <form onSubmit={submit}>
                    <Card variant="default">
                        {activeTab === 'general' && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Facility & Operations</h3>
                                    <p className="text-xs text-[#888888] mt-0.5">Parameters applied to current active gym branch.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <TextInput
                                        label="Operating Hours"
                                        value={getSettingValue('general', 'operating_hours')}
                                        onChange={(e) => updateSettingValue('general', 'operating_hours', e.target.value)}
                                        placeholder="06:00 - 22:00 WIB"
                                        helperText="Shown on dashboard and member schedules"
                                    />

                                    <TextInput
                                        label="Max Facility Capacity"
                                        type="number"
                                        value={getSettingValue('general', 'facility_capacity')}
                                        onChange={(e) => updateSettingValue('general', 'facility_capacity', e.target.value)}
                                        placeholder="150"
                                        helperText="Headcount limit for attendance gate checks"
                                    />
                                </div>

                                <TextInput
                                    label="Emergency Contact Number"
                                    value={getSettingValue('general', 'emergency_contact')}
                                    onChange={(e) => updateSettingValue('general', 'emergency_contact', e.target.value)}
                                    placeholder="+62 811 ..."
                                />
                            </div>
                        )}

                        {activeTab === 'kiosk' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Scanner Camera & Kiosk Gate</h3>
                                    <p className="text-xs text-[#888888] mt-0.5">Configure the primary optical camera used by the gate turnstile kiosk.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">
                                            Camera Source Mode
                                        </label>
                                        <select
                                            value={getSettingValue('kiosk', 'scanner_camera_source')}
                                            onChange={(e) => updateSettingValue('kiosk', 'scanner_camera_source', e.target.value)}
                                            className="w-full h-10 px-3 text-xs font-medium bg-[#141414] text-white rounded-xl border border-[#2a2a2a] focus:border-[#faff69] focus:outline-none"
                                        >
                                            <option value="auto">Automatic (Default)</option>
                                            <option value="builtin">Built-in Webcam</option>
                                            <option value="usb">USB Webcam (UVC)</option>
                                        </select>
                                        <p className="text-[11px] text-[#666666] mt-1">Automatic switches seamlessly between devices.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">
                                            Selected Camera Device
                                        </label>
                                        <select
                                            value={getSettingValue('kiosk', 'scanner_camera_device_id')}
                                            onChange={(e) => updateSettingValue('kiosk', 'scanner_camera_device_id', e.target.value)}
                                            className="w-full h-10 px-3 text-xs font-medium bg-[#141414] text-white rounded-xl border border-[#2a2a2a] focus:border-[#faff69] focus:outline-none"
                                        >
                                            <option value="">Default System Camera</option>
                                            {availableCameras.map((cam) => (
                                                <option key={cam.id} value={cam.id}>
                                                    {cam.label}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-[11px] text-[#666666] mt-1">{availableCameras.length} camera(s) detected by browser.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">
                                            Scanner Resolution
                                        </label>
                                        <select
                                            value={getSettingValue('kiosk', 'scanner_camera_resolution')}
                                            onChange={(e) => updateSettingValue('kiosk', 'scanner_camera_resolution', e.target.value)}
                                            className="w-full h-10 px-3 text-xs font-medium bg-[#141414] text-white rounded-xl border border-[#2a2a2a] focus:border-[#faff69] focus:outline-none"
                                        >
                                            <option value="auto">Auto (Recommended)</option>
                                            <option value="720p">1280 × 720 (HD)</option>
                                            <option value="1080p">1920 × 1080 (FHD)</option>
                                            <option value="480p">640 × 480 (SD)</option>
                                        </select>
                                        <p className="text-[11px] text-[#666666] mt-1">Balances optical scan speed and camera CPU usage.</p>
                                    </div>
                                </div>

                                {/* Test Camera Mode Block */}
                                <div className="p-4 rounded-2xl bg-[#141414] border border-[#2a2a2a] space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                                                <Video className="w-4 h-4 text-[#faff69]" />
                                                Camera Live Preview & Alignment Test
                                            </h4>
                                            <p className="text-[11px] text-[#888888] mt-0.5">
                                                Test optical framing without creating attendance or check-in records.
                                            </p>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={handleToggleTestCamera}
                                        >
                                            {isTestingCamera ? <Square className="w-3.5 h-3.5 mr-1.5" /> : <Play className="w-3.5 h-3.5 mr-1.5" />}
                                            {isTestingCamera ? 'Stop Preview' : 'Test Camera'}
                                        </Button>
                                    </div>

                                    {isTestingCamera && (
                                        <div className="space-y-3">
                                            <div className="relative w-full max-w-sm aspect-square mx-auto bg-[#0a0a0a] rounded-2xl overflow-hidden border border-[#2a2a2a]">
                                                <div id="settings-camera-test" className="w-full h-full" />
                                            </div>

                                            {testError && (
                                                <p className="text-xs text-[#ef4444] text-center">{testError}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'business' && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Business & Invoicing</h3>
                                    <p className="text-xs text-[#888888] mt-0.5">Billing parameters applied to generated invoices and receipts.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                    <TextInput
                                        label="Currency ISO"
                                        value={getSettingValue('business', 'currency')}
                                        onChange={(e) => updateSettingValue('business', 'currency', e.target.value)}
                                        placeholder="IDR"
                                    />

                                    <TextInput
                                        label="Tax Percentage (%)"
                                        type="number"
                                        value={getSettingValue('business', 'tax_percentage')}
                                        onChange={(e) => updateSettingValue('business', 'tax_percentage', e.target.value)}
                                        placeholder="11"
                                    />

                                    <TextInput
                                        label="Invoice Number Prefix"
                                        value={getSettingValue('business', 'invoice_prefix')}
                                        onChange={(e) => updateSettingValue('business', 'invoice_prefix', e.target.value)}
                                        placeholder="INV-EXF"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'website' && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Public Website Customization</h3>
                                    <p className="text-xs text-[#888888] mt-0.5">Content displayed on the public landing page for this gym.</p>
                                </div>

                                <TextInput
                                    label="Hero Banner Tagline"
                                    value={getSettingValue('website', 'hero_tagline')}
                                    onChange={(e) => updateSettingValue('website', 'hero_tagline', e.target.value)}
                                    placeholder="Elevate Your Fitness..."
                                />

                                <TextInput
                                    label="Instagram Handle"
                                    value={getSettingValue('website', 'instagram_handle')}
                                    onChange={(e) => updateSettingValue('website', 'instagram_handle', e.target.value)}
                                    placeholder="@exfits_gym"
                                />
                            </div>
                        )}

                        {activeTab === 'system' && isSuperAdmin && (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">System-Wide Global Flags</h3>
                                    <p className="text-xs text-[#888888] mt-0.5">Cross-tenant operational controls (Super Admin only).</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">
                                            Maintenance Mode
                                        </label>
                                        <select
                                            value={getSettingValue('system', 'maintenance_mode')}
                                            onChange={(e) => updateSettingValue('system', 'maintenance_mode', e.target.value)}
                                            className="w-full h-10 px-3 text-xs font-medium bg-[#141414] text-white rounded-xl border border-[#2a2a2a] focus:border-[#faff69] focus:outline-none"
                                        >
                                            <option value="false">Operational / Active</option>
                                            <option value="true">Maintenance Lockdown</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">
                                            Enforce 2FA for Staff
                                        </label>
                                        <select
                                            value={getSettingValue('system', 'security_enforce_2fa')}
                                            onChange={(e) => updateSettingValue('system', 'security_enforce_2fa', e.target.value)}
                                            className="w-full h-10 px-3 text-xs font-medium bg-[#141414] text-white rounded-xl border border-[#2a2a2a] focus:border-[#faff69] focus:outline-none"
                                        >
                                            <option value="false">Disabled / Optional</option>
                                            <option value="true">Enforced</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Submit Action */}
                        <div className="mt-8 pt-4 border-t border-[#2a2a2a] flex items-center justify-end">
                            <Button
                                type="submit"
                                variant="primary"
                                isLoading={processing}
                                className="inline-flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Save Configuration
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}