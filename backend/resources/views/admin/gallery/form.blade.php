@extends('admin.layout')
@section('title', 'Foto')
@section('content')
<h1>{{ $item->exists ? 'Editar foto' : 'Nova foto' }}</h1>
<form class="card" method="post" enctype="multipart/form-data" action="{{ $item->exists ? route('admin.gallery.update', $item) : route('admin.gallery.store') }}">
    @csrf
    @if ($item->exists) @method('put') @endif
    <label for="alt">Descrição</label>
    <input id="alt" name="alt" type="text" value="{{ old('alt', $item->alt) }}" required>
    <label for="sort_order">Ordem</label>
    <input id="sort_order" name="sort_order" type="number" min="0" value="{{ old('sort_order', $item->sort_order ?? 0) }}">
    <label for="image">Foto {{ $item->exists ? '(troque só se quiser outra)' : '' }}</label>
    <input id="image" name="image" type="file" accept="image/*" @unless($item->exists) required @endunless>
    @error('image')<p class="error">{{ $message }}</p>@enderror
    @if ($item->exists)
        <img class="thumb" src="{{ $item->imageUrl() }}" alt="" style="margin-top:.6rem">
    @endif
    <div class="row" style="margin-top:1rem;"><button type="submit">Salvar</button><a class="btn ghost" href="{{ route('admin.gallery.index') }}">Voltar</a></div>
</form>
@endsection
