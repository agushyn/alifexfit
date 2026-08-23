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

class WebsiteCmsTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected Gym $gym;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->gym = Gym::where('code', 'EXF-JKT-01')->first();
        $this->admin = User::where('email', 'admin.flagship@exfits.com')->first();
        $this->actingAs($this->admin);
    }

    public function test_admin_can_view_cms_overview(): void
    {
        $response = $this->get(route('admin.website.overview'));
        $response->assertOk();
    }

    public function test_admin_can_create_cms_page(): void
    {
        $response = $this->post(route('admin.website.pages.store'), [
            'title' => 'VIP Member Benefits',
            'slug' => 'vip-member-benefits',
            'excerpt' => 'Exclusive perks for VIP tier members.',
            'content' => 'Full access to recovery suite and unlimited towel service.',
            'status' => 'published',
            'meta_title' => 'VIP Member Benefits | Exfits',
            'meta_description' => 'Learn all about the perks of being a VIP member.',
            'sort_order' => 5,
        ]);

        $response->assertRedirect(route('admin.website.pages.index'));

        $this->assertDatabaseHas('website_pages', [
            'gym_id' => $this->gym->id,
            'slug' => 'vip-member-benefits',
            'status' => 'published',
        ]);
    }

    public function test_admin_can_update_cms_page(): void
    {
        $page = WebsitePage::where('slug', 'terms-of-service')->first();

        $response = $this->put(route('admin.website.pages.update', $page->id), [
            'title' => 'Updated Terms of Service 2026',
            'slug' => 'terms-of-service',
            'excerpt' => 'Updated terms for 2026 season.',
            'content' => 'Updated content body.',
            'status' => 'published',
            'sort_order' => 1,
        ]);

        $response->assertRedirect(route('admin.website.pages.index'));

        $this->assertDatabaseHas('website_pages', [
            'id' => $page->id,
            'title' => 'Updated Terms of Service 2026',
        ]);
    }

    public function test_admin_can_delete_cms_page(): void
    {
        $page = WebsitePage::where('slug', 'privacy-policy')->first();

        $response = $this->delete(route('admin.website.pages.destroy', $page->id));
        $response->assertRedirect(route('admin.website.pages.index'));

        $this->assertSoftDeleted('website_pages', [
            'id' => $page->id,
        ]);
    }

    public function test_admin_can_create_faq(): void
    {
        $response = $this->post(route('admin.website.faqs.store'), [
            'question' => 'Is there free towel service?',
            'answer' => 'Yes, premium micro-fiber gym towels are provided for every workout session.',
            'category' => 'facilities',
            'status' => 'published',
            'sort_order' => 10,
        ]);

        $response->assertRedirect(route('admin.website.faqs.index'));

        $this->assertDatabaseHas('website_faqs', [
            'gym_id' => $this->gym->id,
            'question' => 'Is there free towel service?',
            'status' => 'published',
        ]);
    }

    public function test_admin_can_create_facility(): void
    {
        $response = $this->post(route('admin.website.facilities.store'), [
            'name' => 'Cold Plunge Ice Bath',
            'description' => 'Sub-zero cryo recovery tubs for accelerated post-workout muscle restoration.',
            'icon' => 'Sparkles',
            'status' => 'active',
            'sort_order' => 5,
        ]);

        $response->assertRedirect(route('admin.website.facilities.index'));

        $this->assertDatabaseHas('website_facilities', [
            'gym_id' => $this->gym->id,
            'name' => 'Cold Plunge Ice Bath',
        ]);
    }

    public function test_admin_can_update_website_settings(): void
    {
        $response = $this->post(route('admin.website.settings.update'), [
            'site_title' => 'Exfits Flagship Mega Gym',
            'meta_title' => 'Exfits Jakarta Mega Gym',
            'meta_description' => 'Updated meta description.',
            'hero_headline' => 'DOMINATE YOUR FITNESS',
            'hero_subheadline' => 'Premium gym facility in Jakarta.',
            'hero_cta_text' => 'JOIN THE MOVEMENT',
            'contact_whatsapp' => '+6281234567890',
            'operating_hours' => '24 Hours Daily',
            'is_public_visible' => true,
        ]);

        $response->assertRedirect(route('admin.website.settings.edit'));

        $this->assertDatabaseHas('gym_settings', [
            'gym_id' => $this->gym->id,
            'group' => 'website',
            'key' => 'site_title',
            'value' => 'Exfits Flagship Mega Gym',
        ]);
    }
}
