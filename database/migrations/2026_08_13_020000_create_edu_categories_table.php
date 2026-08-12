<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        Schema::create('edu_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('slug', 100)->unique();
            $table->timestamps();
        });

        // Seed default categories
        DB::table('edu_categories')->insert([
            ['name' => 'FOMO', 'slug' => 'fomo', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'JOMO', 'slug' => 'jomo', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Kecemasan', 'slug' => 'kecemasan', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Digital Wellness', 'slug' => 'digital-wellness', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Umum', 'slug' => 'umum', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
    public function down(): void {
        Schema::dropIfExists('edu_categories');
    }
};
