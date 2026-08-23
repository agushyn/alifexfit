<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workout_types', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gym_id')->index();
            $table->string('name', 100);
            $table->string('slug', 120)->index();
            $table->text('description')->nullable();
            $table->string('category', 50)->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active')->index();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['gym_id', 'slug'], 'uq_workout_types_gym_slug');
            $table->index(['gym_id', 'status'], 'idx_workout_types_gym_status');
            $table->foreign('gym_id', 'fk_workout_types_gym')->references('id')->on('gyms')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workout_types');
    }
};