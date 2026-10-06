<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Setting;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class MelhorEnvioFreight
{
    public function quote(string $destinationCep, array $items): array
    {
        $origin = $this->digits(Setting::getValue('cep_origem'));
        $token = trim(Setting::getValue('melhor_envio_token'));
        $services = trim(Setting::getValue('melhor_envio_servicos', '1,2'));

        if (strlen($origin) !== 8 || $token === '') {
            throw new RuntimeException('Configure o CEP de origem e o token do Melhor Envio no painel.');
        }

        if (strlen($destinationCep) !== 8) {
            throw new RuntimeException('Informe um CEP de destino com 8 números.');
        }

        $products = $this->products($items);
        if ($products === []) {
            throw new RuntimeException('Nenhum produto válido para calcular o frete.');
        }

        $response = Http::withToken($token)
            ->acceptJson()
            ->asJson()
            ->withHeaders([
                'User-Agent' => 'AZORDE Estudio (azorde.estudio@gmail.com)',
            ])
            ->timeout(25)
            ->post('https://melhorenvio.com.br/api/v2/me/shipment/calculate', [
                'from' => ['postal_code' => $origin],
                'to' => ['postal_code' => $destinationCep],
                'products' => $products,
                'options' => [
                    'receipt' => false,
                    'own_hand' => false,
                ],
                'services' => $services !== '' ? $services : '1,2',
            ]);

        if ($response->status() === 401 || $response->status() === 403) {
            throw new RuntimeException('Token do Melhor Envio inválido ou expirado. Gere outro no painel do Melhor Envio.');
        }

        if (! $response->successful()) {
            throw new RuntimeException($this->message($response->json(), 'Não foi possível calcular o frete no Melhor Envio.'));
        }

        $rows = $response->json();
        if (! is_array($rows)) {
            throw new RuntimeException('A resposta do Melhor Envio veio em formato inesperado.');
        }

        $quotes = [];
        foreach ($rows as $row) {
            if (! is_array($row) || ! empty($row['error'])) {
                continue;
            }

            $price = $row['custom_price'] ?? $row['price'] ?? null;
            if ($price === null || $price === '' || ! is_numeric($price)) {
                continue;
            }

            $company = is_array($row['company'] ?? null) ? ($row['company']['name'] ?? '') : '';
            $service = (string) ($row['name'] ?? 'Frete');
            $name = trim($company !== '' ? $company.' · '.$service : $service);
            $days = $row['custom_delivery_time'] ?? $row['delivery_time'] ?? null;

            $quotes[] = [
                'code' => (string) ($row['id'] ?? $name),
                'name' => $name !== '' ? $name : 'Frete',
                'price' => (int) round(((float) $price) * 100),
                'days' => is_numeric($days) ? (int) $days : null,
            ];
        }

        if ($quotes === []) {
            throw new RuntimeException('Nenhuma opção de frete disponível para este CEP.');
        }

        usort($quotes, fn (array $a, array $b) => $a['price'] <=> $b['price']);

        return $quotes;
    }

    private function products(array $items): array
    {
        $defaultWeight = max(100, (int) Setting::getValue('peso_padrao_gramas', '800'));
        $defaultLength = $this->clamp((int) Setting::getValue('caixa_comprimento', '20'), 11, 100);
        $defaultWidth = $this->clamp((int) Setting::getValue('caixa_largura', '16'), 11, 100);
        $defaultHeight = $this->clamp((int) Setting::getValue('caixa_altura', '10'), 2, 100);

        $ids = collect($items)->pluck('id')->map(fn ($id) => (int) $id)->all();
        $catalog = Product::query()->whereIn('id', $ids)->get()->keyBy('id');
        $products = [];

        foreach ($items as $item) {
            $id = (int) ($item['id'] ?? 0);
            $qty = max(1, (int) ($item['qty'] ?? 1));
            $product = $catalog->get($id);
            if (! $product) {
                continue;
            }

            $grams = is_numeric($product->weight_grams) && (int) $product->weight_grams > 0
                ? (int) $product->weight_grams
                : $defaultWeight;

            $products[] = [
                'id' => (string) $product->id,
                'width' => $this->clamp((int) ($product->width_cm ?: $defaultWidth), 11, 100),
                'height' => $this->clamp((int) ($product->height_cm ?: $defaultHeight), 2, 100),
                'length' => $this->clamp((int) ($product->length_cm ?: $defaultLength), 11, 100),
                'weight' => max(0.3, round($grams / 1000, 3)),
                'insurance_value' => round(max(1, $product->price_cents) / 100, 2),
                'quantity' => $qty,
            ];
        }

        return $products;
    }

    private function digits(string $value): string
    {
        return preg_replace('/\D/', '', $value) ?? '';
    }

    private function clamp(int $value, int $min, int $max): int
    {
        return max($min, min($max, $value));
    }

    private function message(mixed $json, string $fallback): string
    {
        if (is_array($json)) {
            $text = $json['message'] ?? $json['error'] ?? $json['mensagem'] ?? null;
            if (is_string($text) && $text !== '') {
                return $text;
            }
            if (isset($json[0]) && is_string($json[0])) {
                return $json[0];
            }
        }

        return $fallback;
    }
}
