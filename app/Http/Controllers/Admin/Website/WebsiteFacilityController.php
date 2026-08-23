<?php

namespace App\Http\Controllers\Admin\Website;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreWebsiteFacilityRequest;
use App\Http\Requests\Admin\UpdateWebsiteFacilityRequest;
use App\Models\WebsiteFacility;
use App\Services\Tenancy\GymContext;
use App\Services\Website\WebsiteService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class WebsiteFacilityController extends Controller
{
    public function __construct(
        protected WebsiteService $websiteService,
        protected GymContext $gymContext
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('manageFacility', WebsiteFacility::class);

        $gymId = $this->gymContext->getGymId();
        $query = WebsiteFacility::where('gym_id', $gymId);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('name', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $facilities = $query->ordered()->paginate(15)->withQueryString();

        return Inertia::render('Admin/Website/Facilities/Index', [
            'facilities' => $facilities,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('manageFacility', WebsiteFacility::class);

        return Inertia::render('Admin/Website/Facilities/Create');
    }

    public function store(StoreWebsiteFacilityRequest $request): RedirectResponse
    {
        $facility = $this->websiteService->createFacility(
            data: $request->validated(),
            image: $request->file('image')
        );

        return redirect()->route('admin.website.facilities.index')
            ->with('success', "Fasilitas '{$facility->name}' berhasil ditambahkan.");
    }

    public function edit(WebsiteFacility $facility): Response
    {
        Gate::authorize('manageFacility', $facility);

        return Inertia::render('Admin/Website/Facilities/Edit', [
            'facility' => $facility,
        ]);
    }

    public function update(UpdateWebsiteFacilityRequest $request, WebsiteFacility $facility): RedirectResponse
    {
        $updated = $this->websiteService->updateFacility(
            facility: $facility,
            data: $request->validated(),
            image: $request->file('image')
        );

        return redirect()->route('admin.website.facilities.index')
            ->with('success', "Fasilitas '{$updated->name}' berhasil diperbarui.");
    }

    public function destroy(WebsiteFacility $facility): RedirectResponse
    {
        Gate::authorize('manageFacility', $facility);

        $name = $facility->name;
        $this->websiteService->deleteFacility($facility);

        return redirect()->route('admin.website.facilities.index')
            ->with('success', "Fasilitas '{$name}' berhasil dihapus.");
    }
}
