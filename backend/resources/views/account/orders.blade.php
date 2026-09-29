@extends('account.layout')
@section('title', 'Meus pedidos')
@section('content')
<h1>Meus pedidos</h1>
<div class="account-card">
    @forelse ($orders as $order)
        <a class="status-line" href="{{ route('account.orders.show', $order) }}">
            <span>{{ $order->number }} · R$ {{ number_format($order->totalCents() / 100, 2, ',', '.') }}</span>
            <span class="pill">{{ $order->statusLabel() }}</span>
        </a>
    @empty
        <p class="lead">Nenhum pedido ainda.</p>
    @endforelse
</div>
@endsection
