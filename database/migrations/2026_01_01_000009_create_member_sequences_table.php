<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_sequences', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gym_id')->unique();
            $table->unsignedBigInteger('last_sequence')->default(0);
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('gym_id', 'fk_memseq_gym')->references('id')->on('gyms')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_sequences');
    }
};