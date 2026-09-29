<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Minha conta') — AZORDE</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/styles.css">
    <style>
        .account { width: min(1040px, calc(100% - 2rem)); margin: 2rem auto 4rem; display: grid; gap: 1.5rem; }
        @media (min-width: 860px) { .account:has(.account-nav) { grid-template-columns: 220px 1fr; align-items: start; } }
        .account-nav { background: #fff; border: 1px solid var(--line); padding: 1rem; display: flex; flex-direction: column; gap: .35rem; }
        .account-nav a, .account-nav button { text-align: left; background: none; border: 0; padding: .55rem .4rem; font: inherit; color: var(--ink); cursor: pointer; text-decoration: none; }
        .account-nav a.is-active { color: var(--btn); }
        .account-card { background: #fff; border: 1px solid var(--line); padding: 1.1rem 1.2rem; margin-bottom: 1rem; }
        .account h1 { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 500; margin: 0 0 .4rem; }
        .account .lead { color: var(--muted); margin: 0 0 1rem; }
        .status-line { display: flex; justify-content: space-between; gap: 1rem; padding: .8rem 0; border-bottom: 1px solid var(--line); }
        .pill { font-size: .78rem; letter-spacing: .04em; text-transform: uppercase; color: var(--btn); }
        .timeline { list-style: none; margin: 0; padding: 0; }
        .timeline li { padding: .7rem 0; border-bottom: 1px solid var(--line); }
        .ok { background: #e7f2eb; color: #2f6b4f; padding: .7rem .9rem; margin-bottom: 1rem; }
        label { display: block; font-size: .82rem; margin: .7rem 0 .25rem; }
        input, textarea, select { width: 100%; padding: .7rem .8rem; border: 1px solid var(--line); font: inherit; }
        .error { color: #8a3b2c; font-size: .88rem; }
    </style>
</head>
<body>
    <header class="header">
        <div class="header__bar">
            <a class="brand" href="/"><img src="/assets/logo-azorde-estudio.png" alt="AZORDE Estúdio"></a>
            <nav class="nav"><ul>
                <li><a href="/">Início</a></li>
                <li><a href="/produtos/">Peças</a></li>
                <li><a href="/conta">Conta</a></li>
                <li><a href="/carrinho/">Carrinho</a></li>
            </ul></nav>
        </div>
    </header>
    <main class="account">
        @auth
        <aside class="account-nav">
            <a class="{{ request()->routeIs('account.home') ? 'is-active' : '' }}" href="{{ route('account.home') }}">Início</a>
            <a class="{{ request()->routeIs('account.orders*') ? 'is-active' : '' }}" href="{{ route('account.orders') }}">Meus pedidos</a>
            <a class="{{ request()->routeIs('account.favorites') ? 'is-active' : '' }}" href="{{ route('account.favorites') }}">Favoritos</a>
            <a class="{{ request()->routeIs('account.notices') ? 'is-active' : '' }}" href="{{ route('account.notices') }}">Avisos</a>
            <a class="{{ request()->routeIs('account.profile') ? 'is-active' : '' }}" href="{{ route('account.profile') }}">Meus dados</a>
            <form method="post" action="{{ route('account.logout') }}">@csrf<button type="submit">Sair</button></form>
        </aside>
        @endauth
        <div>
            @if (session('status'))<div class="ok">{{ session('status') }}</div>@endif
            @yield('content')
        </div>
    </main>
    @if (session('clear_cart'))
    <script>
        localStorage.removeItem("azorde-cart");
        sessionStorage.removeItem("azorde-frete");
    </script>
    @endif
</body>
</html>
