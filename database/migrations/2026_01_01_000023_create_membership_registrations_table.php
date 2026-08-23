<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_registrations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gym_id')->index();
            $table->unsignedBigInteger('membership_plan_id')->index();
            $table->string('registration_number', 50)->index();
            $table->enum('source', ['website', 'admin'])->default('website');
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending')->index();

            // Applicant personal information
            $table->string('full_name', 200);
            $table->string('email')->index();
            $table->string('phone', 50)->index();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->date('date_of_birth')->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();

            // Emergency contact
            $table->string('emergency_contact_name', 150)->nullable();
            $table->string('emergency_contact_phone', 50)->nullable();
            $table->string('emergency_contact_relationship', 50)->nullable();

            // Review and metadata
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();
            $table->unsignedBigInteger('reviewed_by')->nullable()->index();
            $table->dateTime('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();

            // Linked entities upon approval
            $table->unsignedBigInteger('member_id')->nullable()->index();
            $table->unsignedBigInteger('membership_id')->nullable()->index();

            $table->timestamps();
            $table->softDeletes();

            // Tenant unique registration number constraint
            $table->unique(['gym_id', 'registration_number'], 'uq_registrations_gym_number');

            // Composite performance indexes
            $table->index(['gym_id', 'status'], 'idx_registrations_gym_status');
            $table->index(['gym_id', 'created_at'], 'idx_registrations_gym_created');
            $table->index(['gym_id', 'email'], 'idx_registrations_gym_email');
            $table->index(['gym_id', 'phone'], 'idx_registrations_gym_phone');

            // Foreign keys
            $table->foreign('gym_id', 'fk_registrations_gym')->references('id')->on('gyms')->cascadeOnDelete();
            $table->foreign('membership_plan_id', 'fk_registrations_plan')->references('id')->on('membership_plans')->cascadeOnDelete();
            $table->foreign('reviewed_by', 'fk_registrations_reviewer')->references('id')->on('users')->nullOnDelete();
            $table->foreign('member_id', 'fk_registrations_member')->references('id')->on('members')->nullOnDelete();
            $table->foreign('membership_id', 'fk_registrations_membership')->references('id')->on('memberships')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_registrations');
    }
};
