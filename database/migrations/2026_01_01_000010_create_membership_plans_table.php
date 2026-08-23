<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_plans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gym_id')->index();
            $table->string('name', 100);
            $table->string('slug', 120)->index();
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2);
            $table->enum('billing_period', ['monthly', 'quarterly', 'yearly', 'custom'])->default('monthly');
            $table->unsignedInteger('duration')->default(1);
            $table->decimal('joining_fee', 12, 2)->default(0);
            $table->unsignedInteger('trainer_quota')->default(0);
            $table->json('benefits')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active')->index();
            $table->boolean('featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['gym_id', 'slug'], 'uq_plans_gym_slug');
            $table->index(['gym_id', 'status'], 'idx_plans_gym_status');
            $table->foreign('gym_id', 'fk_plans_gym')->references('id')->on('gyms')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_plans');
    }
};