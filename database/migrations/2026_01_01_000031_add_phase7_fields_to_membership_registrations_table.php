<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('membership_registrations', function (Blueprint $table) {
            // KTP document upload fields
            $table->string('ktp_document_path')->nullable()->after('city');
            $table->string('ktp_original_filename')->nullable()->after('ktp_document_path');
            $table->dateTime('ktp_uploaded_at')->nullable()->after('ktp_original_filename');

            // Payment tracking fields
            $table->enum('payment_status', [
                'unpaid',
                'pending',
                'paid',
                'failed',
                'expired',
                'refunded',
                'cancelled'
            ])->default('unpaid')->after('status')->index();

            $table->dateTime('expires_at')->nullable()->after('rejection_reason')->index();

            // Additional composite index for payment reconciliation
            $table->index(['gym_id', 'payment_status'], 'idx_registrations_gym_pay_status');
        });
    }

    public function down(): void
    {
        Schema::table('membership_registrations', function (Blueprint $table) {
            $table->dropIndex('idx_registrations_gym_pay_status');
            $table->dropColumn([
                'ktp_document_path',
                'ktp_original_filename',
                'ktp_uploaded_at',
                'payment_status',
                'expires_at',
            ]);
        });
    }
};
