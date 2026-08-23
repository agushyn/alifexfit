import { ReactNode, useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { PageProps, WebsiteBranding } from '@/types';
import { 
    Menu, 
    X, 
    ChevronDown, 
    MapPin, 
    Phone, 
    Mail, 
    Clock, 
    ArrowRight, 
    Sparkles, 
    CheckCircle2, 
    ExternalLink 
} from 'lucide-react';

interface PublicLayoutProps {
    children: ReactNode;
    branding: WebsiteBranding;
    title?: string;
    description?: string;
    ogImage?: string | null;
}

export function PublicLayout({ 
    children, 
    branding, 
    title, 
    description, 
    ogImage 
}: PublicLayoutProps) {
    const { gym, flash } = usePage<PageProps>().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

    const currentGym = branding.gym;
    const settings = branding.settings;
    const branches = gym.branches || [];

    const pageTitle = title 
        ? `${title} | ${currentGym.name}` 
        : settings.site_title;
    
    const metaDescription = description || settings.meta_description;
    const ogImageUrl = ogImage || settings.og_image_url;

    const navLinks = [
        { name: 'Home', href: route('public.home'), active: route().current('public.home') },
        { name: 'Memberships', href: route('public.membership'), active: route().current('public.membership') },
        { name: 'Trainers', href: route('public.trainers'), active: route().current('public.trainers*') },
        { name: 'Workouts', href: route('public.workouts'), active: route().current('public.workouts') },
        { name: 'Facilities', href: route('public.facilities'), active: route().current('public.facilities') },
        { name: 'About', href: route('public.about'), active: route().current('public.about') },
        { name: 'FAQ', href: route('public.faq'), active: route().current('public.faq') },
        { name: 'Contact', href: route('public.contact'), active: route().current('public.contact') },
    ];

    const handleSwitchBranch = (branchId: number) => {
        router.post(route('public.branch.switch'), { gym_id: branchId }, {
            preserveScroll: true,
            onSuccess: () => setBranchDropdownOpen(false),
        });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans selection:bg-[#faff69] selection:text-[#0a0a0a]">
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={metaDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={metaDescription} />
                {ogImageUrl && <meta property="og:image" content={ogImageUrl} />}
                <meta property="og:type" content="website" />
            </Head>

            {/* Optional Announcement Bar */}
            {settings.announcement_bar && (
                <div className="bg-[#faff69] text-[#0a0a0a] py-2 px-4 text-xs font-bold text-center tracking-wide uppercase flex items-center justify-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{settings.announcement_bar}</span>
                </div>
            )}

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#2a2a2a]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo & Brand */}
                        <div className="flex items-center gap-4">
                            <Link href={route('public.home')} className="flex items-center gap-3 group">
                                <img
                                    src="/images/LogoEX.png"
                                    alt="EXFIT Logo"
                                    className="h-10 w-10 object-contain filter drop-shadow-[0_0_12px_rgba(250,255,105,0.4)] transition-transform group-hover:scale-105"
                                />
                                <div>
                                    <span className="text-xl font-black tracking-tight text-white group-hover:text-[#faff69] transition-colors uppercase">
                                        {currentGym.name}
                                    </span>
                                    <span className="block text-[9px] tracking-widest text-[#888888] uppercase font-mono">
                                        HIGH VOLTAGE FITNESS & PERFORMANCE
                                    </span>
                                </div>
                            </Link>

                            {/* Branch Switcher Dropdown */}
                            {branches.length > 1 && (
                                <div className="relative ml-2 hidden md:block">
                                    <button
                                        type="button"
                                        onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] text-xs font-medium text-[#cccccc] transition-colors"
                                    >
                                        <MapPin className="w-3.5 h-3.5 text-[#faff69]" />
                                        <span>{currentGym.name.replace('Exfits ', '')}</span>
                                        <ChevronDown className="w-3.5 h-3.5 text-[#888888]" />
                                    </button>

                                    {branchDropdownOpen && (
                                        <div className="absolute left-0 mt-2 w-64 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] shadow-2xl py-2 z-50">
                                            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#888888]">
                                                PILIH LOKASI CABANG
                                            </div>
                                            {branches.map((b) => (
                                                <button
                                                    key={b.id}
                                                    type="button"
                                                    onClick={() => handleSwitchBranch(b.id)}
                                                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#242424] transition-colors ${
                                                        b.id === currentGym.id ? 'text-[#faff69] font-bold' : 'text-[#cccccc]'
                                                    }`}
                                                >
                                                    <div>
                                                        <div className="font-semibold">{b.name}</div>
                                                        <div className="text-[11px] text-[#888888] truncate">{b.address || b.name}</div>
                                                    </div>
                                                    {b.id === currentGym.id && (
                                                        <CheckCircle2 className="w-4 h-4 text-[#faff69] flex-shrink-0" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden lg:flex items-center space-x-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                        link.active
                                            ? 'text-[#faff69] bg-[#1a1a1a] border border-[#2a2a2a]'
                                            : 'text-[#cccccc] hover:text-white hover:bg-[#121212]'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Action CTA */}
                        <div className="hidden sm:flex items-center gap-3">
                            <Link
                                href={route('public.membership')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#faff69] hover:bg-[#e6eb52] text-[#0a0a0a] text-xs font-black tracking-wider uppercase shadow-[0_0_20px_rgba(250,255,105,0.25)] transition-all hover:scale-105"
                            >
                                <span>JOIN NOW</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex lg:hidden items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-white hover:bg-[#242424]"
                                aria-label="Toggle Navigation Menu"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Panel */}
                {mobileMenuOpen && (
                    <div className="lg:hidden bg-[#0f0f0f] border-b border-[#2a2a2a] px-4 pt-3 pb-6 space-y-2">
                        {branches.length > 1 && (
                            <div className="mb-3 pb-3 border-b border-[#2a2a2a]">
                                <div className="text-[11px] font-bold text-[#888888] uppercase mb-2">PILIH CABANG:</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {branches.map((b) => (
                                        <button
                                            key={b.id}
                                            type="button"
                                            onClick={() => handleSwitchBranch(b.id)}
                                            className={`px-3 py-2 rounded-lg text-xs font-medium border text-left truncate ${
                                                b.id === currentGym.id
                                                    ? 'bg-[#faff69]/10 border-[#faff69] text-[#faff69]'
                                                    : 'bg-[#1a1a1a] border-[#2a2a2a] text-[#cccccc]'
                                            }`}
                                        >
                                            {b.name.replace('Exfits ', '')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                                        link.active
                                            ? 'text-[#faff69] bg-[#1a1a1a] font-bold'
                                            : 'text-[#cccccc] hover:bg-[#1a1a1a] hover:text-white'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-[#2a2a2a] flex flex-col gap-2">
                            <Link
                                href={route('public.membership')}
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full text-center py-2.5 rounded-lg bg-[#faff69] text-[#0a0a0a] text-sm font-bold tracking-wider uppercase"
                            >
                                JOIN NOW
                            </Link>
                        </div>
                    </div>
                )}
            </header>

            {/* Flash Messages */}
            {flash?.success && (
                <div className="bg-[#22c55e]/15 border-b border-[#22c55e]/30 text-[#22c55e] py-3 px-4 text-center text-sm font-medium">
                    {flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="bg-[#ef4444]/15 border-b border-[#ef4444]/30 text-[#ef4444] py-3 px-4 text-center text-sm font-medium">
                    {flash.error}
                </div>
            )}

            {/* Page Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* High Voltage Footer */}
            <footer className="bg-[#0f0f0f] border-t border-[#2a2a2a] pt-16 pb-12 text-[#888888]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#2a2a2a]">
                        {/* Column 1: Gym Dossier */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/LogoEX.png"
                                    alt="EXFIT Logo"
                                    className="h-8 w-8 object-contain"
                                />
                                <span className="text-lg font-black tracking-tight text-white uppercase">
                                    {currentGym.name}
                                </span>
                            </div>
                            <p className="text-sm text-[#cccccc] max-w-sm leading-relaxed">
                                {settings.meta_description}
                            </p>
                            <div className="flex items-center gap-3 pt-2">
                                {settings.social_instagram && (
                                    <a
                                        href={settings.social_instagram}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 rounded-lg bg-[#1a1a1a] hover:bg-[#faff69] hover:text-[#0a0a0a] text-white flex items-center justify-center border border-[#2a2a2a] transition-all"
                                        aria-label="Instagram"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                        </svg>
                                    </a>
                                )}
                                {settings.social_facebook && (
                                    <a
                                        href={settings.social_facebook}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 rounded-lg bg-[#1a1a1a] hover:bg-[#faff69] hover:text-[#0a0a0a] text-white flex items-center justify-center border border-[#2a2a2a] transition-all"
                                        aria-label="Facebook"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                        </svg>
                                    </a>
                                )}
                                {settings.social_youtube && (
                                    <a
                                        href={settings.social_youtube}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-9 h-9 rounded-lg bg-[#1a1a1a] hover:bg-[#faff69] hover:text-[#0a0a0a] text-white flex items-center justify-center border border-[#2a2a2a] transition-all"
                                        aria-label="YouTube"
                                    >
                                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Column 2: Navigation */}
                        <div>
                            <h3 className="text-xs font-bold tracking-wider text-white uppercase mb-4 font-mono">
                                EXPLORE
                            </h3>
                            <ul className="space-y-2.5 text-sm">
                                <li>
                                    <Link href={route('public.membership')} className="hover:text-[#faff69] transition-colors">
                                        Membership Plans
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('public.trainers')} className="hover:text-[#faff69] transition-colors">
                                        Personal Trainers
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('public.workouts')} className="hover:text-[#faff69] transition-colors">
                                        Workout Categories
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('public.facilities')} className="hover:text-[#faff69] transition-colors">
                                        Gym Facilities
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('public.about')} className="hover:text-[#faff69] transition-colors">
                                        About {currentGym.name}
                                    </Link>
                                </li>
                                <li>
                                    <Link href={route('public.faq')} className="hover:text-[#faff69] transition-colors">
                                        Frequently Asked Questions
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Column 3: Contact Details */}
                        <div>
                            <h3 className="text-xs font-bold tracking-wider text-white uppercase mb-4 font-mono">
                                OFFICIAL LOCATION
                            </h3>
                            <ul className="space-y-3 text-xs text-[#cccccc]">
                                <li className="flex items-start gap-2.5">
                                    <MapPin className="w-4 h-4 text-[#faff69] flex-shrink-0 mt-0.5" />
                                    <span>{currentGym.address}</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Phone className="w-4 h-4 text-[#faff69] flex-shrink-0" />
                                    <a href={`tel:${currentGym.phone}`} className="hover:text-[#faff69] font-mono">
                                        {currentGym.phone}
                                    </a>
                                </li>
                                <li className="flex items-center gap-2.5">
                                    <Mail className="w-4 h-4 text-[#faff69] flex-shrink-0" />
                                    <span>{currentGym.email}</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <Clock className="w-4 h-4 text-[#faff69] flex-shrink-0 mt-0.5" />
                                    <span>{settings.operating_hours}</span>
                                </li>
                            </ul>

                            <div className="mt-3">
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentGym.address || 'EXFIT Gym Tangerang')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#faff69] hover:underline"
                                >
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>LIHAT LOKASI DI GOOGLE MAPS</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>

                        {/* Column 4: WhatsApp CTA */}
                        <div>
                            <h3 className="text-xs font-bold tracking-wider text-white uppercase mb-4 font-mono">
                                GET IN TOUCH
                            </h3>
                            <p className="text-xs text-[#cccccc] mb-4">
                                Have questions about our memberships or personal coaching? Chat with our team.
                            </p>
                            {settings.contact_whatsapp && (
                                <a
                                    href={`https://wa.me/${settings.contact_whatsapp.replace(/[^0-9]/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1a1a1a] hover:bg-[#242424] border border-[#2a2a2a] text-xs font-semibold text-white transition-all w-full justify-center"
                                >
                                    <Phone className="w-3.5 h-3.5 text-[#22c55e]" />
                                    <span>CHAT WHATSAPP</span>
                                    <ExternalLink className="w-3 h-3 text-[#888888]" />
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Bottom strip */}
                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#888888] gap-4">
                        <div>
                            &copy; {new Date().getFullYear()} {currentGym.name}. All rights reserved. Powered by EXFIT Gym Management System.
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href={route('public.contact')} className="hover:text-[#faff69] transition-colors">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
