@extends('admin.layout')
@section('title', $product->exists ? 'Editar produto' : 'Novo produto')
@section('content')
<h1>{{ $product->exists ? 'Editar produto' : 'Novo produto' }}</h1>
<form class="card" method="post" enctype="multipart/form-data" action="{{ $product->exists ? route('admin.products.update', $product) : route('admin.products.store') }}">
    @csrf
    @if ($product->exists) @method('put') @endif
    <label for="name">Nome</label>
    <input id="name" name="name" type="text" value="{{ old('name', $product->name) }}" required>
    @error('name')<p class="error">{{ $message }}</p>@enderror
    <label for="description">Descrição</label>
    <textarea id="description" name="description">{{ old('description', $product->description) }}</textarea>
    <label for="price">Valor (R$)</label>
    <input id="price" name="price" type="number" min="0" step="0.01" value="{{ old('price', $product->exists ? number_format($product->price_cents / 100, 2, '.', '') : '') }}" required>
    @error('price')<p class="error">{{ $message }}</p>@enderror
    <label for="weight_grams">Peso com embalagem (gramas)</label>
    <input id="weight_grams" name="weight_grams" type="number" min="1" value="{{ old('weight_grams', $product->weight_grams) }}" placeholder="Em branco usa o peso padrão do frete">
    <label for="alt">Texto da foto</label>
    <input id="alt" name="alt" type="text" value="{{ old('alt', $product->alt) }}">
    <label for="sort_order">Ordem</label>
    <input id="sort_order" name="sort_order" type="number" min="0" value="{{ old('sort_order', $product->sort_order ?? 0) }}">
    <label for="image">Foto {{ $product->exists ? '(troque só se quiser outra)' : '' }}</label>
    <input id="image" name="image" type="file" accept="image/*" @unless($product->exists) required @endunless>
    @error('image')<p class="error">{{ $message }}</p>@enderror
    @if ($product->exists)
        <img class="thumb" src="{{ $product->imageUrl() }}" alt="" style="margin-top:.6rem">
    @endif
    <label class="check"><input type="checkbox" name="active" value="1" @checked(old('active', $product->active))> Visível na loja</label>
    <label class="check"><input type="checkbox" name="featured" value="1" @checked(old('featured', $product->featured))> Destaque na página inicial</label>
    <div class="row" style="margin-top: 1rem;">
        <button type="submit">Salvar</button>
        <a class="btn ghost" href="{{ route('admin.products.index') }}">Voltar</a>
    </div>
</form>
@endsection
