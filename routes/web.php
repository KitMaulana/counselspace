<?php
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('student');
});

Route::get('/admin', function () {
    return view('admin');
});
