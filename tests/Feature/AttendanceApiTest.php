<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\Member;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_api_check_in_and_check_out(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $dian = Member::where('email', 'dian.kusuma@example.com')->first();

        // API Check-In
        $responseIn = $this->actingAs($flagshipAdmin)->postJson(route('api.attendance.checkin'), [
            'member_number' => $dian->member_number,
            'source' => 'app',
            'device_identifier' => 'mobile_app_ios_01',
        ]);

        $responseIn->assertStatus(201);
        $responseIn->assertJsonPath('success', true);

        $attendanceId = $responseIn->json('data.attendance.id');

        // API Check-Out
        $responseOut = $this->actingAs($flagshipAdmin)->postJson(route('api.attendance.checkout'), [
            'attendance_id' => $attendanceId,
            'notes' => 'API app checkout',
        ]);

        $responseOut->assertStatus(200);
        $responseOut->assertJsonPath('success', true);
        $responseOut->assertJsonPath('data.status', 'checked_out');
    }

    public function test_api_active_attendances(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($flagshipAdmin)->getJson(route('api.attendance.active'));
        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $this->assertGreaterThanOrEqual(1, $response->json('count'));
    }
}