@extends('admin.layout')
@section('title', 'Pedidos')
@section('content')
<div class="page-head">
    <div>
        <h1>Pedidos</h1>
        <p class="lead">Recebidos pela loja. Ao mudar o status, o cliente recebe um aviso na conta.</p>
    </div>
</div>
<div class="table-card">
<table>
    <thead><tr><th>Pedido</th><th>Cliente</th><th>Total</th><th>Status</th><th></th></tr></thead>
    <tbody>
    @forelse ($orders as $order)
        <tr>
            <td>{{ $order->number }}<br><small>{{ $order->created_at->format('d/m/Y H:i') }}</small></td>
            <td>{{ $order->user->name }}<br><small>{{ $order->user->email }}</small></td>
            <td>R$ {{ number_format($order->totalCents() / 100, 2, ',', '.') }}</td>
            <td><span class="badge">{{ $order->statusLabel() }}</span></td>
            <td><a class="link" href="{{ route('admin.orders.show', $order) }}">Abrir</a></td>
        </tr>
    @empty
        <tr><td colspan="5">Nenhum pedido ainda.</td></tr>
    @endforelse
    </tbody>
</table>
</div>
@endsection
