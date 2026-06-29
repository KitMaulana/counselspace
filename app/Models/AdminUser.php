<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class AdminUser extends Authenticatable
{
    protected $table = 'admin_users';
    public $timestamps = false;
    protected $fillable = ['username', 'password', 'full_name', 'role'];
    protected $hidden = ['password'];
    protected $casts = ['created_at' => 'datetime'];
}
