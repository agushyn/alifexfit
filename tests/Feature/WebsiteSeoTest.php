<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\WebsitePage;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebsiteSeoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_homepage_includes_seo_meta_tags(): void
    {
        $response = $this->get(route('public.home'));
        $response->assertOk();
        $response->assertSee('Exfits Flagship Jakarta | High Voltage Performance Gym');
    }

    public function test_custom_page_includes_custom_seo_meta(): void
    {
        $page = WebsitePage::where('slug', 'terms-of-service')->first();
        $page->update([
            'meta_title' => 'Custom Terms of Service 2026',
            'meta_description' => 'Detailed legal conditions for Exfits membership.',
        ]);

        $response = $this->get(route('public.pages.show', 'terms-of-service'));
        $response->assertOk();
        $response->assertSee('Custom Terms of Service 2026');
    }
}
