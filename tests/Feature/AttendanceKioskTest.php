<?php

namespace Tests\Feature;

use App\Models\Member;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AttendanceKioskTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_authorized_user_can_open_kiosk_view(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();

        $response = $this->actingAs($flagshipAdmin)->get(route('admin.attendance.kiosk'));
        $response->assertStatus(200);
    }

    public function test_kiosk_check_in_returns_json_payload_on_ajax_request(): void
    {
        $flagshipAdmin = User::where('email', 'admin.flagship@exfits.com')->first();
        $dian = Member::where('email', 'dian.kusuma@example.com')->first();

        $response = $this->actingAs($flagshipAdmin)
            ->withHeaders(['Accept' => 'application/json'])
            ->post(route('admin.attendance.checkin'), [
                'member_number' => $dian->member_number,
                'source' => 'kiosk',
                'device_identifier' => 'kiosk_main_turnstile',
            ]);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
        $response->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'attendance' => ['id', 'status', 'check_in_at'],
                'member' => ['id', 'full_name', 'member_number'],
                'membership' => ['id', 'start_date', 'end_date'],
                'remaining_trainer_quota',
            ],
        ]);
    }
}