@extends('account.layout')
@section('title', 'Entrar')
@section('content')
<div class="account-card" style="max-width:28rem">
    <h1>Entrar</h1>
    <p class="lead">Acompanhe pedidos, salve favoritos e compre de novo.</p>
    <form method="post" action="{{ route('account.login.store') }}">
        @csrf
        <label for="email">E-mail</label>
        <input id="email" name="email" type="email" value="{{ old('email') }}" required>
        @error('email')<p class="error">{{ $message }}</p>@enderror
        <label for="password">Senha</label>
        <input id="password" name="password" type="password" required>
        <div style="margin-top:1rem"><button class="btn" type="submit">Entrar</button></div>
    </form>
    <p class="lead" style="margin-top:1rem">Ainda não tem conta? <a href="{{ route('account.register') }}">Cadastre-se</a></p>
</div>
@endsection
