@extends('admin.layout')
@section('title', 'Etapa')
@section('content')
<h1>{{ $step->exists ? 'Editar etapa' : 'Nova etapa' }}</h1>
<form class="card" method="post" action="{{ $step->exists ? route('admin.steps.update', $step) : route('admin.steps.store') }}">
    @csrf
    @if ($step->exists) @method('put') @endif
    <label for="label">Número</label>
    <input id="label" name="label" type="text" maxlength="8" value="{{ old('label', $step->label) }}" required>
    <label for="title">Título</label>
    <input id="title" name="title" type="text" value="{{ old('title', $step->title) }}" required>
    <label for="body">Texto</label>
    <textarea id="body" name="body" required>{{ old('body', $step->body) }}</textarea>
    <label for="sort_order">Ordem</label>
    <input id="sort_order" name="sort_order" type="number" min="0" value="{{ old('sort_order', $step->sort_order ?? 0) }}">
    <div class="row" style="margin-top:1rem;"><button type="submit">Salvar</button><a class="btn ghost" href="{{ route('admin.steps.index') }}">Voltar</a></div>
</form>
@endsection
