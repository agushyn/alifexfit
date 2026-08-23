<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

/**
 * ============================================================================
 * EXFITS MEMBERSHIP REGISTRATION NUMBER GENERATOR
 * ============================================================================
 *
 * Generates concurrency-safe, tenant-scoped registration numbers (e.g. 'REG-000001').
 * Uses pessimistic row-level locking (SELECT FOR UPDATE) on the `registration_sequences` table.
 * ============================================================================
 */
class MembershipRegistrationNumberGenerator
{
    public const DEFAULT_PREFIX = 'REG';
    public const DEFAULT_SEPARATOR = '-';
    public const DEFAULT_PADDING = 6;

    protected static ?string $customPrefix = null;
    protected static ?string $customSeparator = null;
    protected static ?int $customPadding = null;

    /**
     * Generate the next concurrency-safe registration number for a given gym.
     */
    public function generate(int $gymId): string
    {
        $sequence = $this->getNextSequenceAtomic($gymId);

        return $this->format($sequence);
    }

    /**
     * Atomically increment and retrieve the next sequence number for a gym.
     */
    public function getNextSequenceAtomic(int $gymId): int
    {
        return DB::transaction(function () use ($gymId) {
            $seqRow = DB::table('registration_sequences')
                ->where('gym_id', $gymId)
                ->lockForUpdate()
                ->first();

            if (! $seqRow) {
                $maxSeq = 0;
                $latestReg = DB::table('membership_registrations')
                    ->where('gym_id', $gymId)
                    ->orderByDesc('id')
                    ->first();

                if ($latestReg && preg_match('/(\d+)$/', $latestReg->registration_number, $matches)) {
                    $maxSeq = (int) $matches[1];
                }

                $nextSeq = $maxSeq + 1;

                DB::table('registration_sequences')->insert([
                    'gym_id' => $gymId,
                    'last_sequence' => $nextSeq,
                    'updated_at' => now(),
                ]);

                return $nextSeq;
            }

            $nextSequence = (int) $seqRow->last_sequence + 1;

            DB::table('registration_sequences')
                ->where('gym_id', $gymId)
                ->update([
                    'last_sequence' => $nextSequence,
                    'updated_at' => now(),
                ]);

            return $nextSequence;
        });
    }

    /**
     * Format a sequence integer into a standard Registration Number string.
     */
    public function format(
        int $sequence,
        ?string $prefix = null,
        ?int $padding = null,
        ?string $separator = null
    ): string {
        $effectivePrefix = $prefix ?? self::$customPrefix ?? self::DEFAULT_PREFIX;
        $effectiveSeparator = $separator ?? self::$customSeparator ?? self::DEFAULT_SEPARATOR;
        $effectivePadding = $padding ?? self::$customPadding ?? self::DEFAULT_PADDING;

        $paddedNumber = str_pad((string) $sequence, $effectivePadding, '0', STR_PAD_LEFT);

        return "{$effectivePrefix}{$effectiveSeparator}{$paddedNumber}";
    }

    /**
     * Override configuration settings dynamically.
     */
    public static function setCustomConfig(?string $prefix = null, ?int $padding = null, ?string $separator = null): void
    {
        self::$customPrefix = $prefix;
        self::$customPadding = $padding;
        self::$customSeparator = $separator;
    }

    /**
     * Reset custom configuration overrides back to system defaults.
     */
    public static function resetConfig(): void
    {
        self::$customPrefix = null;
        self::$customSeparator = null;
        self::$customPadding = null;
    }
}
