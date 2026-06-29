<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('screenings', function (Blueprint $table) {
            $table->id();
            $table->string('student_name', 100)->nullable();
            $table->string('student_class', 50)->nullable();
            $table->integer('total_score');
            $table->integer('max_score');
            $table->decimal('percentage', 5, 2)->nullable();
            $table->enum('category', ['aman', 'waspada', 'bahaya']);
            $table->json('answers_json')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }
    public function down(): void {
        Schema::dropIfExists('screenings');
    }
};
