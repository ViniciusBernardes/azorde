<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class CorreiosFreight
{
    private const NAMES = [
        '03298' => 'PAC',
        '03220' => 'SEDEX',
        '03158' => 'PAC',
        '03140' => 'SEDEX',
        '04014' => 'SEDEX',
        '04510' => 'PAC',
        '04227' => 'Mini Envios',
    ];

    public function quote(string $destinationCep, array $items): array
    {
        $origin = $this->digits(Setting::getValue('cep_origem'));
        $user = trim(Setting::getValue('correios_usuario'));
        $password = Setting::getValue('correios_codigo');
        $card = trim(Setting::getValue('correios_cartao'));
        $services = $this->services();

        if (strlen($origin) !== 8 || $user === '' || $password === '' || $card === '' || $services === []) {
            throw new RuntimeException('Configure CEP de origem, usuário, código de acesso e cartão de postagem dos Correios no painel.');
        }

        if (strlen($destinationCep) !== 8) {
            throw new RuntimeException('Informe um CEP de destino com 8 números.');
        }

        $package = $this->package($items);
        $token = $this->token($user, $password, $card);
        $quotes = [];

        foreach ($services as $index => $code) {
            $price = $this->price($token, $code, $origin, $destinationCep, $package, (string) ($index + 1));
            $deadline = $this->deadline($token, $code, $origin, $destinationCep);
            if ($price === null) {
                continue;
            }
            $quotes[] = [
                'code' => $code,
                'name' => self::NAMES[$code] ?? 'Correios '.$code,
                'price' => $price['cents'],
                'days' => $deadline,
            ];
        }

        if ($quotes === []) {
            throw new RuntimeException('Os Correios não retornaram um frete para este CEP.');
        }

        return $quotes;
    }

    private function token(string $user, string $password, string $card): string
    {
        $key = 'correios-token-'.md5($user.'|'.$card);

        return Cache::remember($key, now()->addMinutes(20), function () use ($user, $password, $card) {
            $response = Http::withBasicAuth($user, $password)
                ->acceptJson()
                ->timeout(20)
                ->post('https://api.correios.com.br/token/v1/autentica/cartaopostagem', [
                    'numero' => $card,
                ]);

            $token = $response->json('token');
            if (! $response->successful() || ! is_string($token) || $token === '') {
                throw new RuntimeException($this->message($response->json(), 'Não foi possível autenticar nos Correios. Confira usuário, código de acesso e cartão de postagem.'));
            }

            return $token;
        });
    }

    private function price(string $token, string $code, string $origin, string $destination, array $package, string $requestId): ?array
    {
        $response = Http::withToken($token)
            ->acceptJson()
            ->timeout(20)
            ->post('https://api.correios.com.br/preco/v1/nacional', [
                'idLote' => '1',
                'parametrosProduto' => [[
                    'coProduto' => $code,
                    'nuRequisicao' => $requestId,
                    'cepOrigem' => $origin,
                    'cepDestino' => $destination,
                    'psObjeto' => (string) $package['weight'],
                    'tpObjeto' => '2',
                    'comprimento' => (string) $package['length'],
                    'largura' => (string) $package['width'],
                    'altura' => (string) $package['height'],
                ]],
            ]);

        $row = $response->json('0') ?? $response->json();
        if (is_array($row) && isset($row[0])) {
            $row = $row[0];
        }
        if (! is_array($row)) {
            return null;
        }

        $raw = $row['pcFinal'] ?? $row['pcProduto'] ?? null;
        $cents = $this->moneyToCents(is_string($raw) ? $raw : null);
        if ($cents === null) {
            return null;
        }

        return ['cents' => $cents];
    }

    private function deadline(string $token, string $code, string $origin, string $destination): ?int
    {
        $response = Http::withToken($token)
            ->acceptJson()
            ->timeout(20)
            ->get("https://api.correios.com.br/prazo/v1/nacional/{$code}", [
                'cepOrigem' => $origin,
                'cepDestino' => $destination,
            ]);

        $days = $response->json('prazoEntrega');
        if (! is_numeric($days)) {
            return null;
        }

        return (int) $days;
    }

    private function package(array $items): array
    {
        $defaultWeight = max(100, (int) Setting::getValue('peso_padrao_gramas', '800'));
        $ids = collect($items)->pluck('id')->map(fn ($id) => (int) $id)->all();
        $weights = Product::query()->whereIn('id', $ids)->pluck('weight_grams', 'id');
        $grams = 0;
        $quantity = 0;

        foreach ($items as $item) {
            $qty = max(1, (int) ($item['qty'] ?? 1));
            $quantity += $qty;
            $own = $weights[(int) $item['id']] ?? null;
            $grams += $qty * (is_numeric($own) && (int) $own > 0 ? (int) $own : $defaultWeight);
        }

        $length = $this->clamp((int) Setting::getValue('caixa_comprimento', '20'), 16, 100);
        $width = $this->clamp((int) Setting::getValue('caixa_largura', '16'), 11, 100);
        $height = $this->clamp((int) Setting::getValue('caixa_altura', '10') + max(0, $quantity - 1) * 4, 2, 100);

        return [
            'weight' => max(300, $grams),
            'length' => $length,
            'width' => $width,
            'height' => $height,
        ];
    }

    private function services(): array
    {
        $raw = Setting::getValue('correios_servicos', '03298,03220');

        return array_values(array_filter(array_map(function (string $code) {
            return preg_replace('/\D/', '', $code) ?? '';
        }, explode(',', $raw))));
    }

    private function digits(string $value): string
    {
        return preg_replace('/\D/', '', $value) ?? '';
    }

    private function clamp(int $value, int $min, int $max): int
    {
        return max($min, min($max, $value));
    }

    private function moneyToCents(?string $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }
        $normalized = str_replace(['.', ' '], '', $value);
        $normalized = str_replace(',', '.', $normalized);
        if (! is_numeric($normalized)) {
            return null;
        }

        return (int) round(((float) $normalized) * 100);
    }

    private function message(mixed $json, string $fallback): string
    {
        if (is_array($json)) {
            $text = $json['msgs'][0] ?? $json['mensagem'] ?? $json['message'] ?? null;
            if (is_string($text) && $text !== '') {
                return $text;
            }
        }

        return $fallback;
    }
}
