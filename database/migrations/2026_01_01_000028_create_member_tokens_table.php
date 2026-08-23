<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_tokens', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gym_id')->index();
            $table->unsignedBigInteger('member_id')->index();
            $table->string('name')->default('mobile_app');
            $table->string('token', 64)->unique();
            $table->json('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable()->index();
            $table->timestamps();

            $table->index(['gym_id', 'member_id'], 'idx_member_tokens_gym_member');
            $table->foreign('gym_id', 'fk_member_tokens_gym')->references('id')->on('gyms')->cascadeOnDelete();
            $table->foreign('member_id', 'fk_member_tokens_member')->references('id')->on('members')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_tokens');
    }
};
