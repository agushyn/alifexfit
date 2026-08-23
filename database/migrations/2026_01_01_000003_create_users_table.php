<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('gym_id')->nullable()->index();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('status', ['active', 'inactive'])->default('active')->index();
            $table->string('avatar')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->foreign('gym_id', 'fk_users_gym')->references('id')->on('gyms')->nullOnDelete();
        });

        Schema::create('role_user', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('role_id');
            $table->unsignedBigInteger('gym_id')->nullable()->index();
            $table->timestamps();

            $table->unique(['user_id', 'role_id', 'gym_id'], 'uq_role_user_gym');
            $table->foreign('user_id', 'fk_ru_user')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('role_id', 'fk_ru_role')->references('id')->on('roles')->cascadeOnDelete();
            $table->foreign('gym_id', 'fk_ru_gym')->references('id')->on('gyms')->nullOnDelete();
        });

        Schema::create('permission_user', function (Blueprint $table) {
            $table->unsignedBigInteger('permission_id');
            $table->unsignedBigInteger('user_id');
            $table->primary(['permission_id', 'user_id']);

            $table->foreign('permission_id', 'fk_pu_perm')->references('id')->on('permissions')->cascadeOnDelete();
            $table->foreign('user_id', 'fk_pu_user')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('permission_user');
        Schema::dropIfExists('role_user');
        Schema::dropIfExists('users');
    }
};
