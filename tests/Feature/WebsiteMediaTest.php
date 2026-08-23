<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WebsiteMediaTest extends TestCase
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

        Storage::fake('public');
    }

    public function test_admin_can_upload_facility_photo(): void
    {
        $file = UploadedFile::fake()->image('sauna.jpg', 800, 600);

        $response = $this->post(route('admin.website.facilities.store'), [
            'name' => 'Infrared Sauna Suite',
            'description' => 'Therapeutic heat suite.',
            'icon' => 'Shield',
            'status' => 'active',
            'sort_order' => 1,
            'image' => $file,
        ]);

        $response->assertRedirect(route('admin.website.facilities.index'));

        $this->assertDatabaseHas('website_facilities', [
            'gym_id' => $this->gym->id,
            'name' => 'Infrared Sauna Suite',
        ]);
    }
}
