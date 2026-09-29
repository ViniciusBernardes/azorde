@extends('admin.layout')
@section('title', 'Entrar')
@section('content')
<div class="card login-card">
    <h1>Entrar no painel</h1>
    <p class="lead">Edite o site, a galeria e os produtos da loja.</p>
    <form method="post" action="{{ route('admin.login.store') }}">
        @csrf
        <label for="email">E-mail</label>
        <input id="email" name="email" type="email" value="{{ old('email', 'admin@azorde.estudio') }}" required>
        @error('email')<p class="error">{{ $message }}</p>@enderror
        <label for="password">Senha</label>
        <input id="password" name="password" type="password" required>
        <div class="row" style="margin-top: 1rem;"><button type="submit">Entrar</button></div>
    </form>
</div>
@endsection
