<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EduCategory extends Model
{
    protected $table = 'edu_categories';
    protected $fillable = ['name', 'slug'];
}
