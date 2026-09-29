@extends('account.layout')
@section('title', 'Avisos')
@section('content')
<h1>Avisos</h1>
<p class="lead">Aqui ficam as mudanças de status dos seus pedidos.</p>
<div class="account-card">
    @forelse ($notices as $notice)
        <div class="status-line">
            <span><strong>{{ $notice->title }}</strong><br>{{ $notice->body }}</span>
            <small>{{ $notice->created_at->format('d/m/Y H:i') }}</small>
        </div>
    @empty
        <p class="lead">Nenhum aviso ainda.</p>
    @endforelse
</div>
@endsection
