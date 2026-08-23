import { useState } from 'react';
import { PublicLayout } from '@/Layouts/PublicLayout';
import { WebsiteBranding } from '@/types';
import { 
    Flame, 
    Sparkles, 
    Dumbbell, 
    Zap, 
    Activity, 
    HeartPulse, 
    Target,
    Shield
} from 'lucide-react';

interface WorkoutsProps {
    branding: WebsiteBranding;
    workouts: Array<{
        id: number;
        name: string;
        category: string;
        description: string;
    }>;
}

export default function Workouts({ branding, workouts }: WorkoutsProps) {
    const { gym } = branding;
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = ['all', ...Array.from(new Set(workouts.map((w) => w.category).filter(Boolean)))];

    const filteredWorkouts = workouts.filter((w) => {
        if (selectedCategory === 'all') return true;
        return w.category === selectedCategory;
    });

    return (
        <PublicLayout
            branding={branding}
            title="Workout Programs & Class Categories"
            description={`Discover performance-driven workout programs at ${gym.name}. Strength training, HIIT, functional bodybuilding, cardio, and active recovery.`}
        >
            {/* Header Banner */}
            <section className="py-16 sm:py-24 border-b border-[#2a2a2a] bg-[#0f0f0f] relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#faff69]/10 blur-[130px] pointer-events-none rounded-full" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-xs font-semibold text-[#faff69]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>RESULTS-DRIVEN TRAINING DISCIPLINES</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white uppercase leading-[1.05]">
                        WORKOUT PROGRAMS
                    </h1>
                    <p className="text-sm sm:text-base text-[#cccccc] max-w-2xl mx-auto leading-relaxed">
                        Engineered for strength, hypertrophy, fat loss, and athletic conditioning. Explore our diverse workout programs designed for all fitness levels.
                    </p>

                    {/* Category Filter Tabs */}
                    {categories.length > 2 && (
                        <div className="pt-6 flex flex-wrap items-center justify-center gap-2">
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
                                    {cat === 'all' ? 'All Disciplines' : cat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Workouts Grid */}
            <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {filteredWorkouts.length === 0 ? (
                    <div className="text-center py-16 bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a]">
                        <p className="text-sm text-[#888888]">No workout programs found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredWorkouts.map((workout) => (
                            <div
                                key={workout.id}
                                className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] p-8 hover:border-[#faff69]/40 transition-all flex flex-col justify-between space-y-6 group"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="px-3 py-1 rounded-full bg-[#242424] text-[#faff69] text-[10px] font-mono font-bold uppercase">
                                            {workout.category}
                                        </span>
                                        <Flame className="w-5 h-5 text-[#faff69]" />
                                    </div>

                                    <h3 className="text-xl font-bold text-white group-hover:text-[#faff69] transition-colors">
                                        {workout.name}
                                    </h3>

                                    <p className="text-xs text-[#cccccc] leading-relaxed">
                                        {workout.description || 'Targeted training program utilizing compound movements and conditioning intervals to stimulate muscular adaptation.'}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-[#242424] flex items-center justify-between text-xs text-[#888888]">
                                    <span className="flex items-center gap-1.5">
                                        <Target className="w-3.5 h-3.5 text-[#faff69]" />
                                        <span>All Fitness Levels</span>
                                    </span>
                                    <span className="flex items-center gap-1.5 font-mono text-[#cccccc]">
                                        <Activity className="w-3.5 h-3.5 text-[#22c55e]" />
                                        <span>Tracked Session</span>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </PublicLayout>
    );
}
