<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\MelhorEnvioFreight;
use Illuminate\Http\Request;
use RuntimeException;

class FreightController extends Controller
{
    public function store(Request $request, MelhorEnvioFreight $freight)
    {
        $data = $request->validate([
            'cep' => ['required', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
        ]);

        $cep = preg_replace('/\D/', '', $data['cep']) ?? '';

        try {
            $quotes = $freight->quote($cep, $data['items']);
        } catch (RuntimeException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        return response()->json(['quotes' => $quotes]);
    }
}
