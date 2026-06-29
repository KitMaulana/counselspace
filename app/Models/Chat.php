<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    public $timestamps = false;
    protected $fillable = ['session_id', 'sender_type', 'message', 'is_read'];
    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
    ];
}
