<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Screening extends Model
{
    public $timestamps = false;
    protected $fillable = [
        'user_id', // Ditambahkan
        'student_name', 
        'student_class', 
        'total_score', 
        'max_score', 
        'percentage', 
        'category', 
        'answers_json'
    ];
    
    protected $casts = [
        'answers_json' => 'array',
        'percentage' => 'float',
        'created_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
