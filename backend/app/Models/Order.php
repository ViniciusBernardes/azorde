<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    public const STATUSES = [
        'received' => 'Pedido recebido',
        'preparing' => 'Em preparo',
        'shipped' => 'Enviado',
        'delivered' => 'Entregue',
        'cancelled' => 'Cancelado',
    ];

    protected $fillable = [
        'user_id', 'number', 'status', 'subtotal_cents', 'shipping_cents',
        'shipping_name', 'shipping_days', 'cep', 'address', 'phone', 'tracking_code',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(OrderEvent::class)->orderBy('id');
    }

    public function statusLabel(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public function totalCents(): int
    {
        return $this->subtotal_cents + $this->shipping_cents;
    }
}
