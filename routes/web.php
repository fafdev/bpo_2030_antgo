<?php

use App\Http\Controllers\RolController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('rols', [RolController::class, 'index'])->name('rols.index');
    Route::post('rols', [RolController::class, 'store'])->name('rols.store');
    Route::patch('rols/{rol}', [RolController::class, 'update'])->name('rols.update');
    Route::delete('rols/{rol}', [RolController::class, 'destroy'])->name('rols.destroy');
    Route::post('rols/import', [RolController::class, 'import'])->name('rols.import');

    Route::get('users', [UserController::class, 'index'])->name('users.index');
    Route::post('users', [UserController::class, 'store'])->name('users.store');
    Route::patch('users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::post('users/import', [UserController::class, 'import'])->name('users.import');
});

require __DIR__.'/settings.php';
