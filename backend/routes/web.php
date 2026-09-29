<?php

use App\Http\Controllers\Account\AccountController;
use App\Http\Controllers\Account\CustomerAuthController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\GalleryController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProcessStepController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\SettingController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/admin');

Route::middleware('guest')->group(function () {
    Route::get('/admin/login', [AuthController::class, 'create'])->name('admin.login');
    Route::post('/admin/login', [AuthController::class, 'store'])->name('admin.login.store');
    Route::get('/conta/entrar', [CustomerAuthController::class, 'create'])->name('account.login');
    Route::post('/conta/entrar', [CustomerAuthController::class, 'store'])->name('account.login.store');
    Route::get('/conta/cadastro', [CustomerAuthController::class, 'registerForm'])->name('account.register');
    Route::post('/conta/cadastro', [CustomerAuthController::class, 'register'])->name('account.register.store');
});

Route::post('/admin/logout', [AuthController::class, 'destroy'])->middleware('auth')->name('admin.logout');

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::redirect('/', '/admin/conteudo')->name('home');

    Route::get('/conteudo', [SettingController::class, 'edit'])->name('settings.edit');
    Route::put('/conteudo', [SettingController::class, 'update'])->name('settings.update');

    Route::get('/produtos', [ProductController::class, 'index'])->name('products.index');
    Route::get('/produtos/novo', [ProductController::class, 'create'])->name('products.create');
    Route::post('/produtos', [ProductController::class, 'store'])->name('products.store');
    Route::get('/produtos/{product}/editar', [ProductController::class, 'edit'])->name('products.edit');
    Route::put('/produtos/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/produtos/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

    Route::get('/processo', [ProcessStepController::class, 'index'])->name('steps.index');
    Route::get('/processo/novo', [ProcessStepController::class, 'create'])->name('steps.create');
    Route::post('/processo', [ProcessStepController::class, 'store'])->name('steps.store');
    Route::get('/processo/{step}/editar', [ProcessStepController::class, 'edit'])->name('steps.edit');
    Route::put('/processo/{step}', [ProcessStepController::class, 'update'])->name('steps.update');
    Route::delete('/processo/{step}', [ProcessStepController::class, 'destroy'])->name('steps.destroy');

    Route::get('/galeria', [GalleryController::class, 'index'])->name('gallery.index');
    Route::get('/galeria/nova', [GalleryController::class, 'create'])->name('gallery.create');
    Route::post('/galeria', [GalleryController::class, 'store'])->name('gallery.store');
    Route::get('/galeria/{item}/editar', [GalleryController::class, 'edit'])->name('gallery.edit');
    Route::put('/galeria/{item}', [GalleryController::class, 'update'])->name('gallery.update');
    Route::delete('/galeria/{item}', [GalleryController::class, 'destroy'])->name('gallery.destroy');

    Route::get('/pedidos', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/pedidos/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::put('/pedidos/{order}', [OrderController::class, 'update'])->name('orders.update');
});

Route::get('/conta/eu', [AccountController::class, 'me'])->name('account.me');

Route::middleware('auth')->prefix('conta')->name('account.')->group(function () {
    Route::get('/', [AccountController::class, 'home'])->name('home');
    Route::get('/pedidos', [AccountController::class, 'orders'])->name('orders');
    Route::get('/pedidos/{order}', [AccountController::class, 'show'])->name('orders.show');
    Route::get('/finalizar', [AccountController::class, 'checkoutForm'])->name('checkout');
    Route::post('/pedidos', [AccountController::class, 'checkout'])->name('checkout.store');
    Route::get('/favoritos', [AccountController::class, 'favorites'])->name('favorites');
    Route::post('/favoritos/{product}', [AccountController::class, 'toggleFavorite'])->name('favorites.toggle');
    Route::get('/avisos', [AccountController::class, 'notices'])->name('notices');
    Route::get('/dados', [AccountController::class, 'profile'])->name('profile');
    Route::put('/dados', [AccountController::class, 'updateProfile'])->name('profile.update');
    Route::post('/sair', [CustomerAuthController::class, 'destroy'])->name('logout');
});
