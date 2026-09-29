@extends('account.layout')
@section('title', 'Minha conta')
@section('content')
<h1>Olá, {{ auth()->user()->name }}</h1>
<p class="lead">{{ $unread }} aviso(s) não lido(s) · {{ $favorites }} favorito(s)</p>
<div class="account-card">
    <h2>Pedidos recentes</h2>
    @forelse ($orders as $order)
        <a class="status-line" href="{{ route('account.orders.show', $order) }}">
            <span>{{ $order->number }}</span>
            <span class="pill">{{ $order->statusLabel() }}</span>
        </a>
    @empty
        <p class="lead">Você ainda não fez um pedido. <a href="/produtos/">Ver peças</a></p>
    @endforelse
    <p style="margin-top:1rem"><a href="{{ route('account.orders') }}">Ver todos</a></p>
</div>
@endsection
