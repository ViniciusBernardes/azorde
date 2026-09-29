<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    public static function getValue(string $key, string $default = ''): string
    {
        return (string) (static::query()->where('key', $key)->value('value') ?? $default);
    }

    public static function map(): array
    {
        return static::query()->pluck('value', 'key')->all();
    }

    public static function put(string $key, ?string $value): void
    {
        static::query()->updateOrCreate(['key' => $key], ['value' => $value ?? '']);
    }

    public static function publicUrl(?string $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }

        if (str_starts_with($value, 'http://') || str_starts_with($value, 'https://') || str_starts_with($value, '/')) {
            return $value;
        }

        return Storage::url($value);
    }
}
