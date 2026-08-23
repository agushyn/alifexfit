<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memberships', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gym_id')->index();
            $table->unsignedBigInteger('member_id')->index();
            $table->unsignedBigInteger('membership_plan_id')->index();
            $table->date('start_date')->index();
            $table->date('end_date')->index();
            $table->enum('status', ['pending', 'active', 'expired', 'suspended', 'cancelled'])->default('active')->index();
            $table->decimal('price', 12, 2);
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded', 'expired'])->default('paid')->index();
            $table->unsignedInteger('trainer_quota_total')->default(0);
            $table->unsignedInteger('trainer_quota_used')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['gym_id', 'member_id'], 'idx_memberships_gym_member');
            $table->index(['gym_id', 'status'], 'idx_memberships_gym_status');
            $table->index(['gym_id', 'start_date'], 'idx_memberships_gym_start');
            $table->index(['gym_id', 'end_date'], 'idx_memberships_gym_end');

            $table->foreign('gym_id', 'fk_memberships_gym')->references('id')->on('gyms')->cascadeOnDelete();
            $table->foreign('member_id', 'fk_memberships_member')->references('id')->on('members')->cascadeOnDelete();
            $table->foreign('membership_plan_id', 'fk_memberships_plan')->references('id')->on('membership_plans')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('memberships');
    }
};