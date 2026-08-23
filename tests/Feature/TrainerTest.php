<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\Trainer;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TrainerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_authorized_user_can_view_trainers_index(): void
    {
        $admin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($admin)->get(route('admin.trainers.index'));
        $response->assertOk();
    }

    public function test_trainers_can_be_filtered(): void
    {
        $admin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($admin)->get(route('admin.trainers.index', [
            'search' => 'Budi',
            'status' => 'active',
        ]));
        $response->assertStatus(200);
    }

    public function test_authorized_user_can_view_trainer_create_page(): void
    {
        $admin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($admin)->get(route('admin.trainers.create'));
        $response->assertStatus(200);
    }

    public function test_authorized_user_can_create_trainer(): void
    {
        Storage::fake('public');
        $admin = User::where('email', 'admin.flagship@exfits.com')->first();

        $photo = UploadedFile::fake()->image('trainer.jpg', 400, 400);

        $response = $this->actingAs($admin)->post(route('admin.trainers.store'), [
            'name' => 'Coach Daniel',
            'email' => 'daniel@exfits.com',
            'phone' => '+62 812 9999 8888',
            'bio' => 'Functional movement and mobility specialist.',
            'specialization' => 'Functional Movement',
            'hire_date' => '2025-01-01',
            'status' => 'active',
            'notes' => 'Head coach candidate',
            'profile_photo' => $photo,
        ]);

        $response->assertRedirect();

        $trainer = Trainer::where('email', 'daniel@exfits.com')->first();
        $this->assertNotNull($trainer);
        $this->assertEquals('Coach Daniel', $trainer->name);
        $this->assertEquals((int) $admin->gym_id, (int) $trainer->gym_id);
        $this->assertNotNull($trainer->profile_photo);
        Storage::disk('public')->assertExists($trainer->profile_photo);
    }

    public function test_authorized_user_can_view_trainer_show(): void
    {
        $admin = User::where('email', 'admin.flagship@exfits.com')->first();
        $trainer = Trainer::where('gym_id', $admin->gym_id)->first();

        $response = $this->actingAs($admin)->get(route('admin.trainers.show', $trainer->id));
        $response->assertStatus(200);
    }

    public function test_authorized_user_can_update_trainer(): void
    {
        $admin = User::where('email', 'admin.flagship@exfits.com')->first();
        $trainer = Trainer::where('gym_id', $admin->gym_id)->first();

        $response = $this->actingAs($admin)->put(route('admin.trainers.update', $trainer->id), [
            'name' => 'Budi Pratama Master',
            'email' => $trainer->email,
            'phone' => '+62 812 0000 1111',
            'status' => 'active',
            'specialization' => 'Elite Strength',
        ]);

        $response->assertRedirect();

        $trainer->refresh();
        $this->assertEquals('Budi Pratama Master', $trainer->name);
        $this->assertEquals('Elite Strength', $trainer->specialization);
    }

    public function test_authorized_user_can_toggle_trainer_status(): void
    {
        $admin = User::where('email', 'admin.flagship@exfits.com')->first();
        $trainer = Trainer::where('gym_id', $admin->gym_id)->where('status', 'active')->first();

        $response = $this->actingAs($admin)->post(route('admin.trainers.toggle-status', $trainer->id));
        $response->assertRedirect();

        $trainer->refresh();
        $this->assertEquals('inactive', $trainer->status);

        // Toggle back to active
        $this->actingAs($admin)->post(route('admin.trainers.toggle-status', $trainer->id));
        $trainer->refresh();
        $this->assertEquals('active', $trainer->status);
    }

    public function test_authorized_user_can_delete_trainer(): void
    {
        $admin = User::where('email', 'admin.flagship@exfits.com')->first();
        $trainer = Trainer::where('gym_id', $admin->gym_id)->first();

        $response = $this->actingAs($admin)->delete(route('admin.trainers.destroy', $trainer->id));
        $response->assertRedirect(route('admin.trainers.index'));

        $this->assertSoftDeleted('trainers', ['id' => $trainer->id]);
    }
}
