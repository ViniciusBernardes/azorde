<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price_cents',
        'weight_grams',
        'image',
        'alt',
        'active',
        'featured',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'featured' => 'boolean',
            'price_cents' => 'integer',
            'weight_grams' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function imageUrl(): string
    {
        $image = $this->image;

        if (str_starts_with($image, 'http://') || str_starts_with($image, 'https://') || str_starts_with($image, '/')) {
            return $image;
        }

        return Storage::url($image);
    }

    public function toCatalog(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'price' => $this->price_cents,
            'weight' => $this->weight_grams,
            'image' => $this->imageUrl(),
            'alt' => $this->alt ?: $this->name,
            'featured' => $this->featured,
            'description' => $this->description,
        ];
    }
}
