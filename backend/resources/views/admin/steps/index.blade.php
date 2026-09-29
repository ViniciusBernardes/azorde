@extends('admin.layout')
@section('title', 'Processo')
@section('content')
<div class="page-head">
    <div>
        <h1>Processo</h1>
        <p class="lead">As etapas que aparecem na seção “O processo” da página inicial.</p>
    </div>
    <a class="btn" href="{{ route('admin.steps.create') }}">Nova etapa</a>
</div>
<div class="table-card">
<table>
    <thead><tr><th></th><th>Título</th><th>Texto</th><th></th></tr></thead>
    <tbody>
    @foreach ($steps as $step)
        <tr>
            <td>{{ $step->label }}</td>
            <td>{{ $step->title }}</td>
            <td>{{ $step->body }}</td>
            <td class="row">
                <a class="link" href="{{ route('admin.steps.edit', $step) }}">Editar</a>
                <form method="post" action="{{ route('admin.steps.destroy', $step) }}">@csrf @method('delete')<button class="ghost" type="submit">Remover</button></form>
            </td>
        </tr>
    @endforeach
    </tbody>
</table>
</div>
@endsection
