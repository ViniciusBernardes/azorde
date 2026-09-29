<?php

use App\Http\Controllers\Api\FreightController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\SiteController;
use Illuminate\Support\Facades\Route;

Route::get('/site', [SiteController::class, 'show']);
Route::get('/products', [ProductController::class, 'index']);
Route::post('/frete', [FreightController::class, 'store']);
