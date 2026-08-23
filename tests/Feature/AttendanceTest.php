<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Gym;
use App\Models\Member;
use App\Models\Membership;
use App\Models\MembershipPlan;
use App\Models\User;
use App\Services\Attendance\AttendanceService;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class AttendanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_authorized_user_can_view_attendance_index(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($flagshipAdmin)->get(route('admin.attendance.index'));
        $response->assertStatus(200);
    }

    public function test_successful_check_in_creates_in_gym_attendance(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $dian = Member::where('email', 'dian.kusuma@example.com')->first();

        // Dian currently has no active attendance
        $response = $this->actingAs($flagshipAdmin)->post(route('admin.attendance.checkin'), [
            'member_number' => $dian->member_number,
            'source' => 'kiosk',
        ]);

        $response->assertSessionHasNoErrors();

        $attendance = Attendance::where('member_id', $dian->id)->where('status', 'in_gym')->first();
        $this->assertNotNull($attendance);
        $this->assertEquals('in_gym', $attendance->status);
        $this->assertNull($attendance->check_out_at);
        $this->assertEquals($flagshipAdmin->gym_id, $attendance->gym_id);
    }

    public function test_unknown_member_check_in_is_rejected(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($flagshipAdmin)->post(route('admin.attendance.checkin'), [
            'member_number' => 'NON-EXISTENT-999',
            'source' => 'kiosk',
        ]);

        $response->assertSessionHasErrors(['member_number']);
    }

    public function test_suspended_member_is_rejected(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $reza = Member::where('email', 'reza.rahadian@example.com')->first(); // Suspended

        $response = $this->actingAs($flagshipAdmin)->post(route('admin.attendance.checkin'), [
            'member_number' => $reza->member_number,
            'source' => 'kiosk',
        ]);

        $response->assertSessionHasErrors(['member_number']);
    }

    public function test_member_without_active_membership_is_rejected(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        // Create member without any membership
        $newMember = Member::factory()->create([
            'gym_id' => $flagshipAdmin->gym_id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($flagshipAdmin)->post(route('admin.attendance.checkin'), [
            'member_number' => $newMember->member_number,
            'source' => 'kiosk',
        ]);

        $response->assertSessionHasErrors(['member_number']);
    }

    public function test_duplicate_active_check_in_is_prevented(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $arya = Member::where('email', 'arya.pratama@example.com')->first(); // Already seeded as in_gym

        $this->assertNotNull($arya->activeAttendance);

        // Attempting second simultaneous check-in must fail
        $response = $this->actingAs($flagshipAdmin)->post(route('admin.attendance.checkin'), [
            'member_number' => $arya->member_number,
            'source' => 'kiosk',
        ]);

        $response->assertSessionHasErrors(['member_number']);
    }

    public function test_member_can_visit_multiple_times_per_day_after_checkout(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $dian = Member::where('email', 'dian.kusuma@example.com')->first();

        /** @var AttendanceService $service */
        $service = app(AttendanceService::class);

        // Visit 1: Morning Check-in & Check-out
        $visit1 = $service->checkIn($dian->member_number, 'kiosk', null, $flagshipAdmin->gym_id);
        $this->assertEquals('in_gym', $visit1->status);

        $checkout1 = $service->checkOut($visit1);
        $this->assertEquals('checked_out', $checkout1->status);
        $this->assertNotNull($checkout1->check_out_at);

        // Visit 2: Evening Check-in & Check-out (same day)
        $visit2 = $service->checkIn($dian->member_number, 'kiosk', null, $flagshipAdmin->gym_id);
        $this->assertEquals('in_gym', $visit2->status);

        $checkout2 = $service->checkOut($visit2);
        $this->assertEquals('checked_out', $checkout2->status);
        $this->assertNotNull($checkout2->check_out_at);
    }

    public function test_successful_check_out_sets_timestamp_and_status(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $arya = Member::where('email', 'arya.pratama@example.com')->first();
        $activeAttendance = $arya->activeAttendance;

        $response = $this->actingAs($flagshipAdmin)->post(route('admin.attendance.checkout', $activeAttendance->id), [
            'notes' => 'Completed morning training session',
        ]);

        $response->assertSessionHasNoErrors();

        $activeAttendance->refresh();
        $this->assertEquals('checked_out', $activeAttendance->status);
        $this->assertNotNull($activeAttendance->check_out_at);
        $this->assertStringContainsString('Completed morning training session', $activeAttendance->notes);
    }

    public function test_cannot_checkout_already_checked_out_attendance(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $completedAttendance = Attendance::where('gym_id', $flagshipAdmin->gym_id)
            ->where('status', 'checked_out')
            ->first();

        $response = $this->actingAs($flagshipAdmin)->post(route('admin.attendance.checkout', $completedAttendance->id));
        $response->assertSessionHasErrors();
    }

    public function test_authorized_user_can_cancel_attendance(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $arya = Member::where('email', 'arya.pratama@example.com')->first();
        $activeAttendance = $arya->activeAttendance;

        $response = $this->actingAs($flagshipAdmin)->post(route('admin.attendance.cancel', $activeAttendance->id), [
            'reason' => 'Staff mistyped member number',
        ]);

        $response->assertRedirect(route('admin.attendance.index'));

        $activeAttendance->refresh();
        $this->assertEquals('cancelled', $activeAttendance->status);
        $this->assertStringContainsString('Staff mistyped member number', $activeAttendance->notes);
    }
}