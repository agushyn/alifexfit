<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->string('role', 100)->nullable()->after('name');
            $table->string('certification', 255)->nullable()->after('specialization');
            $table->integer('sort_order')->default(0)->after('profile_photo');

            $table->index(['gym_id', 'status', 'sort_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('trainers', function (Blueprint $table) {
            $table->dropIndex(['gym_id', 'status', 'sort_order']);
            $table->dropColumn(['role', 'certification', 'sort_order']);
        });
    }
};
