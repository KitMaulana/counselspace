<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    public $timestamps = false;
    protected $fillable = ['session_id', 'sender_type', 'message', 'is_read', 'counselor_id', 'student_id', 'is_anonymous'];
    protected $casts = [
        'is_read' => 'boolean',
        'is_anonymous' => 'boolean',
        'created_at' => 'datetime',
    ];
}
