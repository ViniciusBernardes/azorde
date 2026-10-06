@extends('admin.layout')
@section('title', 'Produtos')
@section('content')
<div class="page-head">
    <div>
        <h1>Produtos</h1>
        <p class="lead">Alimentam a loja e o carrinho. Peso e volume de cada peça entram no cálculo do Melhor Envio.</p>
    </div>
    <a class="btn" href="{{ route('admin.products.create') }}">Novo produto</a>
</div>
<div class="table-card">
<table>
    <thead>
        <tr>
            <th></th>
            <th>Nome</th>
            <th>Valor</th>
            <th>Embalagem</th>
            <th>Loja</th>
            <th>Destaque</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
    @forelse ($products as $product)
        <tr>
            <td><img class="thumb" src="{{ $product->imageUrl() }}" alt=""></td>
            <td>
                <strong class="table-title">{{ $product->name }}</strong>
            </td>
            <td>R$ {{ number_format($product->price_cents / 100, 2, ',', '.') }}</td>
            <td><span class="meta">{{ $product->packageLabel() }}</span></td>
            <td>@if($product->active)<span class="badge">Na loja</span>@else<span class="badge badge--off">Oculto</span>@endif</td>
            <td>@if($product->featured)<span class="badge badge--star">Destaque</span>@else<span class="badge badge--off">Não</span>@endif</td>
            <td class="row">
                <a class="link" href="{{ route('admin.products.edit', $product) }}">Editar</a>
                <form method="post" action="{{ route('admin.products.destroy', $product) }}" onsubmit="return confirm('Remover este produto?')">
                    @csrf @method('delete')
                    <button class="ghost" type="submit">Remover</button>
                </form>
            </td>
        </tr>
    @empty
        <tr><td colspan="7">Nenhum produto cadastrado.</td></tr>
    @endforelse
    </tbody>
</table>
</div>
@endsection
