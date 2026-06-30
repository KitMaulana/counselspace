<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'username',
        'password',
        'role',
        'student_class',
        'session_token', // Ditambahkan
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'session_token', // Ditambahkan agar tidak bocor di JSON response
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }
}
