<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('website_faqs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gym_id')->constrained('gyms')->cascadeOnDelete();
            $table->string('question', 255);
            $table->text('answer');
            $table->string('category', 100)->nullable()->default('general');
            $table->enum('status', ['published', 'draft'])->default('published');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['gym_id', 'status', 'sort_order']);
            $table->index(['gym_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('website_faqs');
    }
};
