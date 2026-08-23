<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\Member;
use App\Models\User;
use App\Services\Members\MemberService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_gym_a_user_cannot_view_gym_b_member(): void
    {
        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();

        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        // Find a member belonging to Surabaya Gym
        $surabayaMember = Member::withoutGymScope()
            ->where('gym_id', $surabayaGym->id)
            ->first();

        // Flagship admin tries to access Surabaya member detail
        $response = $this->actingAs($flagshipAdmin)->get(route('admin.members.show', $surabayaMember->id));
        $response->assertStatus(403);
    }

    public function test_gym_a_user_cannot_update_gym_b_member(): void
    {
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $surabayaMember = Member::withoutGymScope()
            ->where('gym_id', $surabayaGym->id)
            ->first();

        // Flagship admin tries to update Surabaya member
        $response = $this->actingAs($flagshipAdmin)->put(route('admin.members.update', $surabayaMember->id), [
            'first_name' => 'HackedName',
            'status' => 'inactive',
        ]);

        $response->assertStatus(403);
    }

    public function test_both_gyms_can_have_same_member_number_independently(): void
    {
        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();

        $flagshipMember1 = Member::withoutGymScope()
            ->where('gym_id', $flagshipGym->id)
            ->where('member_number', 'MEM-000001')
            ->first();

        $surabayaMember1 = Member::withoutGymScope()
            ->where('gym_id', $surabayaGym->id)
            ->where('member_number', 'MEM-000001')
            ->first();

        $this->assertNotNull($flagshipMember1);
        $this->assertNotNull($surabayaMember1);
        $this->assertNotEquals($flagshipMember1->id, $surabayaMember1->id);
        $this->assertEquals('MEM-000001', $flagshipMember1->member_number);
        $this->assertEquals('MEM-000001', $surabayaMember1->member_number);
    }

    public function test_super_admin_can_access_members_across_gyms(): void
    {
        $superAdmin = User::where('email', 'superadmin@exfits.com')->first();
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();

        $surabayaMember = Member::withoutGymScope()
            ->where('gym_id', $surabayaGym->id)
            ->first();

        $response = $this->actingAs($superAdmin)->get(route('admin.members.show', $surabayaMember->id));
        $response->assertStatus(200);
    }
}