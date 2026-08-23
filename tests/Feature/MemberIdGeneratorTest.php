<?php

namespace Tests\Feature;

use App\Models\Gym;
use App\Services\MemberIdGenerator;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberIdGeneratorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
        MemberIdGenerator::resetConfig();
    }

    protected function tearDown(): void
    {
        MemberIdGenerator::resetConfig();
        parent::tearDown();
    }

    public function test_generates_member_number_with_default_format(): void
    {
        $gym = Gym::factory()->create();
        /** @var MemberIdGenerator $generator */
        $generator = app(MemberIdGenerator::class);

        $firstId = $generator->generate($gym->id);
        $secondId = $generator->generate($gym->id);
        $thirdId = $generator->generate($gym->id);

        $this->assertEquals('MEM-000001', $firstId);
        $this->assertEquals('MEM-000002', $secondId);
        $this->assertEquals('MEM-000003', $thirdId);
    }

    public function test_centralized_configuration_can_change_format(): void
    {
        $gym = Gym::factory()->create();
        /** @var MemberIdGenerator $generator */
        $generator = app(MemberIdGenerator::class);

        // Prove changing prefix to EXF works centrally
        MemberIdGenerator::setCustomConfig(prefix: 'EXF', padding: 6, separator: '-');
        $exfId = $generator->generate($gym->id);
        $this->assertEquals('EXF-000001', $exfId);

        // Prove changing padding to 4 works centrally
        MemberIdGenerator::setCustomConfig(prefix: 'MEM', padding: 4, separator: '-');
        $shortId = $generator->generate($gym->id);
        $this->assertEquals('MEM-0002', $shortId);

        // Prove custom separator and prefix works
        MemberIdGenerator::setCustomConfig(prefix: 'EXFITS', padding: 5, separator: '_');
        $customId = $generator->generate($gym->id);
        $this->assertEquals('EXFITS_00003', $customId);
    }

    public function test_member_number_sequence_is_scoped_per_gym(): void
    {
        $gymA = Gym::factory()->create();
        $gymB = Gym::factory()->create();

        /** @var MemberIdGenerator $generator */
        $generator = app(MemberIdGenerator::class);

        // Gym A sequence
        $gymA_1 = $generator->generate($gymA->id);
        $gymA_2 = $generator->generate($gymA->id);

        // Gym B sequence starts at 1 independently
        $gymB_1 = $generator->generate($gymB->id);
        $gymB_2 = $generator->generate($gymB->id);

        $this->assertEquals('MEM-000001', $gymA_1);
        $this->assertEquals('MEM-000002', $gymA_2);

        $this->assertEquals('MEM-000001', $gymB_1);
        $this->assertEquals('MEM-000002', $gymB_2);
    }
}