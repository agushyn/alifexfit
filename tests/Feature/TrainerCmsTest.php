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

class TrainerCmsTest extends TestCase
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

    public function test_admin_can_view_trainers_index(): void
    {
        $response = $this->actingAs($this->adminJkt)
            ->get(route('admin.trainers.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Trainers/Index')
            ->has('trainers.data')
            ->has('stats')
        );
    }

    public function test_admin_can_create_trainer_with_photocard_fields(): void
    {
        $photo = UploadedFile::fake()->image('trainer-headshot.jpg', 800, 1000);

        $response = $this->actingAs($this->adminJkt)
            ->post(route('admin.trainers.store'), [
                'name' => 'Aditya Santoso',
                'role' => 'Senior Strength Coach',
                'email' => 'aditya.pt@exfits.com',
                'phone' => '+62 812 9999 1234',
                'bio' => 'Experienced athletic trainer with powerlifting certification.',
                'specialization' => 'Powerlifting & Hypertrophy',
                'certification' => 'CSCS, USAPL Coach',
                'sort_order' => 10,
                'hire_date' => '2026-01-10',
                'status' => 'active',
                'profile_photo' => $photo,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('trainers', [
            'gym_id' => $this->flagshipGym->id,
            'name' => 'Aditya Santoso',
            'role' => 'Senior Strength Coach',
            'specialization' => 'Powerlifting & Hypertrophy',
            'certification' => 'CSCS, USAPL Coach',
            'sort_order' => 10,
            'status' => 'active',
        ]);

        $trainer = Trainer::where('name', 'Aditya Santoso')->first();
        $this->assertNotNull($trainer->profile_photo);
        Storage::disk('public')->assertExists($trainer->profile_photo);
    }

    public function test_admin_can_update_trainer(): void
    {
        $trainer = Trainer::where('gym_id', $this->flagshipGym->id)->firstOrFail();

        $response = $this->actingAs($this->adminJkt)
            ->put(route('admin.trainers.update', $trainer->id), [
                'name' => 'Budi Pratama CSCS',
                'role' => 'Executive Head Coach',
                'specialization' => 'Elite Strength & Conditioning',
                'certification' => 'CSCS, FMS, Precision Nutrition',
                'sort_order' => 0,
                'status' => 'active',
            ]);

        $response->assertRedirect(route('admin.trainers.show', $trainer->id));

        $this->assertDatabaseHas('trainers', [
            'id' => $trainer->id,
            'name' => 'Budi Pratama CSCS',
            'role' => 'Executive Head Coach',
            'specialization' => 'Elite Strength & Conditioning',
            'certification' => 'CSCS, FMS, Precision Nutrition',
        ]);
    }

    public function test_admin_can_toggle_trainer_status(): void
    {
        $trainer = Trainer::where('gym_id', $this->flagshipGym->id)->firstOrFail();
        $initialStatus = $trainer->status;

        $response = $this->actingAs($this->adminJkt)
            ->post(route('admin.trainers.toggle-status', $trainer->id));

        $response->assertRedirect();
        $expectedStatus = $initialStatus === 'active' ? 'inactive' : 'active';
        $this->assertEquals($expectedStatus, $trainer->fresh()->status);
    }

    public function test_admin_can_reorder_trainers(): void
    {
        $trainers = Trainer::where('gym_id', $this->flagshipGym->id)->get();
        if ($trainers->count() >= 2) {
            $first = $trainers[0];
            $second = $trainers[1];

            $response = $this->actingAs($this->adminJkt)
                ->post(route('admin.trainers.reorder'), [
                    'ordered_ids' => [$second->id, $first->id],
                ]);

            $response->assertRedirect();

            $this->assertEquals(0, $second->fresh()->sort_order);
            $this->assertEquals(1, $first->fresh()->sort_order);
        }
    }

    public function test_tenant_isolation_prevents_unauthorized_trainer_modification(): void
    {
        $trainerSby = Trainer::where('gym_id', $this->surabayaGym->id)->firstOrFail();

        // Admin Jakarta tries to edit Surabaya trainer
        $response = $this->actingAs($this->adminJkt)
            ->get(route('admin.trainers.edit', $trainerSby->id));

        $this->assertTrue(in_array($response->getStatusCode(), [403, 404]));

        // Admin Jakarta tries to delete Surabaya trainer
        $deleteResponse = $this->actingAs($this->adminJkt)
            ->delete(route('admin.trainers.destroy', $trainerSby->id));

        $this->assertTrue(in_array($deleteResponse->getStatusCode(), [403, 404]));
        $this->assertDatabaseHas('trainers', ['id' => $trainerSby->id]);
    }
}
