<?php

namespace App\Http\Controllers\Admin\Website;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreWebsiteFaqRequest;
use App\Http\Requests\Admin\UpdateWebsiteFaqRequest;
use App\Models\WebsiteFaq;
use App\Services\Tenancy\GymContext;
use App\Services\Website\WebsiteService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteFaqController extends Controller
{
    public function __construct(
        protected WebsiteService $websiteService,
        protected GymContext $gymContext
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('manageFaq', WebsiteFaq::class);

        $gymId = $this->gymContext->getGymId();
        $query = WebsiteFaq::where('gym_id', $gymId);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('question', 'like', "%{$search}%")
                    ->orWhere('answer', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category')) {
            $query->where('category', $request->input('category'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $faqs = $query->ordered()->paginate(20)->withQueryString();

        $categories = WebsiteFaq::where('gym_id', $gymId)->distinct()->pluck('category')->filter()->values();

        return Inertia::render('Admin/Website/Faqs/Index', [
            'faqs' => $faqs,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category', 'status']),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('manageFaq', WebsiteFaq::class);

        $gymId = $this->gymContext->getGymId();
        $categories = WebsiteFaq::where('gym_id', $gymId)->distinct()->pluck('category')->filter()->values();

        return Inertia::render('Admin/Website/Faqs/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreWebsiteFaqRequest $request): RedirectResponse
    {
        $this->websiteService->createFaq($request->validated());

        return redirect()->route('admin.website.faqs.index')
            ->with('success', 'FAQ berhasil ditambahkan.');
    }

    public function edit(WebsiteFaq $faq): Response
    {
        Gate::authorize('manageFaq', $faq);

        $gymId = $this->gymContext->getGymId();
        $categories = WebsiteFaq::where('gym_id', $gymId)->distinct()->pluck('category')->filter()->values();

        return Inertia::render('Admin/Website/Faqs/Edit', [
            'faq' => $faq,
            'categories' => $categories,
        ]);
    }

    public function update(UpdateWebsiteFaqRequest $request, WebsiteFaq $faq): RedirectResponse
    {
        $this->websiteService->updateFaq($faq, $request->validated());

        return redirect()->route('admin.website.faqs.index')
            ->with('success', 'FAQ berhasil diperbarui.');
    }

    public function destroy(WebsiteFaq $faq): RedirectResponse
    {
        Gate::authorize('manageFaq', $faq);

        $this->websiteService->deleteFaq($faq);

        return redirect()->route('admin.website.faqs.index')
            ->with('success', 'FAQ berhasil dihapus.');
    }
}
