@extends('admin.layout')
@section('title', 'Conteúdo')
@section('content')
<div class="page-head">
    <div>
        <h1>Conteúdo do site</h1>
        <p class="lead">O que aparece na página inicial, no contato e no desconto do Pix. Salve uma vez ao terminar.</p>
    </div>
</div>
<form method="post" enctype="multipart/form-data" action="{{ route('admin.settings.update') }}">
    @csrf
    @method('put')
    @php
        $groups = [
            'Topo e rodapé' => ['announce', 'footer_tagline', 'pix_percent'],
            'Sobre o ateliê' => ['about_eyebrow', 'about_title', 'about_text', 'about_image'],
            'Processo' => ['process_title', 'process_lead', 'process_image'],
            'Faixa da mesa' => ['band_eyebrow', 'band_title', 'band_text', 'band_image', 'quote_image'],
            'Galeria' => ['gallery_title', 'gallery_lead'],
            'Contato' => ['contact_eyebrow', 'contact_title', 'contact_text', 'address', 'email', 'instagram', 'hours', 'whatsapp'],
            'Frete — Melhor Envio' => [
                'main' => ['frete_aproximado', 'cep_origem', 'melhor_envio_token', 'melhor_envio_servicos'],
                'defaults' => ['peso_padrao_gramas', 'caixa_comprimento', 'caixa_largura', 'caixa_altura'],
            ],
        ];
    @endphp
    @foreach ($groups as $title => $keys)
        <section class="card">
            <h2>{{ $title }}</h2>
            @if ($title === 'Frete — Melhor Envio')
                <p class="hint">Token e CEP alimentam a cotação no carrinho. Peso e caixa padrão só entram quando a peça não tem medida própria em Produtos.</p>
                @foreach ($keys['main'] as $key)
                    @php [$label, $type] = $fields[$key]; @endphp
                    <label for="{{ $key }}">{{ $label }}</label>
                    @if ($type === 'secret')
                        <input id="{{ $key }}" name="{{ $key }}" type="password" value="" autocomplete="new-password" placeholder="Deixe em branco para manter o atual">
                    @else
                        <input id="{{ $key }}" name="{{ $key }}" type="text" value="{{ old($key, $values[$key] ?? '') }}">
                    @endif
                @endforeach
                <p class="hint" style="margin-top:1rem">Fallback quando o produto não tem peso/volume cadastrado:</p>
                <div class="field-grid field-grid--4">
                    @foreach ($keys['defaults'] as $key)
                        @php [$label, $type] = $fields[$key]; @endphp
                        <div>
                            <label for="{{ $key }}">{{ $label }}</label>
                            <input id="{{ $key }}" name="{{ $key }}" type="text" value="{{ old($key, $values[$key] ?? '') }}">
                        </div>
                    @endforeach
                </div>
            @else
                @foreach ($keys as $key)
                    @php [$label, $type] = $fields[$key]; @endphp
                    <label for="{{ $key }}">{{ $label }}</label>
                    @if ($type === 'textarea')
                        <textarea id="{{ $key }}" name="{{ $key }}">{{ old($key, $values[$key] ?? '') }}</textarea>
                    @elseif ($type === 'secret')
                        <input id="{{ $key }}" name="{{ $key }}" type="password" value="" autocomplete="new-password" placeholder="Deixe em branco para manter o atual">
                    @elseif ($type === 'image')
                        @php $preview = \App\Models\Setting::publicUrl($values[$key] ?? ''); @endphp
                        @if ($preview)
                            <img class="content-preview" src="{{ $preview }}" alt="{{ $label }}">
                        @endif
                        <input id="{{ $key }}" name="{{ $key }}" type="file" accept="image/*">
                        <p class="hint">Deixe em branco para manter a foto atual.</p>
                        @error($key)<p class="error">{{ $message }}</p>@enderror
                    @else
                        <input id="{{ $key }}" name="{{ $key }}" type="text" value="{{ old($key, $values[$key] ?? '') }}">
                    @endif
                @endforeach
            @endif
        </section>
    @endforeach
    <div class="form-actions">
        <button type="submit">Salvar conteúdo</button>
    </div>
</form>
@endsection
