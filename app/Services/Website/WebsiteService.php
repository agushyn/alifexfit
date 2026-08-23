<?php

namespace App\Services\Website;

use App\Models\Gym;
use App\Models\GymSetting;
use App\Models\MembershipPlan;
use App\Models\Trainer;
use App\Models\WebsiteFacility;
use App\Models\WebsiteFaq;
use App\Models\WebsiteHero;
use App\Models\WebsitePage;
use App\Models\WebsiteSection;
use App\Models\WorkoutType;
use App\Services\Audit\AuditService;
use App\Services\Settings\SettingService;
use App\Services\Tenancy\GymContext;
use App\Services\Trainer\TrainerAvailabilityService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class WebsiteService
{
    public const OFFICIAL_EXFIT_ADDRESS = 'Ruko New Castle, Jl. Green Lake City Boulevard No. B 2 - 3, RT.003/RW.008, Petir, Kec. Cipondoh, Kota Tangerang, Banten 15147';
    public const OFFICIAL_EXFIT_PHONE = '0896-7580-1787';

    public function __construct(
        protected SettingService $settingService,
        protected GymContext $gymContext,
        protected AuditService $auditService,
        protected TrainerAvailabilityService $trainerAvailabilityService
    ) {}

    /**
     * Get public-safe gym profile & branding settings.
     */
    public function getPublicBranding(Gym $gym): array
    {
        $settings = $this->settingService->all($gym->id, 'website');
        $generalSettings = $this->settingService->all($gym->id, 'general');

        $officialAddress = $settings['contact_address'] ?? ($gym->address ?: self::OFFICIAL_EXFIT_ADDRESS);
        $officialPhone = $settings['contact_phone'] ?? ($gym->phone ?: self::OFFICIAL_EXFIT_PHONE);

        return [
            'gym' => [
                'id' => $gym->id,
                'name' => $gym->name,
                'slug' => $gym->slug,
                'code' => $gym->code,
                'phone' => $officialPhone,
                'email' => $settings['contact_email'] ?? $gym->email,
                'address' => $officialAddress,
                'logo_url' => $gym->logo ? asset('storage/' . $gym->logo) : asset('images/LogoEX.png'),
                'timezone' => $gym->timezone,
            ],
            'settings' => [
                'site_title' => $settings['site_title'] ?? ($gym->name . ' - High Performance Gym'),
                'meta_title' => $settings['meta_title'] ?? ($gym->name . ' | Strength, Fitness & Personal Training'),
                'meta_description' => $settings['meta_description'] ?? 'Join ' . $gym->name . '. Elite fitness facility with world-class personal trainers, functional training zones, and dynamic workout programs.',
                'hero_headline' => $settings['hero_headline'] ?? 'HIGH VOLTAGE FITNESS & ELITE TRAINING',
                'hero_subheadline' => $settings['hero_subheadline'] ?? 'State-of-the-art equipment, certified strength coaches, and results-driven training plans engineered for your peak performance.',
                'hero_cta_text' => $settings['hero_cta_text'] ?? 'EXPLORE MEMBERSHIPS',
                'social_instagram' => $settings['social_instagram'] ?? 'https://instagram.com/exfitsgym',
                'social_facebook' => $settings['social_facebook'] ?? 'https://facebook.com/exfitsgym',
                'social_youtube' => $settings['social_youtube'] ?? 'https://youtube.com/@exfitsgym',
                'social_tiktok' => $settings['social_tiktok'] ?? 'https://tiktok.com/@exfitsgym',
                'contact_whatsapp' => $settings['contact_whatsapp'] ?? $officialPhone,
                'operating_hours' => $settings['operating_hours'] ?? ($generalSettings['operating_hours'] ?? 'Mon - Sun: 06:00 - 22:00 WIB'),
                'announcement_bar' => $settings['announcement_bar'] ?? null,
                'google_maps_embed_url' => $settings['google_maps_embed_url'] ?? null,
                'is_public_visible' => (bool) ($settings['is_public_visible'] ?? true),
                'og_image_url' => ! empty($settings['og_image']) ? asset('storage/' . $settings['og_image']) : asset('images/LogoEX.png'),
            ],
        ];
    }

    /**
     * Get sanitized public hero slides for this gym.
     */
    public function getPublicHeroes(Gym $gym): Collection
    {
        $heroes = WebsiteHero::forGym($gym->id)
            ->active()
            ->ordered()
            ->get();

        if ($heroes->isEmpty()) {
            // Provide high-impact default slide
            return collect([
                [
                    'id' => 0,
                    'title' => 'HIGH VOLTAGE FITNESS & ELITE TRAINING',
                    'subtitle' => 'ENGINEERED FOR PEAK PERFORMANCE',
                    'description' => 'World-class equipment, certified coaches, and high-performance training systems engineered for your transformation.',
                    'cta_label' => 'EXPLORE MEMBERSHIPS',
                    'cta_url' => route('public.membership'),
                    'media_type' => 'image',
                    'media_url' => null,
                    'poster_url' => null,
                    'sort_order' => 0,
                ],
            ]);
        }

        return $heroes->map(fn (WebsiteHero $hero) => [
            'id' => $hero->id,
            'title' => $hero->title,
            'subtitle' => $hero->subtitle,
            'description' => $hero->description,
            'cta_label' => $hero->cta_label,
            'cta_url' => $hero->cta_url,
            'media_type' => $hero->media_type,
            'media_url' => $hero->media_url,
            'poster_url' => $hero->poster_url,
            'sort_order' => $hero->sort_order,
        ]);
    }

    /**
     * Get sanitized public membership plans for this gym.
     */
    public function getPublicMembershipPlans(Gym $gym): Collection
    {
        return MembershipPlan::forGym($gym->id)
            ->where('status', 'active')
            ->orderBy('sort_order', 'asc')
            ->orderBy('price', 'asc')
            ->get()
            ->map(fn (MembershipPlan $plan) => [
                'id' => $plan->id,
                'name' => $plan->name,
                'slug' => $plan->slug,
                'description' => $plan->description,
                'price' => (float) $plan->price,
                'formatted_price' => 'Rp ' . number_format($plan->price, 0, ',', '.'),
                'duration_days' => (int) $plan->duration,
                'formatted_duration' => $plan->duration >= 360 ? '1 Year' : ($plan->duration >= 30 ? round($plan->duration / 30) . ' Month' . (round($plan->duration / 30) > 1 ? 's' : '') : $plan->duration . ' Days'),
                'trainer_quota_total' => (int) $plan->trainer_quota,
                'features' => is_array($plan->benefits) ? $plan->benefits : [],
                'is_featured' => (bool) ($plan->featured ?? false),
            ]);
    }

    /**
     * Get sanitized public trainers for this gym (Photocard data).
     */
    public function getPublicTrainers(Gym $gym): Collection
    {
        return Trainer::forGym($gym->id)
            ->where('status', 'active')
            ->with(['activeSchedules' => fn ($q) => $q->orderBy('day_of_week')->orderBy('start_time')])
            ->ordered()
            ->get()
            ->map(fn (Trainer $trainer) => [
                'id' => $trainer->id,
                'name' => $trainer->name,
                'role' => $trainer->role ?: 'Certified Personal Trainer',
                'specialization' => $trainer->specialization ?: 'Strength & Conditioning',
                'certification' => $trainer->certification,
                'bio' => $trainer->bio,
                'profile_photo_url' => $trainer->profile_photo_url,
                'sort_order' => $trainer->sort_order,
                'is_available_now' => $this->trainerAvailabilityService->isTrainerAvailable($trainer, gymId: $gym->id),
                'schedules' => $trainer->activeSchedules->map(fn ($s) => [
                    'day_of_week' => $s->day_of_week,
                    'day_name' => $s->day_name,
                    'formatted_time_range' => $s->formatted_time_range,
                ]),
            ]);
    }

    /**
     * Get sanitized public workout types.
     */
    public function getPublicWorkoutTypes(Gym $gym): Collection
    {
        return WorkoutType::forGym($gym->id)
            ->where('status', 'active')
            ->orderBy('category')
            ->orderBy('name')
            ->get()
            ->map(fn (WorkoutType $workout) => [
                'id' => $workout->id,
                'name' => $workout->name,
                'category' => $workout->category,
                'description' => $workout->description,
            ]);
    }

    /**
     * Get active public facilities.
     */
    public function getPublicFacilities(Gym $gym): Collection
    {
        return WebsiteFacility::forGym($gym->id)
            ->active()
            ->ordered()
            ->get()
            ->map(fn (WebsiteFacility $facility) => [
                'id' => $facility->id,
                'name' => $facility->name,
                'description' => $facility->description,
                'image_url' => $facility->image_url,
                'icon' => $facility->icon ?? 'Dumbbell',
            ]);
    }

    /**
     * Get published public FAQs.
     */
    public function getPublicFaqs(Gym $gym, ?string $category = null): Collection
    {
        $query = WebsiteFaq::forGym($gym->id)->published()->ordered();

        if ($category) {
            $query->forCategory($category);
        }

        return $query->get()->map(fn (WebsiteFaq $faq) => [
            'id' => $faq->id,
            'question' => $faq->question,
            'answer' => $faq->answer,
            'category' => $faq->category ?? 'general',
        ]);
    }

    /**
     * Get active homepage sections.
     */
    public function getPublicSections(Gym $gym): array
    {
        return WebsiteSection::forGym($gym->id)
            ->active()
            ->ordered()
            ->get()
            ->keyBy('section_key')
            ->map(fn (WebsiteSection $section) => [
                'title' => $section->title,
                'subtitle' => $section->subtitle,
                'content' => $section->content,
                'image_url' => $section->image_url,
                'button_text' => $section->button_text,
                'button_url' => $section->button_url,
                'metadata' => $section->metadata,
            ])
            ->toArray();
    }

    /**
     * Get public CMS page by slug.
     */
    public function getPublicPage(Gym $gym, string $slug): ?WebsitePage
    {
        return WebsitePage::forGym($gym->id)
            ->where('slug', $slug)
            ->published()
            ->first();
    }

    // ==========================================
    // CMS Management Methods (Admin)
    // ==========================================

    /**
     * Create a website page.
     */
    public function createPage(array $data, ?UploadedFile $ogImage = null, ?int $gymId = null): WebsitePage
    {
        return DB::transaction(function () use ($data, $ogImage, $gymId) {
            $resolvedGymId = $gymId ?? $this->gymContext->getGymId();

            if ($ogImage) {
                $path = $ogImage->store('website/og', 'public');
                $data['og_image'] = $path;
            }

            $data['gym_id'] = $resolvedGymId;
            $page = WebsitePage::create($data);

            $this->auditService->log(
                action: 'website_page.created',
                entityType: WebsitePage::class,
                entityId: $page->id,
                metadata: ['title' => $page->title, 'slug' => $page->slug, 'status' => $page->status],
                gymId: $resolvedGymId
            );

            return $page;
        });
    }

    /**
     * Update a website page.
     */
    public function updatePage(WebsitePage $page, array $data, ?UploadedFile $ogImage = null): WebsitePage
    {
        return DB::transaction(function () use ($page, $data, $ogImage) {
            if ($ogImage) {
                if ($page->og_image && Storage::disk('public')->exists($page->og_image)) {
                    Storage::disk('public')->delete($page->og_image);
                }
                $data['og_image'] = $ogImage->store('website/og', 'public');
            }

            $oldStatus = $page->status;
            $page->update($data);

            $this->auditService->log(
                action: $oldStatus !== $page->status ? 'website_page.status_changed' : 'website_page.updated',
                entityType: WebsitePage::class,
                entityId: $page->id,
                metadata: ['title' => $page->title, 'old_status' => $oldStatus, 'new_status' => $page->status],
                gymId: $page->gym_id
            );

            return $page;
        });
    }

    /**
     * Delete a website page.
     */
    public function deletePage(WebsitePage $page): void
    {
        $pageId = $page->id;
        $title = $page->title;
        $gymId = $page->gym_id;

        $page->delete();

        $this->auditService->log(
            action: 'website_page.deleted',
            entityType: WebsitePage::class,
            entityId: $pageId,
            metadata: ['title' => $title],
            gymId: $gymId
        );
    }

    /**
     * Create a website FAQ.
     */
    public function createFaq(array $data, ?int $gymId = null): WebsiteFaq
    {
        $resolvedGymId = $gymId ?? $this->gymContext->getGymId();
        $data['gym_id'] = $resolvedGymId;

        $faq = WebsiteFaq::create($data);

        $this->auditService->log(
            action: 'website_faq.created',
            entityType: WebsiteFaq::class,
            entityId: $faq->id,
            metadata: ['question' => $faq->question, 'category' => $faq->category],
            gymId: $resolvedGymId
        );

        return $faq;
    }

    /**
     * Update a website FAQ.
     */
    public function updateFaq(WebsiteFaq $faq, array $data): WebsiteFaq
    {
        $faq->update($data);

        $this->auditService->log(
            action: 'website_faq.updated',
            entityType: WebsiteFaq::class,
            entityId: $faq->id,
            metadata: ['question' => $faq->question, 'status' => $faq->status],
            gymId: $faq->gym_id
        );

        return $faq;
    }

    /**
     * Delete a website FAQ.
     */
    public function deleteFaq(WebsiteFaq $faq): void
    {
        $faqId = $faq->id;
        $question = $faq->question;
        $gymId = $faq->gym_id;

        $faq->delete();

        $this->auditService->log(
            action: 'website_faq.deleted',
            entityType: WebsiteFaq::class,
            entityId: $faqId,
            metadata: ['question' => $question],
            gymId: $gymId
        );
    }

    /**
     * Create a website facility.
     */
    public function createFacility(array $data, ?UploadedFile $image = null, ?int $gymId = null): WebsiteFacility
    {
        return DB::transaction(function () use ($data, $image, $gymId) {
            $resolvedGymId = $gymId ?? $this->gymContext->getGymId();

            if ($image) {
                $path = $image->store('website/facilities', 'public');
                $data['image'] = $path;
            }

            $data['gym_id'] = $resolvedGymId;
            $facility = WebsiteFacility::create($data);

            $this->auditService->log(
                action: 'website_facility.created',
                entityType: WebsiteFacility::class,
                entityId: $facility->id,
                metadata: ['name' => $facility->name, 'status' => $facility->status],
                gymId: $resolvedGymId
            );

            return $facility;
        });
    }

    /**
     * Update a website facility.
     */
    public function updateFacility(WebsiteFacility $facility, array $data, ?UploadedFile $image = null): WebsiteFacility
    {
        return DB::transaction(function () use ($facility, $data, $image) {
            if ($image) {
                if ($facility->image && Storage::disk('public')->exists($facility->image)) {
                    Storage::disk('public')->delete($facility->image);
                }
                $data['image'] = $image->store('website/facilities', 'public');
            }

            $facility->update($data);

            $this->auditService->log(
                action: 'website_facility.updated',
                entityType: WebsiteFacility::class,
                entityId: $facility->id,
                metadata: ['name' => $facility->name, 'status' => $facility->status],
                gymId: $facility->gym_id
            );

            return $facility;
        });
    }

    /**
     * Delete a website facility.
     */
    public function deleteFacility(WebsiteFacility $facility): void
    {
        $facilityId = $facility->id;
        $name = $facility->name;
        $gymId = $facility->gym_id;

        $facility->delete();

        $this->auditService->log(
            action: 'website_facility.deleted',
            entityType: WebsiteFacility::class,
            entityId: $facilityId,
            metadata: ['name' => $name],
            gymId: $gymId
        );
    }

    /**
     * Update or create a website section block (e.g. hero, cta).
     */
    public function updateSection(string $sectionKey, array $data, ?UploadedFile $image = null, ?int $gymId = null): WebsiteSection
    {
        return DB::transaction(function () use ($sectionKey, $data, $image, $gymId) {
            $resolvedGymId = $gymId ?? $this->gymContext->getGymId();

            $section = WebsiteSection::where('gym_id', $resolvedGymId)
                ->where('section_key', $sectionKey)
                ->first();

            if ($image) {
                if ($section && $section->image && Storage::disk('public')->exists($section->image)) {
                    Storage::disk('public')->delete($section->image);
                }
                $data['image'] = $image->store('website/sections', 'public');
            }

            $data['gym_id'] = $resolvedGymId;
            $data['section_key'] = $sectionKey;

            $section = WebsiteSection::updateOrCreate(
                ['gym_id' => $resolvedGymId, 'section_key' => $sectionKey],
                $data
            );

            $this->auditService->log(
                action: 'website_section.updated',
                entityType: WebsiteSection::class,
                entityId: $section->id,
                metadata: ['section_key' => $sectionKey, 'title' => $section->title],
                gymId: $resolvedGymId
            );

            return $section;
        });
    }

    /**
     * Update website settings.
     */
    public function updateWebsiteSettings(array $settings, ?int $gymId = null): void
    {
        $resolvedGymId = $gymId ?? $this->gymContext->getGymId();

        foreach ($settings as $key => $value) {
            $this->settingService->set(
                key: $key,
                value: $value,
                group: 'website',
                gymId: $resolvedGymId
            );
        }

        $this->auditService->log(
            action: 'website_settings.updated',
            entityType: GymSetting::class,
            metadata: ['keys' => array_keys($settings), 'gym_id' => $resolvedGymId],
            gymId: $resolvedGymId
        );
    }
}
