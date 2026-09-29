@extends('account.layout')
@section('title', 'Finalizar pedido')
@section('content')
<h1>Finalizar pedido</h1>
<p class="lead" id="checkout-empty" hidden>Seu carrinho está vazio. <a href="/produtos/">Ver peças</a></p>
<form class="account-card" id="checkout-form" method="post" action="{{ route('account.checkout.store') }}" hidden>
    @csrf
    <div id="checkout-lines"></div>
    <label for="phone">Telefone</label>
    <input id="phone" name="phone" value="{{ old('phone', auth()->user()->phone) }}" required>
    <label for="cep">CEP</label>
    <input id="cep" name="cep" value="{{ old('cep', auth()->user()->cep) }}" required>
    <label for="address">Endereço completo</label>
    <input id="address" name="address" value="{{ old('address', auth()->user()->address) }}" required>
    @error('items')<p class="error">{{ $message }}</p>@enderror
    <input type="hidden" name="shipping_name" id="shipping_name">
    <input type="hidden" name="shipping_cents" id="shipping_cents" value="0">
    <input type="hidden" name="shipping_days" id="shipping_days">
    <p class="lead" id="checkout-total"></p>
    <button class="btn" type="submit">Confirmar pedido</button>
</form>
<script src="/js/store.js" defer></script>
<script>
    function money(cents) {
        return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }
    document.addEventListener("azorde:products", function () {
        var store = window.AzordeStore;
        var lines = store.lines();
        var form = document.getElementById("checkout-form");
        if (!lines.length) {
            document.getElementById("checkout-empty").hidden = false;
            return;
        }
        form.hidden = false;
        var box = document.getElementById("checkout-lines");
        lines.forEach(function (line) {
            box.insertAdjacentHTML("beforeend", '<input type="hidden" name="items[' + line.product.id + '][id]" value="' + line.product.id + '"><input type="hidden" name="items[' + line.product.id + '][qty]" value="' + line.qty + '"><p>' + line.qty + '× ' + line.product.name + '</p>');
        });
        var freight = {};
        try { freight = JSON.parse(sessionStorage.getItem("azorde-frete") || "{}"); } catch (e) {}
        if (freight.selected) {
            document.getElementById("shipping_name").value = freight.selected.name || "";
            document.getElementById("shipping_cents").value = freight.selected.price || 0;
            document.getElementById("shipping_days").value = freight.selected.days || "";
            if (freight.cep) document.getElementById("cep").value = freight.cep.replace(/\D/g, "");
        }
        var shipping = freight.selected ? Number(freight.selected.price) || 0 : 0;
        document.getElementById("checkout-total").textContent = "Total: " + money(store.total() + shipping) + (shipping ? " (já com o frete)" : " (sem frete selecionado)");
    });
</script>
@endsection
