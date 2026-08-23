<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gym_id');

            // Lead identity
            $table->string('lead_number', 50);
            $table->string('name', 200);
            $table->string('email', 255)->nullable();
            $table->string('phone', 50);
            $table->string('whatsapp', 50)->nullable();

            // Interest
            $table->unsignedBigInteger('membership_plan_id')->nullable();
            $table->string('interest_type', 50)->nullable();
            $table->text('message')->nullable();

            // Source
            $table->string('source', 50)->default('website');
            $table->string('source_detail', 255)->nullable();

            // Pipeline
            $table->string('status', 50)->default('new');

            // Assignment
            $table->unsignedBigInteger('assigned_to')->nullable();

            // Follow-up
            $table->timestamp('last_contacted_at')->nullable();
            $table->timestamp('next_follow_up_at')->nullable();

            // Conversion
            $table->timestamp('converted_at')->nullable();
            $table->unsignedBigInteger('membership_registration_id')->nullable();

            // Additional
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Unique constraint
            $table->unique(['gym_id', 'lead_number'], 'uq_leads_gym_leadnum');

            // Composite indexes for performance & multi-tenant querying
            $table->index(['gym_id', 'status'], 'idx_leads_gym_status');
            $table->index(['gym_id', 'source'], 'idx_leads_gym_source');
            $table->index(['gym_id', 'assigned_to'], 'idx_leads_gym_assigned');
            $table->index(['gym_id', 'created_at'], 'idx_leads_gym_created');
            $table->index(['gym_id', 'next_follow_up_at'], 'idx_leads_gym_next_followup');
            $table->index(['gym_id', 'phone'], 'idx_leads_gym_phone');
            $table->index(['gym_id', 'email'], 'idx_leads_gym_email');

            // Foreign Keys
            $table->foreign('gym_id', 'fk_leads_gym')->references('id')->on('gyms')->cascadeOnDelete();
            $table->foreign('membership_plan_id', 'fk_leads_plan')->references('id')->on('membership_plans')->nullOnDelete();
            $table->foreign('assigned_to', 'fk_leads_assigned_user')->references('id')->on('users')->nullOnDelete();
            $table->foreign('membership_registration_id', 'fk_leads_reg')->references('id')->on('membership_registrations')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
