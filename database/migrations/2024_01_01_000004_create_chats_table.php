<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 64)->index();
            $table->enum('sender_type', ['student', 'counselor']);
            $table->text('message');
            $table->boolean('is_read')->default(false);
            $table->timestamp('created_at')->useCurrent()->index();
        });
    }
    public function down(): void {
        Schema::dropIfExists('chats');
    }
};
