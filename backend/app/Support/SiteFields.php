<?php

namespace App\Support;

class SiteFields
{
    public static function all(): array
    {
        return [
            'announce' => ['Faixa do topo', 'text'],
            'about_eyebrow' => ['Sobre — rótulo', 'text'],
            'about_title' => ['Sobre — título', 'textarea'],
            'about_text' => ['Sobre — texto', 'textarea'],
            'about_image' => ['Foto do ateliê', 'image'],
            'process_title' => ['Processo — título', 'text'],
            'process_lead' => ['Processo — chamada', 'text'],
            'process_image' => ['Foto do processo', 'image'],
            'band_eyebrow' => ['Faixa — rótulo', 'text'],
            'band_title' => ['Faixa — título', 'textarea'],
            'band_text' => ['Faixa — texto', 'textarea'],
            'band_image' => ['Foto da faixa', 'image'],
            'quote_image' => ['Foto da poesia', 'image'],
            'gallery_title' => ['Galeria — título', 'text'],
            'gallery_lead' => ['Galeria — chamada', 'text'],
            'contact_eyebrow' => ['Contato — rótulo', 'text'],
            'contact_title' => ['Contato — título', 'text'],
            'contact_text' => ['Contato — texto', 'textarea'],
            'address' => ['Endereço', 'textarea'],
            'email' => ['E-mail', 'text'],
            'instagram' => ['Instagram (URL)', 'text'],
            'hours' => ['Horário', 'text'],
            'whatsapp' => ['WhatsApp (só números, com DDD e país)', 'text'],
            'footer_tagline' => ['Frase do rodapé', 'text'],
            'pix_percent' => ['Desconto no Pix (%)', 'text'],
            'frete_aproximado' => ['Frete aproximado na vitrine (R$)', 'text'],
            'cep_origem' => ['CEP de origem (só números)', 'text'],
            'melhor_envio_token' => ['Token Melhor Envio', 'secret'],
            'melhor_envio_servicos' => ['Serviços (1=PAC, 2=SEDEX)', 'text'],
            'peso_padrao_gramas' => ['Peso padrão se a peça não tiver (g)', 'text'],
            'caixa_comprimento' => ['Caixa padrão — comprimento (cm)', 'text'],
            'caixa_largura' => ['Caixa padrão — largura (cm)', 'text'],
            'caixa_altura' => ['Caixa padrão — altura (cm)', 'text'],
        ];
    }

    public static function images(): array
    {
        return array_keys(array_filter(self::all(), fn (array $field) => $field[1] === 'image'));
    }

    public static function secrets(): array
    {
        return array_keys(array_filter(self::all(), fn (array $field) => $field[1] === 'secret'));
    }
}
