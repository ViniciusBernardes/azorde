@extends('account.layout')
@section('title', 'Cadastro')
@section('content')
<div class="account-card" style="max-width:28rem">
    <h1>Criar conta</h1>
    <form method="post" action="{{ route('account.register.store') }}">
        @csrf
        <label for="name">Nome</label>
        <input id="name" name="name" value="{{ old('name') }}" required>
        <label for="email">E-mail</label>
        <input id="email" type="email" name="email" value="{{ old('email') }}" required>
        @error('email')<p class="error">{{ $message }}</p>@enderror
        <label for="phone">Telefone</label>
        <input id="phone" name="phone" value="{{ old('phone') }}" required>
        <label for="password">Senha</label>
        <input id="password" type="password" name="password" required>
        <label for="password_confirmation">Confirmar senha</label>
        <input id="password_confirmation" type="password" name="password_confirmation" required>
        @error('password')<p class="error">{{ $message }}</p>@enderror
        <div style="margin-top:1rem"><button class="btn" type="submit">Cadastrar</button></div>
    </form>
    <p class="lead" style="margin-top:1rem"><a href="{{ route('account.login') }}">Já tenho conta</a></p>
</div>
@endsection
