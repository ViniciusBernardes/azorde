@extends('account.layout')
@section('title', 'Favoritos')
@section('content')
<h1>Favoritos</h1>
<div class="account-card">
    @forelse ($items as $favorite)
        @if ($favorite->product)
            <div class="status-line">
                <span>{{ $favorite->product->name }}</span>
                <span>
                    <button class="btn" type="button" data-add="{{ $favorite->product->id }}" onclick="addFav({{ $favorite->product->id }})">No carrinho</button>
                    <form method="post" action="{{ route('account.favorites.toggle', $favorite->product) }}" style="display:inline">@csrf<button class="btn btn--outline" type="submit">Remover</button></form>
                </span>
            </div>
        @endif
    @empty
        <p class="lead">Nenhuma peça salva. No catálogo, use o coração.</p>
    @endforelse
</div>
<script src="/js/store.js" defer></script>
<script>
    function addFav(id) {
        document.addEventListener("azorde:products", function () {
            window.AzordeStore.add(id);
            window.location = "/carrinho/";
        }, { once: true });
    }
</script>
@endsection
