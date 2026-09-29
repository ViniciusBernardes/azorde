@extends('admin.layout')
@section('title', $order->number)
@section('content')
<div class="page-head">
    <div>
        <h1>{{ $order->number }}</h1>
        <p class="lead">{{ $order->user->name }} · {{ $order->user->email }} · {{ $order->phone }}</p>
    </div>
</div>
<div class="card">
    @foreach ($order->items as $item)
        <p>{{ $item->qty }}× {{ $item->name }} — R$ {{ number_format($item->unit_price_cents * $item->qty / 100, 2, ',', '.') }}</p>
    @endforeach
    <p>Frete {{ $order->shipping_name ?: 'não informado' }}: R$ {{ number_format($order->shipping_cents / 100, 2, ',', '.') }}</p>
    <p><strong>Total R$ {{ number_format($order->totalCents() / 100, 2, ',', '.') }}</strong></p>
    <p>{{ $order->address }} · CEP {{ $order->cep }}</p>
</div>
<form class="card" method="post" action="{{ route('admin.orders.update', $order) }}">
    @csrf @method('put')
    <h2>Atualizar status</h2>
    <p class="hint">O texto abaixo chega como aviso na conta do cliente.</p>
    <label for="status">Status</label>
    <select id="status" name="status">
        @foreach ($statuses as $value => $label)
            <option value="{{ $value }}" @selected($order->status === $value)>{{ $label }}</option>
        @endforeach
    </select>
    <label for="tracking_code">Código de rastreio</label>
    <input id="tracking_code" name="tracking_code" type="text" value="{{ old('tracking_code', $order->tracking_code) }}">
    <label for="message">Aviso para o cliente</label>
    <textarea id="message" name="message" placeholder="Se ficar vazio, enviamos o status automaticamente.">{{ old('message') }}</textarea>
    <div class="row" style="margin-top:1rem"><button type="submit">Salvar e avisar</button></div>
</form>
<div class="card">
    <h2>Histórico</h2>
    @foreach ($order->events as $event)
        <p><strong>{{ $statuses[$event->status] ?? $event->status }}</strong> — {{ $event->message }}<br><small>{{ $event->created_at->format('d/m/Y H:i') }}</small></p>
    @endforeach
</div>
@endsection
