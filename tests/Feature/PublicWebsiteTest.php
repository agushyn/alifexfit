<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\MembershipPlan;
use App\Models\Trainer;
use App\Models\WebsiteHero;
use App\Models\WebsitePage;
use App\Models\WorkoutType;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicWebsiteTest extends TestCase
{
    use RefreshDatabase;

    protected Gym $flagshipGym;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        $this->flagshipGym = Gym::where('code', 'EXF-JKT-01')->firstOrFail();
    }

    public function test_public_homepage_renders_successfully(): void
    {
        $response = $this->get(route('public.home'));
        $response->assertOk();
        $response->assertSee($this->flagshipGym->name);
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Website/Home')
            ->has('branding')
            ->has('heroes')
            ->has('trainers')
            ->has('plans')
        );
    }

    public function test_public_homepage_renders_active_heroes_and_hides_inactive(): void
    {
        WebsiteHero::withoutGymScope()->create([
            'gym_id' => $this->flagshipGym->id,
            'title' => 'Secret VIP Flash Deal',
            'media_type' => 'image',
            'is_active' => false,
            'sort_order' => 99,
        ]);

        $response = $this->get(route('public.home'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('heroes', 2)
            ->where('heroes.0.title', 'HIGH VOLTAGE FITNESS & ELITE TRAINING')
        );
        $response->assertDontSee('Secret VIP Flash Deal');
    }

    public function test_public_membership_page_displays_active_plans_and_hides_inactive(): void
    {
        // Create an inactive plan
        MembershipPlan::create([
            'gym_id' => $this->flagshipGym->id,
            'name' => 'Hidden Secret Tier',
            'slug' => 'hidden-secret-tier',
            'description' => 'Not for public eyes',
            'price' => 999999,
            'billing_period' => 'monthly',
            'duration' => 30,
            'joining_fee' => 0,
            'trainer_quota' => 0,
            'status' => 'inactive',
            'featured' => false,
            'sort_order' => 99,
        ]);

        $response = $this->get(route('public.membership'));
        $response->assertOk();
        $response->assertSee('Basic Monthly');
        $response->assertDontSee('Hidden Secret Tier');
    }

    public function test_public_trainers_page_displays_active_trainers_with_photocard_data(): void
    {
        $response = $this->get(route('public.trainers'));
        $response->assertOk();
        $response->assertSee('Budi Pratama');
        $response->assertSee('Head Strength Coach');
        $response->assertSee('CSCS, NASM-CPT, Precision Nutrition Level 1');

        // Dimas Setiawan is inactive in seeder, should not be visible
        $response->assertDontSee('Dimas Setiawan');
    }

    public function test_public_trainer_detail_page_renders_for_valid_trainer(): void
    {
        $trainer = Trainer::withoutGymScope()->where('status', 'active')->first();

        $response = $this->get(route('public.trainers.show', $trainer->id));
        $response->assertOk();
        $response->assertSee($trainer->name);
        $response->assertSee($trainer->role);
    }

    public function test_public_contact_page_renders_official_address_and_phone(): void
    {
        $response = $this->get(route('public.contact'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Public/Website/Contact')
            ->has('branding.gym.address')
            ->where('branding.gym.phone', '0896-7580-1787')
        );
        $response->assertSee('Ruko New Castle', false);
        $response->assertSee('0896-7580-1787', false);
    }

    public function test_public_website_does_not_contain_visible_admin_portal_links(): void
    {
        $pages = [
            route('public.home'),
            route('public.membership'),
            route('public.trainers'),
            route('public.workouts'),
            route('public.facilities'),
            route('public.about'),
            route('public.faq'),
            route('public.contact'),
        ];

        foreach ($pages as $url) {
            $response = $this->get($url);
            $response->assertOk();
            $response->assertDontSee('ADMIN PORTAL');
            $response->assertDontSee('STAFF LOGIN');
            $response->assertDontSee('GO TO ADMIN PORTAL');
            $response->assertDontSee('Staff Portal');
        }
    }

    public function test_public_website_renders_real_logoex_asset(): void
    {
        $response = $this->get(route('public.home'));
        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->has('branding.gym.logo_url')
        );
        $response->assertSee('LogoEX.png', false);
    }

    public function test_public_custom_cms_page_renders(): void
    {
        $response = $this->get(route('public.pages.show', 'terms-of-service'));
        $response->assertOk();
        $response->assertSee('Terms of Service');
    }

    public function test_public_custom_cms_page_returns_404_for_non_existent_slug(): void
    {
        $response = $this->get(route('public.pages.show', 'unknown-missing-page'));
        $response->assertNotFound();
    }
}
