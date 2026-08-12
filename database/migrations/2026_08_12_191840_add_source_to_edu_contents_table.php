<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('edu_contents', function (Blueprint $table) {
            $table->string('source', 255)->nullable()->after('category');
        });
    }

    public function down(): void
    {
        Schema::table('edu_contents', function (Blueprint $table) {
            $table->dropColumn('source');
        });
    }
};
