@extends('admin.layout')
@section('title', $product->exists ? 'Editar produto' : 'Novo produto')
@section('content')
<div class="page-head">
    <div>
        <h1>{{ $product->exists ? 'Editar produto' : 'Novo produto' }}</h1>
        <p class="lead">Preencha peso e volume da embalagem para o frete sair certo no Melhor Envio. Em branco, usa o padrão em Conteúdo → Frete.</p>
    </div>
</div>

<form method="post" enctype="multipart/form-data" action="{{ $product->exists ? route('admin.products.update', $product) : route('admin.products.store') }}">
    @csrf
    @if ($product->exists) @method('put') @endif

    <section class="card">
        <h2>Identidade</h2>
        <p class="hint">Como a peça aparece na loja e no carrinho.</p>
        <label for="name">Nome</label>
        <input id="name" name="name" type="text" value="{{ old('name', $product->name) }}" required>
        @error('name')<p class="error">{{ $message }}</p>@enderror

        <label for="description">Descrição</label>
        <textarea id="description" name="description">{{ old('description', $product->description) }}</textarea>
        @error('description')<p class="error">{{ $message }}</p>@enderror
    </section>

    <section class="card">
        <h2>Preço e ordem</h2>
        <p class="hint">Valor cobrado no checkout. Ordem define a posição na grade da loja.</p>
        <div class="field-grid field-grid--2">
            <div>
                <label for="price">Valor (R$)</label>
                <input id="price" name="price" type="number" min="0" step="0.01" value="{{ old('price', $product->exists ? number_format($product->price_cents / 100, 2, '.', '') : '') }}" required>
                @error('price')<p class="error">{{ $message }}</p>@enderror
            </div>
            <div>
                <label for="sort_order">Ordem na loja</label>
                <input id="sort_order" name="sort_order" type="number" min="0" value="{{ old('sort_order', $product->sort_order ?? 0) }}">
                @error('sort_order')<p class="error">{{ $message }}</p>@enderror
            </div>
        </div>
    </section>

    <section class="card">
        <h2>Frete — peso e volume</h2>
        <p class="hint">Meça a embalagem fechada (caixa ou envelope rígido). Mínimos do Melhor Envio: C/L 11 cm, altura 2 cm.</p>
        <div class="field-grid field-grid--4">
            <div>
                <label for="weight_grams">Peso (g)</label>
                <input id="weight_grams" name="weight_grams" type="number" min="1" max="30000" value="{{ old('weight_grams', $product->weight_grams) }}" placeholder="ex.: 450">
                @error('weight_grams')<p class="error">{{ $message }}</p>@enderror
            </div>
            <div>
                <label for="length_cm">Comprimento (cm)</label>
                <input id="length_cm" name="length_cm" type="number" min="11" max="100" value="{{ old('length_cm', $product->length_cm) }}" placeholder="mín. 11">
                @error('length_cm')<p class="error">{{ $message }}</p>@enderror
            </div>
            <div>
                <label for="width_cm">Largura (cm)</label>
                <input id="width_cm" name="width_cm" type="number" min="11" max="100" value="{{ old('width_cm', $product->width_cm) }}" placeholder="mín. 11">
                @error('width_cm')<p class="error">{{ $message }}</p>@enderror
            </div>
            <div>
                <label for="height_cm">Altura (cm)</label>
                <input id="height_cm" name="height_cm" type="number" min="2" max="100" value="{{ old('height_cm', $product->height_cm) }}" placeholder="mín. 2">
                @error('height_cm')<p class="error">{{ $message }}</p>@enderror
            </div>
        </div>
        <p class="hint" style="margin-top:.75rem">Se algum campo ficar vazio, o cálculo usa o padrão de Conteúdo → Frete.</p>
    </section>

    <section class="card">
        <h2>Foto</h2>
        <p class="hint">Imagem da peça na loja. Preferível vertical, boa luz.</p>
        <label for="alt">Texto da foto (acessibilidade)</label>
        <input id="alt" name="alt" type="text" value="{{ old('alt', $product->alt) }}" placeholder="Descrição curta da imagem">
        @error('alt')<p class="error">{{ $message }}</p>@enderror

        <label for="image">Arquivo {{ $product->exists ? '(só se for trocar)' : '' }}</label>
        <input id="image" name="image" type="file" accept="image/*" @unless($product->exists) required @endunless>
        @error('image')<p class="error">{{ $message }}</p>@enderror
        @if ($product->exists)
            <img class="thumb thumb--lg" src="{{ $product->imageUrl() }}" alt="">
        @endif
    </section>

    <section class="card">
        <h2>Visibilidade</h2>
        <p class="hint">Ocultos somem da loja. Destaques entram na página inicial.</p>
        <label class="check"><input type="checkbox" name="active" value="1" @checked(old('active', $product->active ?? true))> Visível na loja</label>
        <label class="check"><input type="checkbox" name="featured" value="1" @checked(old('featured', $product->featured))> Destaque na página inicial</label>
    </section>

    <div class="form-actions">
        <button type="submit">Salvar produto</button>
        <a class="btn ghost" href="{{ route('admin.products.index') }}">Voltar</a>
    </div>
</form>
@endsection
