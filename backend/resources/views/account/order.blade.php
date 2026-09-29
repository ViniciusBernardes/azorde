@extends('account.layout')
@section('title', $order->number)
@section('content')
<h1>{{ $order->number }}</h1>
<p class="pill">{{ $order->statusLabel() }}</p>
@if ($order->tracking_code)<p class="lead">Rastreio: {{ $order->tracking_code }}</p>@endif
<div class="account-card">
    @foreach ($order->items as $item)
        <div class="status-line">
            <span>{{ $item->qty }}× {{ $item->name }}</span>
            <span>R$ {{ number_format($item->unit_price_cents * $item->qty / 100, 2, ',', '.') }}</span>
        </div>
    @endforeach
    <div class="status-line"><span>Frete {{ $order->shipping_name }}</span><span>R$ {{ number_format($order->shipping_cents / 100, 2, ',', '.') }}</span></div>
    <div class="status-line"><strong>Total</strong><strong>R$ {{ number_format($order->totalCents() / 100, 2, ',', '.') }}</strong></div>
    <p class="lead">Entrega: {{ $order->address }} · CEP {{ $order->cep }}</p>
</div>
<div class="account-card">
    <h2>Acompanhamento</h2>
    <ol class="timeline">
        @foreach ($order->events as $event)
            <li><strong>{{ \App\Models\Order::STATUSES[$event->status] ?? $event->status }}</strong><br>{{ $event->message }}<br><small>{{ $event->created_at->format('d/m/Y H:i') }}</small></li>
        @endforeach
    </ol>
</div>
<p>
    <button class="btn" type="button" id="reorder">Comprar de novo</button>
</p>
<script>
    document.getElementById("reorder").addEventListener("click", function () {
        var incoming = @json($order->items->map(fn ($item) => ['id' => (string) $item->product_id, 'qty' => $item->qty])->filter(fn ($item) => $item['id'] !== '')->values());
        var current = [];
        try { current = JSON.parse(localStorage.getItem("azorde-cart") || "[]"); } catch (e) {}
        incoming.forEach(function (item) {
            if (!item.id) return;
            var found = current.filter(function (row) { return String(row.id) === String(item.id); })[0];
            if (found) found.qty += item.qty;
            else current.push({ id: String(item.id), qty: item.qty });
        });
        localStorage.setItem("azorde-cart", JSON.stringify(current));
        window.location = "/carrinho/";
    });
</script>
@endsection
