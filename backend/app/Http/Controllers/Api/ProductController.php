<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Setting;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json([
            'pixPercent' => (int) Setting::getValue('pix_percent', '5'),
            'products' => Product::query()
                ->where('active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(fn (Product $product) => $product->toCatalog()),
        ]);
    }
}
