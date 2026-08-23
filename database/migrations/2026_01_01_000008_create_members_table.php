<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gym_id')->index();
            $table->string('member_number', 50)->index();
            $table->string('first_name', 100);
            $table->string('last_name', 100)->nullable();
            $table->string('full_name', 200)->index();
            $table->string('email')->nullable()->index();
            $table->string('phone', 50)->nullable()->index();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->text('address')->nullable();
            $table->json('emergency_contact')->nullable();
            $table->string('profile_photo')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended', 'expired'])->default('active')->index();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['gym_id', 'member_number'], 'uq_members_gym_number');
            $table->index(['gym_id', 'status'], 'idx_members_gym_status');
            $table->index(['gym_id', 'created_at'], 'idx_members_gym_created');
            $table->foreign('gym_id', 'fk_members_gym')->references('id')->on('gyms')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};