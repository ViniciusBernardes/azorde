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
            'shippingFromCents' => $this->moneyToCents(Setting::getValue('frete_aproximado', '29.90')),
            'products' => Product::query()
                ->where('active', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(fn (Product $product) => $product->toCatalog()),
        ]);
    }

    private function moneyToCents(string $value): int
    {
        $normalized = preg_replace('/[^\d,.]/', '', $value) ?? '';
        if (str_contains($normalized, ',') && str_contains($normalized, '.')) {
            $normalized = str_replace('.', '', $normalized);
            $normalized = str_replace(',', '.', $normalized);
        } elseif (str_contains($normalized, ',')) {
            $normalized = str_replace(',', '.', $normalized);
        }
        if (! is_numeric($normalized)) {
            return 0;
        }

        return max(0, (int) round(((float) $normalized) * 100));
    }
}
