<?php

use App\Http\Controllers\BusinessPartnerController;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\PostalcodeController;
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

    Route::get('business-partners', [BusinessPartnerController::class, 'index'])->name('business-partners.index');
    Route::post('business-partners', [BusinessPartnerController::class, 'store'])->name('business-partners.store');
    Route::patch('business-partners/{businessPartner}', [BusinessPartnerController::class, 'update'])->name('business-partners.update');
    Route::delete('business-partners/{businessPartner}', [BusinessPartnerController::class, 'destroy'])->name('business-partners.destroy');

    Route::get('countries', [CountryController::class, 'index'])->name('countries.index');
    Route::post('countries', [CountryController::class, 'store'])->name('countries.store');
    Route::patch('countries/{country}', [CountryController::class, 'update'])->name('countries.update');
    Route::delete('countries/{country}', [CountryController::class, 'destroy'])->name('countries.destroy');

    Route::get('postalcodes', [PostalcodeController::class, 'index'])->name('postalcodes.index');
    Route::post('postalcodes', [PostalcodeController::class, 'store'])->name('postalcodes.store');
    Route::patch('postalcodes/{postalcode}', [PostalcodeController::class, 'update'])->name('postalcodes.update');
    Route::delete('postalcodes/{postalcode}', [PostalcodeController::class, 'destroy'])->name('postalcodes.destroy');
    Route::post('postalcodes/import', [PostalcodeController::class, 'import'])->name('postalcodes.import');
});

require __DIR__.'/settings.php';
