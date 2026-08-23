<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Gym;
use App\Models\Member;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class AttendanceTenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_user_from_gym_a_cannot_check_in_member_from_gym_b(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $surabayaMember = Member::withoutGymScope()->where('email', 'budi.santoso@example.com')->first();

        $response = $this->actingAs($flagshipAdmin)->post(route('admin.attendance.checkin'), [
            'member_number' => $surabayaMember->member_number,
            'source' => 'kiosk',
        ]);

        $response->assertSessionHasErrors(['member_number']);
    }

    public function test_user_from_gym_a_cannot_view_or_checkout_gym_b_attendance(): void
    {
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $surabayaAttendance = Attendance::withoutGymScope()
            ->where('gym_id', $surabayaGym->id)
            ->first();

        // Policy Gate denial
        $this->assertFalse(Gate::forUser($flagshipAdmin)->allows('view', $surabayaAttendance));
        $this->assertFalse(Gate::forUser($flagshipAdmin)->allows('update', $surabayaAttendance));
        $this->assertFalse(Gate::forUser($flagshipAdmin)->allows('delete', $surabayaAttendance));

        // HTTP access rejection
        $responseView = $this->actingAs($flagshipAdmin)->get(route('admin.attendance.show', $surabayaAttendance->id));
        $this->assertTrue(in_array($responseView->status(), [403, 404]));

        $responseCheckout = $this->actingAs($flagshipAdmin)->post(route('admin.attendance.checkout', $surabayaAttendance->id));
        $this->assertTrue(in_array($responseCheckout->status(), [403, 404]));
    }

    public function test_spoofed_gym_id_in_payload_is_strictly_ignored(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $surabayaGym = Gym::where('code', 'EXF-SBY-02')->first();
        $dian = Member::where('email', 'dian.kusuma@example.com')->first();

        $response = $this->actingAs($flagshipAdmin)->post(route('admin.attendance.checkin'), [
            'member_number' => $dian->member_number,
            'source' => 'kiosk',
            'gym_id' => $surabayaGym->id, // Malicious spoofing attempt
        ]);

        $attendance = Attendance::where('member_id', $dian->id)->latest('id')->first();
        $this->assertNotNull($attendance);
        // Must belong to Flagship Gym, not Surabaya
        $this->assertEquals($flagshipAdmin->gym_id, $attendance->gym_id);
    }
}