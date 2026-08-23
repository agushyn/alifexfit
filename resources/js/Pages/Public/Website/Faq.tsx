import { useState } from 'react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { WebsiteBranding } from '@/types';
import { 
    Sparkles, 
    ChevronDown, 
    ChevronUp, 
    Search, 
    HelpCircle,
    Phone
} from 'lucide-react';

interface FaqProps {
    branding: WebsiteBranding;
    faqs: Array<{
        id: number;
        question: string;
        answer: string;
        category: string;
    }>;
}

export default function Faq({ branding, faqs }: FaqProps) {
    const { gym, settings } = branding;
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [openFaqId, setOpenFaqId] = useState<number | null>(faqs[0]?.id || null);

    const categories = ['all', ...Array.from(new Set(faqs.map((f) => f.category).filter(Boolean)))];

    const filteredFaqs = faqs.filter((faq) => {
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        const matchesSearch = 
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <PublicLayout
            branding={branding}
            title="Frequently Asked Questions"
            description={`Find answers to common questions regarding memberships, personal coaching, amenities, and policies at ${gym.name}.`}
        >
            {/* Header Banner */}
            <section className="py-16 sm:py-24 border-b border-[#2a2a2a] bg-[#0f0f0f] relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#faff69]/10 blur-[130px] pointer-events-none rounded-full" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-xs font-semibold text-[#faff69]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>HELP & KNOWLEDGE BASE</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white uppercase leading-[1.05]">
                        FREQUENTLY ASKED QUESTIONS
                    </h1>
                    <p className="text-sm sm:text-base text-[#cccccc] max-w-2xl mx-auto leading-relaxed">
                        Got questions before joining? Here is everything you need to know about our memberships, coaches, check-in, and facilities.
                    </p>

                    {/* Search Bar */}
                    <div className="pt-6 max-w-lg mx-auto relative">
                        <Search className="w-4 h-4 text-[#888888] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search questions (e.g. locker, personal trainer, guest pass)..."
                            className="w-full pl-11 pr-4 py-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-xs text-white placeholder-[#888888] focus:outline-none focus:border-[#faff69] transition-colors"
                        />
                    </div>

                    {/* Category Filter Tabs */}
                    {categories.length > 2 && (
                        <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                        selectedCategory === cat
                                            ? 'bg-[#faff69] text-[#0a0a0a] shadow-[0_0_15px_rgba(250,255,105,0.3)]'
                                            : 'bg-[#1a1a1a] text-[#888888] hover:text-white border border-[#2a2a2a]'
                                    }`}
                                >
                                    {cat === 'all' ? 'All Questions' : cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* FAQs Accordion */}
            <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {filteredFaqs.length === 0 ? (
                    <div className="text-center py-16 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] space-y-2">
                        <HelpCircle className="w-10 h-10 text-[#888888] mx-auto" />
                        <p className="text-sm text-white font-bold">No matching questions found.</p>
                        <p className="text-xs text-[#888888]">Try different keywords or chat with our front desk team.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredFaqs.map((faq) => {
                            const isOpen = openFaqId === faq.id;
                            return (
                                <div
                                    key={faq.id}
                                    className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden transition-colors"
                                >
                                    <button
                                        type="button"
                                        onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                                        className="w-full px-6 py-5 text-left flex items-center justify-between text-sm font-bold text-white hover:text-[#faff69]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-mono text-[#faff69] font-bold">Q.</span>
                                            <span>{faq.question}</span>
                                        </div>
                                        {isOpen ? (
                                            <ChevronUp className="w-4 h-4 text-[#faff69] flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-[#888888] flex-shrink-0" />
                                        )}
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-6 pt-2 text-xs text-[#cccccc] leading-relaxed border-t border-[#242424] whitespace-pre-line">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* WhatsApp Support Box */}
                {settings.contact_whatsapp && (
                    <div className="mt-16 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8 text-center space-y-4">
                        <h3 className="text-lg font-bold text-white uppercase">Still have questions?</h3>
                        <p className="text-xs text-[#cccccc] max-w-md mx-auto">
                            Our team is available every day to assist with membership inquiries, personal trainer matching, and gym tours.
                        </p>
                        <div>
                            <a
                                href={`https://wa.me/${settings.contact_whatsapp.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(gym.name)},%20saya%20punya%20pertanyaan%20tentang%20gym`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-bold uppercase tracking-wider transition-all"
                            >
                                <Phone className="w-3.5 h-3.5" />
                                <span>CHAT WITH FRONT DESK</span>
                            </a>
                        </div>
                    </div>
                )}
            </section>
        </PublicLayout>
    );
}
