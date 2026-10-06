<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use App\Models\ProcessStep;
use App\Models\Product;
use App\Models\Setting;
use App\Support\SiteFields;

class SiteController extends Controller
{
    public function show()
    {
        $settings = Setting::map();
        foreach (SiteFields::secrets() as $secret) {
            unset($settings[$secret]);
        }
        foreach (SiteFields::images() as $key) {
            $settings[$key] = Setting::publicUrl($settings[$key] ?? '');
        }

        return response()->json([
            'settings' => $settings,
            'process' => ProcessStep::query()->orderBy('sort_order')->orderBy('id')->get(['label', 'title', 'body']),
            'gallery' => GalleryItem::query()->orderBy('sort_order')->orderBy('id')->get()->map(fn (GalleryItem $item) => [
                'image' => $item->imageUrl(),
                'alt' => $item->alt,
            ]),
            'featured' => Product::query()
                ->where('active', true)
                ->where('featured', true)
                ->orderBy('sort_order')
                ->orderBy('id')
                ->get()
                ->map(fn (Product $product) => $product->toCatalog()),
        ]);
    }
}
