<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gym_settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gym_id')->nullable()->index();
            $table->string('group', 50)->default('general')->index();
            $table->string('key', 100)->index();
            $table->text('value')->nullable();
            $table->timestamps();

            $table->index(['gym_id', 'group', 'key'], 'idx_gym_group_key');
            $table->foreign('gym_id', 'fk_gs_gym')->references('id')->on('gyms')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gym_settings');
    }
};
