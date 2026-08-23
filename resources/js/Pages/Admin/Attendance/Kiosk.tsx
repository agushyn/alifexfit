import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    QrCode,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Clock,
    User,
    LogOut,
    Camera,
    CameraOff,
    RefreshCw,
    Sliders,
    Video,
    AlertCircle,
    Play,
    Square
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { Badge } from '@/Components/Badge';
import { Button } from '@/Components/Button';

interface KioskProps {
    stats: {
        in_gym: number;
        today: number;
    };
}

interface ScanResult {
    member: {
        id: number;
        member_number: string;
        full_name: string;
        profile_photo_url?: string | null;
    };
    membership: {
        id: number;
        start_date: string;
        end_date: string;
        membership_plan?: {
            name: string;
        };
    };
    attendance: {
        id: number;
        check_in_at: string;
    };
    remaining_trainer_quota?: number;
}

interface CameraDevice {
    id: string;
    label: string;
}

export default function AttendanceKiosk({ stats }: KioskProps) {
    const [currentTime, setCurrentTime] = useState<string>('');
    const [currentDate, setCurrentDate] = useState<string>('');
    const [inputValue, setInputValue] = useState<string>('');
    const [mode, setMode] = useState<'check_in' | 'check_out'>('check_in');
    const [status, setStatus] = useState<'waiting' | 'validating' | 'success' | 'error'>('waiting');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successData, setSuccessData] = useState<ScanResult | null>(null);
    const [checkoutMemberName, setCheckoutMemberName] = useState<string>('');
    const [countdown, setCountdown] = useState<number>(5);
    const [liveInGymCount, setLiveInGymCount] = useState<number>(stats.in_gym);

    // Camera scanner state
    const [scannerMode, setScannerMode] = useState<'camera' | 'manual'>('camera');
    const [cameras, setCameras] = useState<CameraDevice[]>([]);
    const [selectedCameraId, setSelectedCameraId] = useState<string>('');
    const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const [isTestingCamera, setIsTestingCamera] = useState<boolean>(false);
    const [testResolution, setTestResolution] = useState<string>('Auto');

    const inputRef = useRef<HTMLInputElement>(null);
    const qrScannerRef = useRef<Html5Qrcode | null>(null);
    const isProcessingRef = useRef<boolean>(false);

    // Clock
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            setCurrentDate(now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, []);

    // Enumerate Available Camera Devices
    useEffect(() => {
        let mounted = true;

        const loadCameras = async () => {
            try {
                const devices = await Html5Qrcode.getCameras();
                if (!mounted) return;

                if (devices && devices.length > 0) {
                    const formatted = devices.map((d, index) => ({
                        id: d.id,
                        label: d.label || `Camera ${index + 1} (${d.id.substring(0, 8)})`,
                    }));
                    setCameras(formatted);

                    // Check persisted camera
                    const savedId = localStorage.getItem('exfits_kiosk_camera_device_id');
                    const exists = formatted.some((c) => c.id === savedId);
                    const defaultId = exists && savedId ? savedId : formatted[0].id;
                    setSelectedCameraId(defaultId);
                } else {
                    setCameras([]);
                    setCameraError('No camera devices detected.');
                }
            } catch (err: any) {
                if (!mounted) return;
                console.warn('Camera enumeration error:', err);
                setCameraError('Camera access required or permission denied.');
            }
        };

        loadCameras();

        // Listen for USB device connection / disconnection
        const handleDeviceChange = () => {
            loadCameras();
        };

        navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);

        return () => {
            mounted = false;
            navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
        };
    }, []);

    // Camera Lifecycle (Start/Stop scanner)
    useEffect(() => {
        if (scannerMode !== 'camera' || status !== 'waiting' || isTestingCamera) {
            stopCamera();
            return;
        }

        if (selectedCameraId && !isCameraActive) {
            startCamera(selectedCameraId);
        }

        return () => {
            stopCamera();
        };
    }, [scannerMode, status, selectedCameraId, isTestingCamera]);

    // Handle auto-reset countdown on success or error
    useEffect(() => {
        if (status === 'success' || status === 'error') {
            const totalDuration = status === 'success' ? 5 : 4;
            setCountdown(totalDuration);

            const interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        resetToWaiting();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [status]);

    const startCamera = async (cameraId: string) => {
        try {
            setCameraError(null);

            if (qrScannerRef.current) {
                await stopCamera();
            }

            // Ensure container exists
            const container = document.getElementById('kiosk-camera-reader');
            if (!container) return;

            const scanner = new Html5Qrcode('kiosk-camera-reader');
            qrScannerRef.current = scanner;

            const config = {
                fps: 15,
                qrbox: { width: 220, height: 220 },
                aspectRatio: 1.0,
            };

            await scanner.start(
                cameraId,
                config,
                (decodedText) => {
                    handleQrCodeScanned(decodedText);
                },
                () => {
                    // Ignore transient frame decode miss
                }
            );

            setIsCameraActive(true);
            setCameraError(null);
        } catch (err: any) {
            console.error('Failed to start camera:', err);
            setIsCameraActive(false);
            const msg = err?.message || 'Camera permission denied or camera is in use.';
            setCameraError(msg);
        }
    };

    const stopCamera = async () => {
        if (qrScannerRef.current) {
            try {
                if (qrScannerRef.current.isScanning) {
                    await qrScannerRef.current.stop();
                }
                await qrScannerRef.current.clear();
            } catch (e) {
                // Ignore stop errors on unmount
            } finally {
                qrScannerRef.current = null;
                setIsCameraActive(false);
            }
        }
    };

    const handleCameraSwitch = async (cameraId: string) => {
        setSelectedCameraId(cameraId);
        localStorage.setItem('exfits_kiosk_camera_device_id', cameraId);

        if (scannerMode === 'camera' && !isTestingCamera) {
            await stopCamera();
            await startCamera(cameraId);
        }
    };

    const resetToWaiting = () => {
        isProcessingRef.current = false;
        setStatus('waiting');
        setInputValue('');
        setErrorMessage('');
        setSuccessData(null);
        setCheckoutMemberName('');
        if (scannerMode === 'manual') {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const getCsrfToken = () => {
        const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (metaToken) return metaToken;
        const match = document.cookie.match(new RegExp('(^|;\\s*)XSRF-TOKEN=([^;]*)'));
        return match ? decodeURIComponent(match[2]) : '';
    };

    const processAttendance = async (rawCode: string) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        // Temporarily pause camera scanning while validating
        if (qrScannerRef.current && qrScannerRef.current.isScanning) {
            try {
                await qrScannerRef.current.pause();
            } catch (_) {}
        }

        setStatus('validating');

        try {
            const url = mode === 'check_in'
                ? route('admin.attendance.checkin')
                : route('api.attendance.checkout');

            const payload = mode === 'check_in'
                ? { member_number: rawCode, source: 'kiosk', device_identifier: 'kiosk_camera_scanner' }
                : { member_number: rawCode, notes: 'Kiosk camera check-out' };

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-XSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok && data?.success) {
                if (mode === 'check_in') {
                    setSuccessData(data.data);
                    setStatus('success');
                    setLiveInGymCount((prev) => prev + 1);
                } else {
                    setCheckoutMemberName(data.data?.member?.full_name || rawCode);
                    setStatus('success');
                    setLiveInGymCount((prev) => Math.max(0, prev - 1));
                }
            } else {
                const msg = data?.message
                    || data?.errors?.member_number?.[0]
                    || data?.errors?.attendance?.[0]
                    || 'Check-in gagal.';
                setErrorMessage(msg);
                setStatus('error');
            }
        } catch (err: any) {
            setErrorMessage('Terjadi kesalahan koneksi saat memproses verifikasi QR.');
            setStatus('error');
        }
    };

    const handleQrCodeScanned = (decodedText: string) => {
        if (status !== 'waiting' || isProcessingRef.current) return;
        processAttendance(decodedText.trim());
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const code = inputValue.trim();
        if (!code || status === 'validating') return;
        processAttendance(code);
    };

    // Camera Test Mode
    const startCameraTest = async () => {
        setIsTestingCamera(true);
        await stopCamera();

        setTimeout(async () => {
            try {
                const container = document.getElementById('camera-test-preview');
                if (!container) return;

                const scanner = new Html5Qrcode('camera-test-preview');
                qrScannerRef.current = scanner;

                await scanner.start(
                    selectedCameraId,
                    { fps: 15, qrbox: 200 },
                    () => {},
                    () => {}
                );
                setIsCameraActive(true);
                setTestResolution('1280 × 720 (Live Feed Active)');
            } catch (e: any) {
                setCameraError('Failed to start test preview: ' + e?.message);
            }
        }, 100);
    };

    const stopCameraTest = async () => {
        await stopCamera();
        setIsTestingCamera(false);
    };

    return (
        <div
            className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between selection:bg-[#faff69] selection:text-[#0a0a0a] relative overflow-hidden"
        >
            <Head title="Gate Kiosk Camera Scanner — EXFITS Gym" />

            {/* Background High-Voltage Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#faff69]/5 blur-[120px] pointer-events-none rounded-full" />

            {/* Top Navigation Bar */}
            <header className="px-8 py-5 flex items-center justify-between border-b border-[#2a2a2a]/60 bg-[#121212]/60 backdrop-blur-md z-10">
                <div className="flex items-center gap-4">
                    <Link
                        href={route('admin.attendance.index')}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a1a] text-xs font-semibold text-[#888888] hover:text-white border border-[#2a2a2a] hover:border-[#3a3a3a] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Exit Kiosk
                    </Link>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
                        <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-ping" />
                        <span className="text-xs font-bold text-[#22c55e] font-mono">
                            {liveInGymCount} In Gym
                        </span>
                    </div>
                </div>

                {/* Camera Selector Dropdown in Header */}
                {cameras.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Camera className="w-4 h-4 text-[#faff69]" />
                        <select
                            value={selectedCameraId}
                            onChange={(e) => handleCameraSwitch(e.target.value)}
                            disabled={isTestingCamera}
                            className="h-8 px-3 text-xs font-semibold bg-[#1a1a1a] text-white rounded-lg border border-[#2a2a2a] focus:border-[#faff69] focus:outline-none"
                        >
                            {cameras.map((cam) => (
                                <option key={cam.id} value={cam.id}>
                                    {cam.label}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            onClick={isTestingCamera ? stopCameraTest : startCameraTest}
                            className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-[#1e1e1e] hover:bg-[#2a2a2a] text-[#faff69] border border-[#3a3a3a] transition-colors flex items-center gap-1.5"
                        >
                            {isTestingCamera ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            {isTestingCamera ? 'Stop Test' : 'Test Camera'}
                        </button>
                    </div>
                )}

                {/* Digital Clock */}
                <div className="text-right">
                    <div className="text-2xl font-extrabold font-mono text-[#faff69] tracking-wider">
                        {currentTime}
                    </div>
                    <div className="text-[11px] text-[#888888] font-medium">
                        {currentDate}
                    </div>
                </div>
            </header>

            {/* Main Interactive Stage */}
            <main className="max-w-2xl w-full mx-auto px-4 py-6 flex-1 flex flex-col justify-center items-center z-10">
                {/* Mode Selector Toggle (Gate Check-In / Check-Out) */}
                <div className="inline-flex p-1.5 rounded-xl bg-[#161616] border border-[#2a2a2a] mb-6">
                    <button
                        type="button"
                        onClick={() => { setMode('check_in'); resetToWaiting(); }}
                        className={`px-6 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 ${
                            mode === 'check_in'
                                ? 'bg-[#faff69] text-[#0a0a0a] shadow-lg shadow-[#faff69]/20'
                                : 'text-[#888888] hover:text-white'
                        }`}
                    >
                        <QrCode className="w-4 h-4" />
                        Gate Check-In
                    </button>

                    <button
                        type="button"
                        onClick={() => { setMode('check_out'); resetToWaiting(); }}
                        className={`px-6 py-2 rounded-lg text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 ${
                            mode === 'check_out'
                                ? 'bg-[#faff69] text-[#0a0a0a] shadow-lg shadow-[#faff69]/20'
                                : 'text-[#888888] hover:text-white'
                        }`}
                    >
                        <LogOut className="w-4 h-4" />
                        Gate Check-Out
                    </button>
                </div>

                {/* CAMERA TEST MODE ACTIVE */}
                {isTestingCamera && (
                    <div className="w-full max-w-md bg-[#141414] border-2 border-[#faff69] rounded-3xl p-6 text-center space-y-4 shadow-2xl shadow-[#faff69]/10 animate-in fade-in">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[#faff69] flex items-center gap-1.5">
                                <Video className="w-4 h-4" /> Scanner Camera Test Mode
                            </span>
                            <Badge variant="pill" size="sm" className="bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30">
                                Live Feed Active
                            </Badge>
                        </div>

                        <div className="relative w-full aspect-square bg-[#0a0a0a] rounded-2xl overflow-hidden border border-[#2a2a2a]">
                            <div id="camera-test-preview" className="w-full h-full" />
                        </div>

                        <div className="text-left text-xs bg-[#1a1a1a] p-3 rounded-xl border border-[#2a2a2a] space-y-1">
                            <div className="text-[#888888]">Camera: <strong className="text-white">{cameras.find(c => c.id === selectedCameraId)?.label}</strong></div>
                            <div className="text-[#888888]">Status: <strong className="text-[#22c55e]">● Test Active (No Attendance Recorded)</strong></div>
                        </div>

                        <Button variant="secondary" className="w-full" onClick={stopCameraTest}>
                            Exit Test Mode & Resume Scanner
                        </Button>
                    </div>
                )}

                {/* WAITING / SCANNER STATE */}
                {!isTestingCamera && status === 'waiting' && (
                    <div className="w-full text-center space-y-6">
                        {/* Live Camera Scanner Feed Container */}
                        {scannerMode === 'camera' && (
                            <div className="relative w-72 h-72 mx-auto rounded-3xl bg-[#141414] border-2 border-dashed border-[#faff69]/50 flex flex-col items-center justify-center overflow-hidden shadow-2xl shadow-black">
                                <div id="kiosk-camera-reader" className="w-full h-full" />

                                {cameraError && (
                                    <div className="absolute inset-0 bg-[#121212]/95 p-6 flex flex-col items-center justify-center text-center">
                                        <CameraOff className="w-12 h-12 text-[#ef4444] mb-3" />
                                        <h3 className="text-sm font-bold text-white mb-1">Camera Unavailable</h3>
                                        <p className="text-xs text-[#888888] mb-4">{cameraError}</p>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => selectedCameraId && startCamera(selectedCameraId)}
                                        >
                                            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Try Again
                                        </Button>
                                    </div>
                                )}

                                {/* High-Voltage Laser Crosshairs */}
                                <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#faff69] pointer-events-none" />
                                <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#faff69] pointer-events-none" />
                                <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#faff69] pointer-events-none" />
                                <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#faff69] pointer-events-none" />
                            </div>
                        )}

                        <div className="space-y-1">
                            <span className="text-xs font-extrabold uppercase tracking-widest text-[#faff69]">
                                {mode === 'check_in' ? 'Arahkan QR Member ke Kamera' : 'Arahkan QR Member untuk Check-Out'}
                            </span>
                            <p className="text-[11px] text-[#888888]">
                                Scan otomatis dari HP member atau input nomor member secara manual
                            </p>
                        </div>

                        {/* Toggle Scanner Mode (Camera vs Manual Input) */}
                        <div className="max-w-md mx-auto">
                            {scannerMode === 'manual' ? (
                                <form onSubmit={handleManualSubmit} className="space-y-3">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Nomor Member (Contoh: MEM-000001)..."
                                        className="w-full h-12 px-4 text-center bg-[#181818] text-white font-mono font-bold text-base rounded-xl border border-[#2a2a2a] focus:border-[#faff69] focus:outline-none tracking-wider uppercase transition-all"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <Button type="submit" variant="primary" className="flex-1" disabled={!inputValue.trim()}>
                                            Submit
                                        </Button>
                                        <Button type="button" variant="secondary" onClick={() => setScannerMode('camera')}>
                                            <Camera className="w-4 h-4 mr-1" /> Use Camera
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setScannerMode('manual')}
                                    className="text-xs text-[#888888] hover:text-[#faff69] underline transition-colors"
                                >
                                    Input nomor member secara manual / barcode wedge
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* VALIDATING STATE */}
                {status === 'validating' && (
                    <div className="text-center py-16 space-y-4">
                        <div className="w-16 h-16 rounded-full border-4 border-[#faff69]/20 border-t-[#faff69] animate-spin mx-auto" />
                        <h2 className="text-xl font-extrabold text-white uppercase tracking-wider">
                            Memverifikasi Member & Membership...
                        </h2>
                        <p className="text-xs text-[#888888]">Validasi digital HMAC & isolasi cabang aktif</p>
                    </div>
                )}

                {/* SUCCESS STATE */}
                {status === 'success' && (
                    <div className="w-full max-w-lg mx-auto bg-[#161616] border-2 border-[#22c55e] rounded-3xl p-8 text-center space-y-6 shadow-2xl shadow-[#22c55e]/10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 rounded-full bg-[#22c55e]/15 border-2 border-[#22c55e] text-[#22c55e] flex items-center justify-center mx-auto shadow-lg">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>

                        <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#22c55e] bg-[#22c55e]/10 px-3 py-1 rounded-full border border-[#22c55e]/20">
                                {mode === 'check_in' ? 'AKSES DIIZINKAN • SELAMAT BERLATIH' : 'CHECK-OUT BERHASIL • SAMPAI JUMPA'}
                            </span>
                            <h2 className="text-2xl font-extrabold text-white mt-3">
                                {mode === 'check_in'
                                    ? successData?.member?.full_name
                                    : checkoutMemberName}
                            </h2>
                            {mode === 'check_in' && successData?.member?.member_number && (
                                <div className="text-sm font-mono font-bold text-[#faff69] mt-1">
                                    {successData.member.member_number}
                                </div>
                            )}
                        </div>

                        {mode === 'check_in' && successData && (
                            <div className="grid grid-cols-2 gap-3 text-left text-xs bg-[#101010] p-4 rounded-2xl border border-[#2a2a2a]">
                                <div>
                                    <div className="text-[#888888] text-[10px] uppercase font-bold">Paket Membership</div>
                                    <div className="font-bold text-white mt-0.5">{successData.membership?.membership_plan?.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[#888888] text-[10px] uppercase font-bold">Sisa Kuota Trainer</div>
                                    <div className="font-bold font-mono text-[#22c55e] mt-0.5">
                                        {successData.remaining_trainer_quota ?? 0} Sesi Tersedia
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Live Countdown Reset Bar */}
                        <div className="pt-2">
                            <div className="text-[11px] text-[#888888] font-medium">
                                Melanjutkan scan kamera dalam <strong className="text-white font-mono">{countdown}s</strong>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#242424] mt-2 overflow-hidden">
                                <div
                                    className="h-full bg-[#22c55e] transition-all duration-1000 ease-linear"
                                    style={{ width: `${(countdown / 5) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ERROR STATE */}
                {status === 'error' && (
                    <div className="w-full max-w-lg mx-auto bg-[#161616] border-2 border-[#ef4444] rounded-3xl p-8 text-center space-y-6 shadow-2xl shadow-[#ef4444]/10 animate-in fade-in zoom-in-95 duration-200">
                        <div className="w-20 h-20 rounded-full bg-[#ef4444]/15 border-2 border-[#ef4444] text-[#ef4444] flex items-center justify-center mx-auto shadow-lg">
                            <XCircle className="w-10 h-10" />
                        </div>

                        <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ef4444] bg-[#ef4444]/10 px-3 py-1 rounded-full border border-[#ef4444]/20">
                                AKSES DITOLAK
                            </span>
                            <h2 className="text-xl font-extrabold text-white mt-3 leading-snug">
                                {errorMessage}
                            </h2>
                            <p className="text-xs text-[#888888] mt-2">
                                Silakan hubungi Front Desk gym untuk pembaharuan membership atau transfer cabang.
                            </p>
                        </div>

                        {/* Countdown Reset Bar */}
                        <div className="pt-2">
                            <div className="text-[11px] text-[#888888] font-medium">
                                Reset otomatis dalam <strong className="text-white font-mono">{countdown}s</strong>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#242424] mt-2 overflow-hidden">
                                <div
                                    className="h-full bg-[#ef4444] transition-all duration-1000 ease-linear"
                                    style={{ width: `${(countdown / 4) * 100}%` }}
                                />
                            </div>
                        </div>

                        <Button variant="secondary" size="sm" onClick={resetToWaiting}>
                            Coba Scan Lagi Sekarang
                        </Button>
                    </div>
                )}
            </main>

            {/* Kiosk Footer Info */}
            <footer className="py-4 text-center text-xs text-[#5a5a5a] border-t border-[#1f1f1f] bg-[#0c0c0c] z-10">
                EXFITS Gate Security & Access Control • High-Speed Optical Turnstile Node
            </footer>
        </div>
    );
}