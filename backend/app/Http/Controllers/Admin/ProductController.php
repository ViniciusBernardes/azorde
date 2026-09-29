<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index()
    {
        return view('admin.products.index', [
            'products' => Product::query()->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function create()
    {
        return view('admin.products.form', ['product' => new Product(['active' => true, 'sort_order' => 0])]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['image'] = $request->file('image')->store('products', 'public');
        $data['slug'] = $this->uniqueSlug($data['name']);

        Product::query()->create($data);

        return redirect()->route('admin.products.index')->with('status', 'Produto criado.');
    }

    public function edit(Product $product)
    {
        return view('admin.products.form', ['product' => $product]);
    }

    public function update(Request $request, Product $product)
    {
        $data = $this->validated($request, $product->exists);
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }
        if ($product->name !== $data['name']) {
            $data['slug'] = $this->uniqueSlug($data['name'], $product->id);
        }

        $product->update($data);

        return redirect()->route('admin.products.index')->with('status', 'Produto atualizado.');
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('admin.products.index')->with('status', 'Produto removido.');
    }

    private function validated(Request $request, bool $imageOptional = false): array
    {
        $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0'],
            'weight_grams' => ['nullable', 'integer', 'min:1', 'max:30000'],
            'alt' => ['nullable', 'string', 'max:180'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'image' => [$imageOptional ? 'nullable' : 'required', 'image', 'max:8192'],
        ]);

        return [
            'name' => $request->string('name')->toString(),
            'description' => $request->string('description')->toString(),
            'price_cents' => (int) round(((float) $request->input('price')) * 100),
            'weight_grams' => $request->filled('weight_grams') ? (int) $request->input('weight_grams') : null,
            'alt' => $request->string('alt')->toString(),
            'sort_order' => (int) $request->input('sort_order', 0),
            'active' => $request->boolean('active'),
            'featured' => $request->boolean('featured'),
        ];
    }

    private function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name) ?: 'peca';
        $slug = $base;
        $i = 2;

        while (Product::query()->where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.$i;
            $i++;
        }

        return $slug;
    }
}
