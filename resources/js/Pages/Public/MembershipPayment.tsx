import { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { MembershipRegistration, Payment, PaymentChannel, PageProps, WebsiteBranding } from '@/types';
import { 
    CheckCircle2, 
    Shield, 
    Sparkles, 
    ArrowRight, 
    Zap, 
    Clock, 
    Copy, 
    Check, 
    RefreshCw, 
    QrCode, 
    Building2, 
    AlertCircle, 
    ExternalLink,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface Props {
    branding: WebsiteBranding;
    registration: MembershipRegistration;
    channels: Record<string, PaymentChannel>;
    latestPayment?: Payment | null;
}

export default function MembershipPayment({ branding, registration, channels, latestPayment }: Props) {
    const { gym } = usePage<PageProps>().props;
    const currentGym = gym.current;

    const [selectedChannel, setSelectedChannel] = useState<string>(
        latestPayment?.payment_channel ? `${latestPayment.payment_channel}_va` : 'qris'
    );
    const [copiedVa, setCopiedVa] = useState(false);
    const [copiedAmount, setCopiedAmount] = useState(false);
    const [copiedBillKey, setCopiedBillKey] = useState(false);
    const [showInstructions, setShowInstructions] = useState(true);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isExpired, setIsExpired] = useState(false);

    const { post, processing } = useForm({
        payment_channel: selectedChannel,
    });

    const plan = registration.membership_plan;
    const payment = latestPayment;

    // Countdown Timer calculation
    useEffect(() => {
        if (!payment?.expires_at) return;

        const updateTimer = () => {
            const expiryTime = new Date(payment.expires_at!).getTime();
            const now = new Date().getTime();
            const diff = expiryTime - now;

            if (diff <= 0) {
                setTimeLeft('00:00 (Kadaluarsa)');
                setIsExpired(true);
                return;
            }

            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [payment?.expires_at]);

    // Real-time Status Polling
    useEffect(() => {
        if (!payment || payment.status === 'paid' || isExpired) return;

        const checkStatus = async () => {
            try {
                const response = await fetch(
                    route('public.membership.register.payment.status', {
                        registration: registration.registration_number,
                        gym: currentGym?.slug,
                    })
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.is_paid || data.is_approved) {
                        router.visit(
                            route('public.membership.register.success', {
                                reg: registration.registration_number,
                                gym: currentGym?.slug,
                            })
                        );
                    }
                }
            } catch (err) {
                // Non-blocking
            }
        };

        const pollInterval = setInterval(checkStatus, 5000);
        return () => clearInterval(pollInterval);
    }, [payment, registration.registration_number, currentGym?.slug, isExpired]);

    const handleCopyVa = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedVa(true);
        setTimeout(() => setCopiedVa(false), 2000);
    };

    const handleCopyAmount = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedAmount(true);
        setTimeout(() => setCopiedAmount(false), 2000);
    };

    const handleCopyBillKey = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedBillKey(true);
        setTimeout(() => setCopiedBillKey(false), 2000);
    };

    const handleCreatePayment = (channelKey: string) => {
        setSelectedChannel(channelKey);
        post(
            route('public.membership.register.payment.store', {
                registration: registration.registration_number,
                gym: currentGym?.slug,
            })
        );
    };

    const handleManualCheck = async () => {
        setIsCheckingStatus(true);
        try {
            const response = await fetch(
                route('public.membership.register.payment.status', {
                    registration: registration.registration_number,
                    gym: currentGym?.slug,
                })
            );

            if (response.ok) {
                const data = await response.json();
                if (data.is_paid || data.is_approved) {
                    router.visit(
                        route('public.membership.register.success', {
                            reg: registration.registration_number,
                            gym: currentGym?.slug,
                        })
                    );
                } else {
                    alert('Pembayaran belum terdeteksi. Silakan pastikan Anda sudah menyelesaikan transfer.');
                }
            }
        } finally {
            setIsCheckingStatus(false);
        }
    };

    return (
        <PublicLayout
            branding={branding}
            title={`Pembayaran Membership — #${registration.registration_number}`}
            description="Pilih metode pembayaran QRIS atau Virtual Account bank untuk menyelesaikan pendaftaran membership EXFITS GYM Anda."
        >
            <Head title={`Pembayaran #${registration.registration_number} — EXFITS GYM`} />

            {/* Header Section */}
            <div className="bg-[#0f0f0f] border-b border-[#2a2a2a] py-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#faff69_1px,transparent_1px)] [background-size:32px_32px] opacity-5 pointer-events-none" />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#faff69]/10 border border-[#faff69]/30 text-[#faff69] text-xs font-mono font-semibold tracking-wider uppercase mb-3">
                        <Zap className="w-3.5 h-3.5" />
                        LANGKAH PEMBAYARAN MIDTRANS
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight uppercase">
                        SELESAIKAN <span className="text-[#faff69]">PEMBAYARAN</span> MEMBERSHIP
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-[#888888] max-w-lg mx-auto">
                        Nomor Registrasi: <span className="text-white font-mono font-bold">{registration.registration_number}</span> • Calon Member: <span className="text-white font-bold">{registration.full_name}</span>
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Payment Channel Selector & Active Payment Screen */}
                    <div className="lg:col-span-2 space-y-6">
                        {payment && !isExpired ? (
                            /* Active Payment Instruction Screen */
                            <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-32 bg-[#faff69]/5 blur-3xl pointer-events-none" />

                                {/* Timer & Status Banner */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#161616] border border-[#242424]">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-3 h-3 rounded-full bg-[#faff69] animate-pulse" />
                                        <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                                            MENUNGGU PEMBAYARAN
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-mono text-[#888888]">
                                        <Clock className="w-4 h-4 text-[#faff69]" />
                                        <span>Batas Waktu: </span>
                                        <span className="font-extrabold text-[#faff69] text-sm">{timeLeft}</span>
                                    </div>
                                </div>

                                {/* QRIS Specific Display */}
                                {payment.payment_method === 'qris' && (
                                    <div className="text-center space-y-5">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161616] border border-[#333333] text-xs font-bold text-white uppercase">
                                            <QrCode className="w-4 h-4 text-[#faff69]" />
                                            QRIS (Gopay / ShopeePay / BCA / Semua E-Wallet)
                                        </div>

                                        {payment.payment_url ? (
                                            <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl border-4 border-[#faff69]">
                                                <img
                                                    src={payment.payment_url}
                                                    alt="QRIS Code"
                                                    className="w-56 h-56 mx-auto object-contain"
                                                />
                                            </div>
                                        ) : payment.qr_string ? (
                                            <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl border-4 border-[#faff69]">
                                                <div className="w-56 h-56 flex flex-col items-center justify-center text-center p-3 text-black">
                                                    <QrCode className="w-20 h-20 text-black mb-2" />
                                                    <span className="text-[10px] font-mono font-bold break-all">
                                                        {payment.qr_string.substring(0, 40)}...
                                                    </span>
                                                </div>
                                            </div>
                                        ) : null}

                                        <div className="p-4 rounded-xl bg-[#161616] border border-[#242424] text-xs space-y-2 text-left">
                                            <div className="font-bold text-white uppercase flex items-center gap-1.5">
                                                <Sparkles className="w-3.5 h-3.5 text-[#faff69]" />
                                                Petunjuk Pembayaran QRIS:
                                            </div>
                                            <ol className="list-decimal list-inside space-y-1 text-[#aaaaaa] text-xs">
                                                <li>Buka aplikasi Mobile Banking (BCA, Mandiri, BRI, BNI, dll.) atau E-Wallet (GoPay, ShopeePay, OVO, Dana, LinkAja).</li>
                                                <li>Pilih menu <strong>Scan QR / QRIS</strong>.</li>
                                                <li>Scan kode QR di atas dan pastikan nama penerima adalah <strong>EXFITS GYM</strong>.</li>
                                                <li>Periksa nominal transfer <strong>Rp {Number(payment.amount).toLocaleString('id-ID')}</strong> dan selesaikan pembayaran.</li>
                                            </ol>
                                        </div>
                                    </div>
                                )}

                                {/* Virtual Account / Bank Transfer Display */}
                                {payment.payment_method !== 'qris' && (
                                    <div className="space-y-5">
                                        <div className="flex items-center justify-between border-b border-[#242424] pb-4">
                                            <div>
                                                <div className="text-[10px] text-[#888888] uppercase tracking-wider font-mono">
                                                    METODE PEMBAYARAN
                                                </div>
                                                <div className="text-base font-extrabold text-white uppercase flex items-center gap-2 mt-0.5">
                                                    <Building2 className="w-4 h-4 text-[#faff69]" />
                                                    <span>{payment.payment_channel.toUpperCase()} VIRTUAL ACCOUNT</span>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 rounded-lg bg-[#161616] border border-[#2a2a2a] text-xs font-mono font-bold text-[#faff69]">
                                                MIDTRANS VA
                                            </div>
                                        </div>

                                        {/* VA Number Strip */}
                                        {payment.va_number && (
                                            <div className="p-4 rounded-xl bg-[#161616] border border-[#faff69]/30">
                                                <span className="text-[10px] uppercase text-[#888888] font-mono block mb-1">
                                                    NOMOR VIRTUAL ACCOUNT ({payment.payment_channel.toUpperCase()})
                                                </span>
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-xl sm:text-2xl font-black text-[#faff69] font-mono tracking-wider">
                                                        {payment.va_number}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopyVa(payment.va_number!)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f1f1f] hover:bg-[#2a2a2a] text-xs font-bold text-white border border-[#333333] transition-all cursor-pointer"
                                                    >
                                                        {copiedVa ? (
                                                            <>
                                                                <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                                                                <span className="text-[#22c55e]">Tersalin!</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Copy className="w-3.5 h-3.5" />
                                                                <span>Salin VA</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Mandiri Bill Key Strip */}
                                        {payment.bill_key && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div className="p-4 rounded-xl bg-[#161616] border border-[#242424]">
                                                    <span className="text-[10px] uppercase text-[#888888] font-mono block mb-1">
                                                        KODE PERUSAHAAN (BILLER CODE)
                                                    </span>
                                                    <span className="text-lg font-black text-white font-mono">
                                                        {payment.biller_code || '70012'}
                                                    </span>
                                                </div>
                                                <div className="p-4 rounded-xl bg-[#161616] border border-[#faff69]/30">
                                                    <span className="text-[10px] uppercase text-[#888888] font-mono block mb-1">
                                                        KODE PEMBAYARAN (BILL KEY)
                                                    </span>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-lg font-black text-[#faff69] font-mono">
                                                            {payment.bill_key}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopyBillKey(payment.bill_key!)}
                                                            className="p-1 rounded bg-[#222222] text-xs text-white"
                                                        >
                                                            {copiedBillKey ? <Check className="w-3 h-3 text-[#22c55e]" /> : <Copy className="w-3 h-3" />}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Total Transfer Amount */}
                                        <div className="p-4 rounded-xl bg-[#161616] border border-[#242424] flex items-center justify-between">
                                            <div>
                                                <span className="text-[10px] uppercase text-[#888888] font-mono block">
                                                    TOTAL JUMLAH TRANSFER
                                                </span>
                                                <span className="text-lg font-extrabold text-white font-mono">
                                                    Rp {Number(payment.amount).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyAmount(String(payment.amount))}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1f1f1f] hover:bg-[#2a2a2a] text-xs font-bold text-white border border-[#333333] transition-all cursor-pointer"
                                            >
                                                {copiedAmount ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                                                        <span className="text-[#22c55e]">Tersalin!</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-3.5 h-3.5" />
                                                        <span>Salin Nominal</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Collapsible Transfer Instructions */}
                                        <div className="border border-[#242424] rounded-xl overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => setShowInstructions(!showInstructions)}
                                                className="w-full p-3.5 bg-[#161616] flex items-center justify-between text-xs font-bold text-white text-left cursor-pointer"
                                            >
                                                <span>Petunjuk Transfer Bank ({payment.payment_channel.toUpperCase()})</span>
                                                {showInstructions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>

                                            {showInstructions && (
                                                <div className="p-4 bg-[#121212] text-xs text-[#aaaaaa] space-y-2 border-t border-[#242424]">
                                                    <div><strong>Cara Bayar via Mobile Banking:</strong></div>
                                                    <ol className="list-decimal list-inside space-y-1 pl-1">
                                                        <li>Buka aplikasi m-Banking bank Anda.</li>
                                                        <li>Pilih menu <strong>Transfer &gt; Virtual Account</strong> (atau Bayar Tagihan untuk Mandiri).</li>
                                                        <li>Masukkan nomor Virtual Account <strong>{payment.va_number || payment.bill_key}</strong>.</li>
                                                        <li>Pastikan nama tagihan adalah <strong>EXFITS GYM</strong> dan nominal sesuai.</li>
                                                        <li>Konfirmasi dengan PIN m-Banking Anda. Selesai!</li>
                                                    </ol>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="pt-4 border-t border-[#242424] flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={handleManualCheck}
                                        disabled={isCheckingStatus}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(250,255,105,0.2)] cursor-pointer"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                                        <span>{isCheckingStatus ? 'MEMERIKSA...' : 'SAYA SUDAH BAYAR (CEK STATUS)'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsExpired(true)}
                                        className="text-xs text-[#888888] hover:text-white underline cursor-pointer"
                                    >
                                        Ganti Metode Pembayaran Lain
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Channel Selection Screen */
                            <div className="bg-[#121212] border border-[#2a2a2a] rounded-2xl p-6 sm:p-8 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[#faff69] text-[#0a0a0a] font-black text-sm flex items-center justify-center">
                                        03
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white uppercase tracking-wide">PILIH SALURAN PEMBAYARAN</h2>
                                        <p className="text-xs text-[#888888]">Pilih metode pembayaran instan melalui Midtrans</p>
                                    </div>
                                </div>

                                {isExpired && (
                                    <div className="p-3.5 rounded-xl bg-[#faff69]/10 border border-[#faff69]/30 text-xs text-[#faff69] flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>Sesi pembayaran sebelumnya telah berakhir atau diganti. Silakan pilih metode pembayaran baru.</span>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    {Object.entries(channels).map(([key, channel]) => {
                                        const isSelected = selectedChannel === key;
                                        return (
                                            <div
                                                key={key}
                                                onClick={() => setSelectedChannel(key)}
                                                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                                    isSelected
                                                        ? 'bg-[#1a1a1a] border-[#faff69] ring-1 ring-[#faff69] shadow-[0_0_15px_rgba(250,255,105,0.1)]'
                                                        : 'bg-[#161616] border-[#242424] hover:border-[#383838]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                                        isSelected ? 'bg-[#faff69] text-[#0a0a0a]' : 'bg-[#202020] text-[#aaaaaa]'
                                                    }`}>
                                                        {channel.method === 'qris' ? <QrCode className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white">{channel.name}</div>
                                                        <div className="text-[10px] text-[#888888] uppercase font-mono">
                                                            {channel.method === 'qris' ? 'INSTANT SCAN & PAY' : 'VIRTUAL ACCOUNT TRANSFER'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                    isSelected ? 'border-[#faff69] bg-[#faff69]' : 'border-[#444444]'
                                                }`}>
                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a]" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleCreatePayment(selectedChannel)}
                                    disabled={processing}
                                    className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-sm font-extrabold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(250,255,105,0.25)] disabled:opacity-50 cursor-pointer"
                                >
                                    {processing ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
                                            <span>MEMPROSES SALURAN PEMBAYARAN...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>LANJUTKAN KE PETUNJUK PEMBAYARAN</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Registration Summary Dossier */}
                    <div className="space-y-6">
                        <div className="bg-[#121212] border border-[#242424] rounded-2xl p-6 space-y-4">
                            <h3 className="text-xs font-bold text-[#888888] uppercase tracking-wider font-mono">
                                RINGKASAN PENDAFTARAN
                            </h3>

                            {plan && (
                                <div className="p-4 rounded-xl bg-[#161616] border border-[#faff69]/30">
                                    <div className="text-xs font-bold text-white uppercase">{plan.name}</div>
                                    <div className="text-xl font-black text-[#faff69] font-mono mt-1">
                                        Rp {Number(plan.price).toLocaleString('id-ID')}
                                    </div>
                                    <div className="text-[11px] text-[#888888] mt-1">
                                        Durasi: {plan.duration} {plan.billing_period === 'monthly' ? 'Bulan' : plan.billing_period === 'yearly' ? 'Tahun' : 'Hari'}
                                    </div>
                                </div>
                            )}

                            <div className="text-xs space-y-2 text-[#cccccc] pt-2 border-t border-[#222222]">
                                <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                                    <span className="text-[#888888]">Nama Pemohon:</span>
                                    <span className="font-semibold text-white">{registration.full_name}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                                    <span className="text-[#888888]">Nomor WhatsApp:</span>
                                    <span className="font-mono text-white">{registration.phone}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                                    <span className="text-[#888888]">Email:</span>
                                    <span className="font-mono text-white">{registration.email}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-[#1a1a1a]">
                                    <span className="text-[#888888]">Dokumen KTP:</span>
                                    <span className="text-[#22c55e] font-mono font-bold">✓ Terverifikasi</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-[#121212] border border-[#242424] text-xs text-[#888888] space-y-2">
                            <div className="flex items-center gap-1.5 text-white font-bold">
                                <Shield className="w-4 h-4 text-[#22c55e]" />
                                <span>Pembayaran Aman & Otomatis</span>
                            </div>
                            <p className="text-[11px] leading-relaxed">
                                Transaksi diamankan dengan enkripsi standar industri Midtrans. Setelah pembayaran berhasil, akun member Anda akan langsung aktif secara instan.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
