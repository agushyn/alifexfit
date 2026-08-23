<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

/**
 * ============================================================================
 * EXFITS MEMBER ID GENERATOR — SINGLE SOURCE OF TRUTH
 * ============================================================================
 *
 * This class is the sole authority for generating unique member numbers
 * across all gyms in the Exfits Gym Management System.
 *
 * ----------------------------------------------------------------------------
 * 1. FORMAT CONFIGURATION (Modify here to change default format)
 * ----------------------------------------------------------------------------
 * - PREFIX    : The initial text code prefix (e.g. 'MEM', 'EXF', 'VIP')
 * - SEPARATOR : The delimiter character between prefix and sequence (e.g. '-')
 * - PADDING   : The zero-padding length for the incremental sequence (e.g. 6 -> 000001)
 *
 * Example Formats:
 * - Default  : PREFIX = 'MEM', SEPARATOR = '-', PADDING = 6 => 'MEM-000001'
 * - Branch   : PREFIX = 'EXF', SEPARATOR = '-', PADDING = 6 => 'EXF-000001'
 * - Short    : PREFIX = 'MEM', SEPARATOR = '-', PADDING = 4 => 'MEM-0001'
 *
 * ----------------------------------------------------------------------------
 * 2. TENANT SCOPE & CONCURRENCY
 * ----------------------------------------------------------------------------
 * - Member numbering is strictly scoped per gym (gym_id).
 * - Gym A and Gym B have independent sequential counters starting from 1.
 * - Concurrency is guaranteed safe using database transactions with
 *   pessimistic row-level locking (SELECT FOR UPDATE) on the `member_sequences` table.
 * ============================================================================
 */
class MemberIdGenerator
{
    /**
     * Default Member ID prefix.
     */
    public const DEFAULT_PREFIX = 'MEM';

    /**
     * Default delimiter between prefix and sequence.
     */
    public const DEFAULT_SEPARATOR = '-';

    /**
     * Default zero-padding digits for sequence.
     */
    public const DEFAULT_PADDING = 6;

    /**
     * Dynamic overrides (useful for runtime customization and automated tests).
     */
    protected static ?string $customPrefix = null;
    protected static ?string $customSeparator = null;
    protected static ?int $customPadding = null;

    /**
     * Generate the next concurrency-safe member number for a given gym.
     *
     * @param int $gymId The tenant gym ID to generate sequence for.
     * @return string Formatted member number (e.g. 'MEM-000001')
     */
    public function generate(int $gymId): string
    {
        $sequence = $this->getNextSequenceAtomic($gymId);

        return $this->format($sequence);
    }

    /**
     * Atomically increment and retrieve the next sequence number for a gym.
     * Uses pessimistic locking (FOR UPDATE) inside a transaction to prevent race conditions.
     *
     * @param int $gymId
     * @return int
     */
    public function getNextSequenceAtomic(int $gymId): int
    {
        return DB::transaction(function () use ($gymId) {
            // Lock or create the sequence row for this gym
            $seqRow = DB::table('member_sequences')
                ->where('gym_id', $gymId)
                ->lockForUpdate()
                ->first();

            if (!$seqRow) {
                // Initialize sequence row starting at 1
                DB::table('member_sequences')->insert([
                    'gym_id' => $gymId,
                    'last_sequence' => 1,
                    'updated_at' => now(),
                ]);

                return 1;
            }

            $nextSequence = (int) $seqRow->last_sequence + 1;

            DB::table('member_sequences')
                ->where('gym_id', $gymId)
                ->update([
                    'last_sequence' => $nextSequence,
                    'updated_at' => now(),
                ]);

            return $nextSequence;
        });
    }

    /**
     * Format a sequence integer into a standard Member ID string.
     *
     * @param int $sequence The integer sequence number (e.g. 1, 25, 1000)
     * @param string|null $prefix Optional prefix override
     * @param int|null $padding Optional zero padding override
     * @param string|null $separator Optional separator override
     * @return string Formatted Member ID (e.g. 'MEM-000001')
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
     * Override configuration settings dynamically (e.g. for testing format changes).
     */
    public static function setCustomConfig(?string $prefix = null, ?int $padding = null, ?string $separator = null): void
    {
        self::$customPrefix = $prefix;
        self::$customPadding = $padding;
        self::$customSeparator = $separator;
    }

    /**
     * Reset configuration to default constants.
     */
    public static function resetConfig(): void
    {
        self::$customPrefix = null;
        self::$customPadding = null;
        self::$customSeparator = null;
    }
}