<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Models\User;
use App\Services\Settings\SettingService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_settings_can_be_retrieved_and_saved(): void
    {
        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $service = app(SettingService::class);

        $service->set('custom_policy', 'Members must bring clean towels', 'general', $flagshipGym->id);

        $value = $service->get('custom_policy', null, $flagshipGym->id, 'general');
        $this->assertEquals('Members must bring clean towels', $value);
    }

    public function test_setting_service_falls_back_to_global_when_tenant_setting_missing(): void
    {
        $flagshipGym = Gym::where('code', 'EXF-JKT-01')->first();
        $service = app(SettingService::class);

        $service->set('global_theme', 'dark_electric', 'system', null);

        $resolved = $service->get('global_theme', 'default_theme', $flagshipGym->id, 'system');
        $this->assertEquals('dark_electric', $resolved);
    }
}