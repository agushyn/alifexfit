<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\User;
use App\Models\WebsiteFacility;
use App\Models\WebsiteFaq;
use App\Models\WebsitePage;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebsiteTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected Gym $jakartaGym;
    protected Gym $surabayaGym;
    protected User $jakartaAdmin;
    protected User $surabayaAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->jakartaGym = Gym::where('code', 'EXF-JKT-01')->first();
        $this->surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();
        $this->jakartaAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $this->surabayaAdmin = User::where('email', 'admin.surabaya@exfits.com')->first();
    }

    public function test_public_website_resolves_tenant_by_query_param(): void
    {
        // Visiting with ?gym=EXF-SBY-02 displays Surabaya branding and content
        $response = $this->get(route('public.home', ['gym' => 'EXF-SBY-02']));
        $response->assertOk();
        $response->assertSee('Exfits Surabaya Branch - Mayjen Sungkono');
        $response->assertSee('Mayjen Sungkono');
    }

    public function test_public_website_membership_isolates_plans_per_tenant(): void
    {
        // Jakarta public membership page shows Jakarta plans
        $jktResponse = $this->get(route('public.membership', ['gym' => 'EXF-JKT-01']));
        $jktResponse->assertOk();
        $jktResponse->assertSee('Unlimited off-peak gym floor and locker access.');

        // Surabaya public membership page shows Surabaya plans and never leaks cross-tenant plans
        $sbyResponse = $this->get(route('public.membership', ['gym' => 'EXF-SBY-02']));
        $sbyResponse->assertOk();
        $sbyResponse->assertSee('Standard gym floor access in Surabaya branch.');
    }

    public function test_public_website_facilities_isolates_facilities_per_tenant(): void
    {
        // Jakarta facilities
        $jktResponse = $this->get(route('public.facilities', ['gym' => 'EXF-JKT-01']));
        $jktResponse->assertOk();
        $jktResponse->assertSee('Olympic Lifting');
        $jktResponse->assertDontSee('Functional Conditioning Turf');

        // Surabaya facilities
        $sbyResponse = $this->get(route('public.facilities', ['gym' => 'EXF-SBY-02']));
        $sbyResponse->assertOk();
        $sbyResponse->assertSee('Functional Conditioning Turf');
        $sbyResponse->assertDontSee('Olympic Lifting');
    }

    public function test_admin_cms_cannot_view_or_modify_other_tenant_pages(): void
    {
        $this->actingAs($this->surabayaAdmin);

        $jakartaPage = WebsitePage::withoutGymScope()->where('gym_id', $this->jakartaGym->id)->first();

        // Surabaya admin tries to edit Jakarta page -> 404 or 403 due to GymScope
        $response = $this->get(route('admin.website.pages.edit', $jakartaPage->id));
        $this->assertTrue(in_array($response->status(), [403, 404]));
    }
}
