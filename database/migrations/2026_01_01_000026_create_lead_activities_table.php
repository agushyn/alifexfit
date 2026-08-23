<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lead_activities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gym_id');
            $table->unsignedBigInteger('lead_id');
            $table->unsignedBigInteger('user_id')->nullable();

            $table->string('type', 50); // call, whatsapp, visit, email, note
            $table->text('note');
            $table->timestamp('contacted_at');
            $table->timestamp('next_follow_up_at')->nullable();
            $table->json('metadata')->nullable();

            $table->timestamps();

            // Indexes
            $table->index(['gym_id', 'lead_id'], 'idx_leadact_gym_lead');
            $table->index(['gym_id', 'user_id'], 'idx_leadact_gym_user');
            $table->index(['gym_id', 'contacted_at'], 'idx_leadact_gym_contacted');

            // Foreign Keys
            $table->foreign('gym_id', 'fk_leadact_gym')->references('id')->on('gyms')->cascadeOnDelete();
            $table->foreign('lead_id', 'fk_leadact_lead')->references('id')->on('leads')->cascadeOnDelete();
            $table->foreign('user_id', 'fk_leadact_user')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lead_activities');
    }
};
