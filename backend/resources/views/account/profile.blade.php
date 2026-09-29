@extends('account.layout')
@section('title', 'Meus dados')
@section('content')
<h1>Meus dados</h1>
<form class="account-card" method="post" action="{{ route('account.profile.update') }}">
    @csrf @method('put')
    <label for="name">Nome</label>
    <input id="name" name="name" value="{{ old('name', $user->name) }}" required>
    <label for="phone">Telefone</label>
    <input id="phone" name="phone" value="{{ old('phone', $user->phone) }}" required>
    <label for="cep">CEP</label>
    <input id="cep" name="cep" value="{{ old('cep', $user->cep) }}">
    <label for="address">Endereço</label>
    <input id="address" name="address" value="{{ old('address', $user->address) }}">
    <div style="margin-top:1rem"><button class="btn" type="submit">Salvar</button></div>
</form>
@endsection
