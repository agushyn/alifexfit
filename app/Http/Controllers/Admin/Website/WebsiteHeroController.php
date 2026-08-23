<?php

namespace App\Http\Controllers\Admin\Website;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreWebsiteHeroRequest;
use App\Http\Requests\Admin\UpdateWebsiteHeroRequest;
use App\Models\WebsiteHero;
use App\Services\Tenancy\GymContext;
use App\Services\Website\WebsiteHeroService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteHeroController extends Controller
{
    public function __construct(
        protected WebsiteHeroService $heroService,
        protected GymContext $gymContext
    ) {}

    /**
     * List all Hero slides for current gym.
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', WebsiteHero::class);

        $gymId = $this->gymContext->getGymId();

        $query = WebsiteHero::where('gym_id', $gymId)->ordered();

        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        if ($request->filled('status')) {
            $isActive = $request->input('status') === 'active';
            $query->where('is_active', $isActive);
        }

        if ($request->filled('media_type')) {
            $query->where('media_type', $request->input('media_type'));
        }

        $heroes = $query->get();

        $stats = [
            'total' => WebsiteHero::where('gym_id', $gymId)->count(),
            'active' => WebsiteHero::where('gym_id', $gymId)->active()->count(),
            'inactive' => WebsiteHero::where('gym_id', $gymId)->inactive()->count(),
            'video_slides' => WebsiteHero::where('gym_id', $gymId)->where('media_type', 'video')->count(),
            'image_slides' => WebsiteHero::where('gym_id', $gymId)->where('media_type', 'image')->count(),
        ];

        return Inertia::render('Admin/Website/Heroes/Index', [
            'heroes' => $heroes,
            'filters' => $request->only(['search', 'status', 'media_type']),
            'stats' => $stats,
        ]);
    }

    /**
     * Show form to create a new Hero slide.
     */
    public function create(): Response
    {
        Gate::authorize('create', WebsiteHero::class);

        $gymId = $this->gymContext->getGymId();
        $nextSortOrder = (WebsiteHero::where('gym_id', $gymId)->max('sort_order') ?? -1) + 1;

        return Inertia::render('Admin/Website/Heroes/Create', [
            'nextSortOrder' => $nextSortOrder,
        ]);
    }

    /**
     * Store newly created Hero slide.
     */
    public function store(StoreWebsiteHeroRequest $request): RedirectResponse
    {
        Gate::authorize('create', WebsiteHero::class);

        $hero = $this->heroService->createHero(
            data: $request->validated(),
            media: $request->file('media'),
            poster: $request->file('poster')
        );

        return redirect()->route('admin.website.heroes.index')
            ->with('success', "Hero slide '{$hero->title}' berhasil ditambahkan.");
    }

    /**
     * Show form to edit an existing Hero slide.
     */
    public function edit(WebsiteHero $hero): Response
    {
        Gate::authorize('manage', $hero);

        return Inertia::render('Admin/Website/Heroes/Edit', [
            'hero' => $hero,
        ]);
    }

    /**
     * Update an existing Hero slide.
     */
    public function update(UpdateWebsiteHeroRequest $request, WebsiteHero $hero): RedirectResponse
    {
        Gate::authorize('manage', $hero);

        $this->heroService->updateHero(
            hero: $hero,
            data: $request->validated(),
            media: $request->file('media'),
            poster: $request->file('poster')
        );

        return redirect()->route('admin.website.heroes.index')
            ->with('success', "Hero slide '{$hero->title}' berhasil diperbarui.");
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus(WebsiteHero $hero): RedirectResponse
    {
        Gate::authorize('manage', $hero);

        $updated = $this->heroService->toggleStatus($hero);
        $statusLabel = $updated->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Hero slide '{$updated->title}' berhasil {$statusLabel}.");
    }

    /**
     * Reorder heroes.
     */
    public function reorder(Request $request): RedirectResponse
    {
        Gate::authorize('create', WebsiteHero::class);

        $request->validate([
            'ordered_ids' => ['required', 'array'],
            'ordered_ids.*' => ['integer'],
        ]);

        $this->heroService->reorder($request->input('ordered_ids'));

        return back()->with('success', 'Urutan hero slide berhasil diperbarui.');
    }

    /**
     * Delete a Hero slide.
     */
    public function destroy(WebsiteHero $hero): RedirectResponse
    {
        Gate::authorize('manage', $hero);

        $title = $hero->title;
        $this->heroService->deleteHero($hero);

        return redirect()->route('admin.website.heroes.index')
            ->with('success', "Hero slide '{$title}' berhasil dihapus.");
    }
}
