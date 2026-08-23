<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\User;
use App\Models\WebsiteHero;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WebsiteHeroCmsTest extends TestCase
{
    use RefreshDatabase;

    protected Gym $flagshipGym;
    protected Gym $surabayaGym;
    protected User $adminJkt;
    protected User $adminSby;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->seed(DatabaseSeeder::class);

        $this->flagshipGym = Gym::where('code', 'EXF-JKT-01')->firstOrFail();
        $this->surabayaGym = Gym::where('code', 'EXF-SBY-02')->firstOrFail();

        $this->adminJkt = User::where('email', 'admin.flagship@exfits.com')->firstOrFail();
        $this->adminSby = User::where('email', 'admin.surabaya@exfits.com')->firstOrFail();
    }

    public function test_admin_can_view_heroes_index(): void
    {
        $response = $this->actingAs($this->adminJkt)
            ->get(route('admin.website.heroes.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Website/Heroes/Index')
            ->has('heroes')
            ->has('stats')
        );
    }

    public function test_admin_can_create_hero_slide_with_image(): void
    {
        $image = UploadedFile::fake()->image('hero-banner.jpg', 1920, 1080);
        $poster = UploadedFile::fake()->image('poster.jpg', 1920, 1080);

        $response = $this->actingAs($this->adminJkt)
            ->post(route('admin.website.heroes.store'), [
                'title' => 'High Voltage Training 2026',
                'subtitle' => 'Peak Performance',
                'description' => 'Experience elite strength equipment.',
                'cta_label' => 'Join Today',
                'cta_url' => '/membership',
                'media_type' => 'image',
                'media' => $image,
                'poster' => $poster,
                'sort_order' => 5,
                'is_active' => 1,
            ]);

        $response->assertRedirect(route('admin.website.heroes.index'));

        $this->assertDatabaseHas('website_heroes', [
            'gym_id' => $this->flagshipGym->id,
            'title' => 'High Voltage Training 2026',
            'subtitle' => 'Peak Performance',
            'media_type' => 'image',
            'is_active' => 1,
        ]);

        $hero = WebsiteHero::where('title', 'High Voltage Training 2026')->first();
        $this->assertNotNull($hero->media_path);
        $this->assertNotNull($hero->poster_path);
        Storage::disk('public')->assertExists($hero->media_path);
        Storage::disk('public')->assertExists($hero->poster_path);
    }

    public function test_admin_can_create_hero_slide_with_video(): void
    {
        $video = UploadedFile::fake()->create('cinematic.mp4', 5000, 'video/mp4');

        $response = $this->actingAs($this->adminJkt)
            ->post(route('admin.website.heroes.store'), [
                'title' => 'Cinematic Fitness Video',
                'media_type' => 'video',
                'media' => $video,
                'sort_order' => 0,
                'is_active' => 1,
            ]);

        $response->assertRedirect(route('admin.website.heroes.index'));

        $this->assertDatabaseHas('website_heroes', [
            'gym_id' => $this->flagshipGym->id,
            'title' => 'Cinematic Fitness Video',
            'media_type' => 'video',
        ]);
    }

    public function test_admin_can_update_hero_slide(): void
    {
        $hero = WebsiteHero::withoutGymScope()->create([
            'gym_id' => $this->flagshipGym->id,
            'title' => 'Original Title',
            'media_type' => 'image',
            'sort_order' => 0,
            'is_active' => true,
        ]);

        $newImage = UploadedFile::fake()->image('updated.png');

        $response = $this->actingAs($this->adminJkt)
            ->put(route('admin.website.heroes.update', $hero->id), [
                'title' => 'Updated Title Slide',
                'subtitle' => 'New Subtitle',
                'media_type' => 'image',
                'media' => $newImage,
                'sort_order' => 2,
                'is_active' => 1,
            ]);

        $response->assertRedirect(route('admin.website.heroes.index'));

        $this->assertDatabaseHas('website_heroes', [
            'id' => $hero->id,
            'title' => 'Updated Title Slide',
            'subtitle' => 'New Subtitle',
            'sort_order' => 2,
        ]);
    }

    public function test_admin_can_toggle_hero_status(): void
    {
        $hero = WebsiteHero::withoutGymScope()->create([
            'gym_id' => $this->flagshipGym->id,
            'title' => 'Active Slide',
            'media_type' => 'image',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->adminJkt)
            ->post(route('admin.website.heroes.toggle-status', $hero->id));

        $response->assertRedirect();
        $this->assertDatabaseHas('website_heroes', [
            'id' => $hero->id,
            'is_active' => 0,
        ]);
    }

    public function test_admin_can_reorder_heroes(): void
    {
        $hero1 = WebsiteHero::withoutGymScope()->create(['gym_id' => $this->flagshipGym->id, 'title' => 'Slide 1', 'sort_order' => 0]);
        $hero2 = WebsiteHero::withoutGymScope()->create(['gym_id' => $this->flagshipGym->id, 'title' => 'Slide 2', 'sort_order' => 1]);

        $response = $this->actingAs($this->adminJkt)
            ->post(route('admin.website.heroes.reorder'), [
                'ordered_ids' => [$hero2->id, $hero1->id],
            ]);

        $response->assertRedirect();

        $this->assertEquals(0, $hero2->fresh()->sort_order);
        $this->assertEquals(1, $hero1->fresh()->sort_order);
    }

    public function test_admin_can_delete_hero_slide_and_media_is_cleaned(): void
    {
        $image = UploadedFile::fake()->image('delete-me.jpg');
        $path = $image->store("gyms/{$this->flagshipGym->id}/heroes/images", 'public');

        $hero = WebsiteHero::withoutGymScope()->create([
            'gym_id' => $this->flagshipGym->id,
            'title' => 'To Delete',
            'media_type' => 'image',
            'media_path' => $path,
        ]);

        Storage::disk('public')->assertExists($path);

        $response = $this->actingAs($this->adminJkt)
            ->delete(route('admin.website.heroes.destroy', $hero->id));

        $response->assertRedirect(route('admin.website.heroes.index'));
        $this->assertDatabaseMissing('website_heroes', ['id' => $hero->id]);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_tenant_isolation_prevents_unauthorized_access(): void
    {
        $heroSby = WebsiteHero::withoutGymScope()->create([
            'gym_id' => $this->surabayaGym->id,
            'title' => 'Gym Surabaya Slide',
            'media_type' => 'image',
            'is_active' => true,
        ]);

        // Admin Jakarta tries to edit Surabaya hero slide (GymScope hides it returning 404 or 403)
        $response = $this->actingAs($this->adminJkt)
            ->get(route('admin.website.heroes.edit', $heroSby->id));

        $this->assertTrue(in_array($response->getStatusCode(), [403, 404]));

        // Admin Jakarta tries to delete Surabaya hero slide
        $deleteResponse = $this->actingAs($this->adminJkt)
            ->delete(route('admin.website.heroes.destroy', $heroSby->id));

        $this->assertTrue(in_array($deleteResponse->getStatusCode(), [403, 404]));
        $this->assertDatabaseHas('website_heroes', ['id' => $heroSby->id]);
    }
}
