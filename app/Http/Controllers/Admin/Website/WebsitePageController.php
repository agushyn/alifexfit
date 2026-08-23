<?php

namespace App\Http\Controllers\Admin\Website;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreWebsitePageRequest;
use App\Http\Requests\Admin\UpdateWebsitePageRequest;
use App\Models\WebsitePage;
use App\Services\Tenancy\GymContext;
use App\Services\Website\WebsiteService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class WebsitePageController extends Controller
{
    public function __construct(
        protected WebsiteService $websiteService,
        protected GymContext $gymContext
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', WebsitePage::class);

        $gymId = $this->gymContext->getGymId();
        $query = WebsitePage::where('gym_id', $gymId);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $pages = $query->ordered()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Website/Pages/Index', [
            'pages' => $pages,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('createPage', WebsitePage::class);

        return Inertia::render('Admin/Website/Pages/Create');
    }

    public function store(StoreWebsitePageRequest $request): RedirectResponse
    {
        $page = $this->websiteService->createPage(
            data: $request->validated(),
            ogImage: $request->file('og_image')
        );

        return redirect()->route('admin.website.pages.index')
            ->with('success', "Halaman '{$page->title}' berhasil dibuat.");
    }

    public function edit(WebsitePage $page): Response
    {
        Gate::authorize('updatePage', $page);

        return Inertia::render('Admin/Website/Pages/Edit', [
            'page' => $page,
        ]);
    }

    public function update(UpdateWebsitePageRequest $request, WebsitePage $page): RedirectResponse
    {
        $updated = $this->websiteService->updatePage(
            page: $page,
            data: $request->validated(),
            ogImage: $request->file('og_image')
        );

        return redirect()->route('admin.website.pages.index')
            ->with('success', "Halaman '{$updated->title}' berhasil diperbarui.");
    }

    public function destroy(WebsitePage $page): RedirectResponse
    {
        Gate::authorize('deletePage', $page);

        $title = $page->title;
        $this->websiteService->deletePage($page);

        return redirect()->route('admin.website.pages.index')
            ->with('success', "Halaman '{$title}' berhasil dihapus.");
    }
}
