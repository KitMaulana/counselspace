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
        Schema::table('users', function (Blueprint $table) {
            $table->string('photo_url', 255)->nullable()->after('student_class');
            $table->string('service_hours', 100)->nullable()->after('photo_url');
            $table->timestamp('last_seen')->nullable()->after('service_hours');
        });

        Schema::table('chats', function (Blueprint $table) {
            $table->foreignId('counselor_id')->nullable()->after('session_id')->constrained('users')->onDelete('set null');
            $table->foreignId('student_id')->nullable()->after('counselor_id')->constrained('users')->onDelete('set null');
            $table->boolean('is_anonymous')->default(true)->after('student_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chats', function (Blueprint $table) {
            $table->dropForeign(['counselor_id']);
            $table->dropForeign(['student_id']);
            $table->dropColumn(['counselor_id', 'student_id', 'is_anonymous']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['photo_url', 'service_hours', 'last_seen']);
        });
    }
};

