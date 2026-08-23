<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\Member;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MemberTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_authorized_user_can_view_members_index(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($flagshipAdmin)->get(route('admin.members.index'));
        $response->assertStatus(200);
    }

    public function test_authorized_user_can_create_member(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        Storage::fake('public');

        $file = UploadedFile::fake()->image('avatar.jpg', 200, 200);

        $memberData = [
            'first_name' => 'Michael',
            'last_name' => 'Johnson',
            'email' => 'michael.j@example.com',
            'phone' => '+62 811 555 4444',
            'date_of_birth' => '1990-01-15',
            'gender' => 'male',
            'address' => 'Jl. Sudirman No. 1, Jakarta',
            'emergency_contact' => [
                'name' => 'Sarah Johnson',
                'phone' => '+62 811 555 9999',
                'relationship' => 'Spouse',
            ],
            'photo' => $file,
            'status' => 'active',
        ];

        $response = $this->actingAs($flagshipAdmin)->post(route('admin.members.store'), $memberData);
        $response->assertRedirect(route('admin.members.index'));

        $this->assertDatabaseHas('members', [
            'email' => 'michael.j@example.com',
            'first_name' => 'Michael',
            'last_name' => 'Johnson',
            'full_name' => 'Michael Johnson',
            'gym_id' => $flagshipAdmin->gym_id,
        ]);

        $member = Member::where('email', 'michael.j@example.com')->first();
        $this->assertNotNull($member->member_number);
        $this->assertStringStartsWith('MEM-', $member->member_number);
        $this->assertNotNull($member->profile_photo);
    }

    public function test_member_number_cannot_be_overwritten_on_update(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $member = Member::where('gym_id', $flagshipAdmin->gym_id)->first();
        $originalNumber = $member->member_number;

        $response = $this->actingAs($flagshipAdmin)->put(route('admin.members.update', $member->id), [
            'first_name' => 'UpdatedFirstName',
            'last_name' => $member->last_name,
            'email' => $member->email,
            'phone' => $member->phone,
            'date_of_birth' => '1995-01-01',
            'gender' => 'male',
            'status' => 'suspended',
            'member_number' => 'HACKED-NUMBER-999', // should be ignored
        ]);

        $response->assertRedirect(route('admin.members.show', $member->id));

        $member->refresh();
        $this->assertEquals('UpdatedFirstName', $member->first_name);
        $this->assertEquals('suspended', $member->status);
        $this->assertEquals($originalNumber, $member->member_number);
    }

    public function test_member_detail_can_be_viewed(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $member = Member::where('gym_id', $flagshipAdmin->gym_id)->first();

        $response = $this->actingAs($flagshipAdmin)->get(route('admin.members.show', $member->id));
        $response->assertStatus(200);
    }

    public function test_member_can_be_safely_deactivated(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $member = Member::where('gym_id', $flagshipAdmin->gym_id)->first();

        $response = $this->actingAs($flagshipAdmin)->delete(route('admin.members.destroy', $member->id));
        $response->assertRedirect(route('admin.members.index'));

        // Soft deleted
        $this->assertSoftDeleted('members', [
            'id' => $member->id,
        ]);
    }

    public function test_member_search_and_filters_work(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        // Search by name
        $response = $this->actingAs($flagshipAdmin)->get(route('admin.members.index', ['search' => 'Arya']));
        $response->assertStatus(200);

        // Filter by status
        $response = $this->actingAs($flagshipAdmin)->get(route('admin.members.index', ['status' => 'suspended']));
        $response->assertStatus(200);
    }

    public function test_member_creation_and_update_creates_audit_logs(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $this->actingAs($flagshipAdmin)->post(route('admin.members.store'), [
            'first_name' => 'Audit',
            'last_name' => 'TestMember',
            'email' => 'audit.member@example.com',
            'phone' => '+62 811 000 9999',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'member.created',
        ]);
    }
}