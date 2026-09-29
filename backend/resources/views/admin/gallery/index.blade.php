@extends('admin.layout')
@section('title', 'Galeria')
@section('content')
<div class="page-head">
    <div>
        <h1>Galeria</h1>
        <p class="lead">Fotos da grade na página inicial, na ordem abaixo.</p>
    </div>
    <a class="btn" href="{{ route('admin.gallery.create') }}">Nova foto</a>
</div>
<div class="table-card">
<table>
    <thead><tr><th></th><th>Descrição</th><th></th></tr></thead>
    <tbody>
    @foreach ($items as $item)
        <tr>
            <td><img class="thumb" src="{{ $item->imageUrl() }}" alt=""></td>
            <td>{{ $item->alt }}</td>
            <td class="row">
                <a class="link" href="{{ route('admin.gallery.edit', $item) }}">Editar</a>
                <form method="post" action="{{ route('admin.gallery.destroy', $item) }}">@csrf @method('delete')<button class="ghost" type="submit">Remover</button></form>
            </td>
        </tr>
    @endforeach
    </tbody>
</table>
</div>
@endsection
