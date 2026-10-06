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
        'length_cm',
        'width_cm',
        'height_cm',
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
            'length_cm' => 'integer',
            'width_cm' => 'integer',
            'height_cm' => 'integer',
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
            'length' => $this->length_cm,
            'width' => $this->width_cm,
            'height' => $this->height_cm,
            'image' => $this->imageUrl(),
            'alt' => $this->alt ?: $this->name,
            'featured' => $this->featured,
            'description' => $this->description,
        ];
    }

    public function packageLabel(): string
    {
        if (! $this->weight_grams && ! $this->length_cm && ! $this->width_cm && ! $this->height_cm) {
            return 'Padrão do frete';
        }

        $parts = [];
        if ($this->weight_grams) {
            $parts[] = $this->weight_grams.' g';
        }
        if ($this->length_cm || $this->width_cm || $this->height_cm) {
            $parts[] = ($this->length_cm ?: '—').'×'.($this->width_cm ?: '—').'×'.($this->height_cm ?: '—').' cm';
        }

        return implode(' · ', $parts) ?: 'Padrão do frete';
    }
}
