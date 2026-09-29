<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    public function index()
    {
        return view('admin.gallery.index', [
            'items' => GalleryItem::query()->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function create()
    {
        return view('admin.gallery.form', ['item' => new GalleryItem(['sort_order' => 0])]);
    }

    public function store(Request $request)
    {
        $data = $this->validated($request);
        $data['image'] = $request->file('image')->store('gallery', 'public');
        GalleryItem::query()->create($data);

        return redirect()->route('admin.gallery.index')->with('status', 'Foto adicionada.');
    }

    public function edit(GalleryItem $item)
    {
        return view('admin.gallery.form', ['item' => $item]);
    }

    public function update(Request $request, GalleryItem $item)
    {
        $data = $this->validated($request, true);
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('gallery', 'public');
        }
        $item->update($data);

        return redirect()->route('admin.gallery.index')->with('status', 'Foto atualizada.');
    }

    public function destroy(GalleryItem $item)
    {
        $item->delete();

        return redirect()->route('admin.gallery.index')->with('status', 'Foto removida.');
    }

    private function validated(Request $request, bool $imageOptional = false): array
    {
        $data = $request->validate([
            'alt' => ['required', 'string', 'max:180'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'image' => [$imageOptional ? 'nullable' : 'required', 'image', 'max:8192'],
        ]);

        return [
            'alt' => $data['alt'],
            'sort_order' => (int) ($data['sort_order'] ?? 0),
        ];
    }
}
