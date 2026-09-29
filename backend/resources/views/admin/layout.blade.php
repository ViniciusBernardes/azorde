<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Painel') — AZORDE</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
    <style>
        :root {
            --ink: #3f3a34;
            --muted: #6f675e;
            --soft: #9a9186;
            --line: #e6dfd4;
            --bg: #f4f0ea;
            --paper: #fffcf8;
            --side: #243028;
            --side-text: #e7e1d8;
            --btn: #b5815a;
            --btn-hover: #9c6c48;
            --ok: #2f6b4f;
            --ok-bg: #e7f2eb;
            --warn: #8a5a22;
            --warn-bg: #f8efdf;
        }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: Outfit, system-ui, sans-serif; background: var(--bg); color: var(--ink); font-size: 15px; }
        a { color: inherit; }
        .shell { min-height: 100vh; display: grid; grid-template-columns: 240px 1fr; }
        .side { background: var(--side); color: var(--side-text); padding: 1.4rem 1rem 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .brand { display: flex; flex-direction: column; gap: .15rem; padding: 0 .55rem; text-decoration: none; }
        .brand strong { font-family: "Cormorant Garamond", Georgia, serif; font-size: 1.7rem; letter-spacing: .16em; font-weight: 500; }
        .brand span { font-size: .72rem; letter-spacing: .18em; text-transform: uppercase; color: #b7c2b6; }
        .side nav { display: flex; flex-direction: column; gap: .25rem; }
        .side nav a { text-decoration: none; padding: .7rem .75rem; border-radius: 8px; color: #d9d3c8; font-size: .95rem; }
        .side nav a small { display: block; margin-top: .1rem; color: #8f9b90; font-size: .75rem; font-weight: 300; }
        .side nav a.is-active, .side nav a:hover { background: rgba(255,255,255,.08); color: #fff; }
        .side-foot { margin-top: auto; display: flex; flex-direction: column; gap: .4rem; padding: 0 .35rem; }
        .side-foot a, .side-foot button { color: #d9d3c8; background: none; border: 0; padding: .35rem .2rem; text-align: left; font: inherit; cursor: pointer; text-decoration: none; }
        .workspace { min-width: 0; }
        .topbar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 1rem 1.6rem; background: rgba(255,252,248,.9); border-bottom: 1px solid var(--line); position: sticky; top: 0; }
        .topbar p { margin: 0; color: var(--muted); font-size: .88rem; }
        main { width: min(1040px, calc(100% - 2.4rem)); margin: 0 auto; padding: 1.6rem 0 3rem; }
        h1 { font-family: "Cormorant Garamond", Georgia, serif; font-weight: 500; font-size: 2.1rem; margin: 0; letter-spacing: .02em; }
        .page-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; margin-bottom: 1.1rem; flex-wrap: wrap; }
        .lead { margin: .3rem 0 0; color: var(--muted); font-weight: 300; max-width: 42rem; }
        .card, .table-card { background: var(--paper); border: 1px solid var(--line); border-radius: 12px; }
        .card { padding: 1.15rem 1.25rem 1.3rem; margin-bottom: 1rem; }
        .card h2 { margin: 0 0 .2rem; font-size: 1.05rem; font-weight: 600; }
        .card .hint { margin: 0 0 .4rem; color: var(--soft); font-size: .82rem; }
        label { display: block; font-size: .8rem; font-weight: 500; margin: .85rem 0 .3rem; color: var(--ink); }
        input[type=text], input[type=email], input[type=password], input[type=number], input[type=file], textarea {
            width: 100%; padding: .7rem .8rem; border: 1px solid var(--line); border-radius: 8px; font: inherit; background: #fff; color: var(--ink);
        }
        textarea { min-height: 6rem; resize: vertical; }
        input:focus, textarea:focus { outline: 2px solid rgba(181,129,90,.35); border-color: var(--btn); }
        .row { display: flex; gap: .55rem; flex-wrap: wrap; align-items: center; }
        button, .btn { background: var(--btn); color: #fff; border: 0; border-radius: 8px; padding: .7rem 1.05rem; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; font: inherit; font-weight: 500; }
        button:hover, .btn:hover { background: var(--btn-hover); }
        .ghost { background: transparent; color: var(--ink); border: 1px solid var(--line); }
        .ghost:hover { background: #f3eee7; }
        .link { background: none; color: var(--btn); padding: 0; border: 0; font-weight: 500; }
        .link:hover { background: none; text-decoration: underline; }
        .table-card { overflow: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: .8rem .9rem; border-bottom: 1px solid var(--line); vertical-align: middle; }
        th { font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; color: var(--soft); font-weight: 600; }
        tr:last-child td { border-bottom: 0; }
        .thumb { width: 52px; height: 68px; object-fit: cover; border-radius: 6px; background: #eee; }
        .content-preview { display: block; width: min(100%, 420px); height: 220px; object-fit: cover; border-radius: 10px; margin: .35rem 0 .55rem; background: #eee; }
        .status { background: var(--ok-bg); color: var(--ok); padding: .75rem .95rem; border-radius: 10px; margin-bottom: 1rem; }
        .error { color: #8a3b2c; font-size: .86rem; margin: .25rem 0 0; }
        .check { display: flex; gap: .5rem; align-items: center; margin-top: .85rem; font-weight: 400; }
        .check input { width: auto; }
        .badge { display: inline-block; padding: .15rem .5rem; border-radius: 999px; font-size: .75rem; background: var(--ok-bg); color: var(--ok); }
        .badge--off { background: #f3f0eb; color: var(--muted); }
        .badge--star { background: var(--warn-bg); color: var(--warn); }
        .login-shell { min-height: 100vh; display: grid; place-items: center; padding: 1.5rem; }
        .login-card { width: min(26rem, 100%); }
        .login-card h1 { margin-bottom: .35rem; }
        @media (max-width: 860px) {
            .shell { grid-template-columns: 1fr; }
            .side { padding-bottom: .8rem; }
            .side nav { flex-direction: row; overflow-x: auto; }
            .side nav a small, .side-foot { display: none; }
            .side nav a { white-space: nowrap; }
            .brand span { display: none; }
        }
    </style>
</head>
<body>
@auth
<div class="shell">
    <aside class="side">
        <a class="brand" href="{{ route('admin.home') }}">
            <strong>AZORDE</strong>
            <span>Painel</span>
        </a>
        <nav>
            <a class="{{ request()->routeIs('admin.settings.*') ? 'is-active' : '' }}" href="{{ route('admin.settings.edit') }}">Conteúdo<small>Textos e contato</small></a>
            <a class="{{ request()->routeIs('admin.orders.*') ? 'is-active' : '' }}" href="{{ route('admin.orders.index') }}">Pedidos<small>Status e avisos</small></a>
            <a class="{{ request()->routeIs('admin.products.*') ? 'is-active' : '' }}" href="{{ route('admin.products.index') }}">Produtos<small>Loja e carrinho</small></a>
            <a class="{{ request()->routeIs('admin.steps.*') ? 'is-active' : '' }}" href="{{ route('admin.steps.index') }}">Processo<small>Etapas do ofício</small></a>
            <a class="{{ request()->routeIs('admin.gallery.*') ? 'is-active' : '' }}" href="{{ route('admin.gallery.index') }}">Galeria<small>Fotos do site</small></a>
        </nav>
        <div class="side-foot">
            <a href="/" target="_blank" rel="noopener">Ver o site</a>
            <form method="post" action="{{ route('admin.logout') }}">@csrf<button type="submit">Sair</button></form>
        </div>
    </aside>
    <div class="workspace">
        <div class="topbar">
            <p>@yield('title', 'Painel')</p>
            <p>{{ auth()->user()->email }}</p>
        </div>
        <main>
            @if (session('status'))<div class="status">{{ session('status') }}</div>@endif
            @yield('content')
        </main>
    </div>
</div>
@else
<main class="login-shell">
    @if (session('status'))<div class="status">{{ session('status') }}</div>@endif
    @yield('content')
</main>
@endauth
</body>
</html>
