<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EduContent extends Model
{
    protected $table = 'edu_contents';
    protected $fillable = ['title', 'description', 'content_type', 'content_url', 'thumbnail_url', 'category', 'is_active'];
    protected $casts = ['is_active' => 'boolean'];

    public function scopeActive($query) {
        return $query->where('is_active', true);
    }
}
