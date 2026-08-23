<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gym_id')->index();
            $table->unsignedBigInteger('membership_registration_id')->index();

            $table->string('order_id', 100)->unique();
            $table->string('provider', 50)->default('midtrans')->index();
            $table->string('provider_transaction_id', 150)->nullable()->index();
            $table->string('provider_reference', 150)->nullable();

            $table->string('payment_method', 50)->index(); // e.g. qris, bank_transfer, echannel
            $table->string('payment_channel', 50)->index(); // e.g. qris, bca, bni, bri, mandiri, permata, cimb

            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('IDR');

            $table->enum('status', [
                'unpaid',
                'pending',
                'paid',
                'failed',
                'expired',
                'refunded',
                'cancelled'
            ])->default('pending')->index();

            // Channel specific payment payload
            $table->text('payment_url')->nullable();
            $table->text('qr_string')->nullable();
            $table->string('va_number', 100)->nullable();
            $table->string('bill_key', 100)->nullable();
            $table->string('biller_code', 50)->nullable();

            $table->dateTime('expires_at')->nullable()->index();
            $table->dateTime('paid_at')->nullable()->index();
            $table->json('raw_response')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Composite performance indexes
            $table->index(['gym_id', 'status'], 'idx_payments_gym_status');
            $table->index(['gym_id', 'created_at'], 'idx_payments_gym_created');
            $table->index(['membership_registration_id', 'status'], 'idx_payments_reg_status');

            // Foreign keys
            $table->foreign('gym_id', 'fk_payments_gym')->references('id')->on('gyms')->cascadeOnDelete();
            $table->foreign('membership_registration_id', 'fk_payments_registration')->references('id')->on('membership_registrations')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
