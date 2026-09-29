<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\SiteFields;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function edit()
    {
        return view('admin.settings', [
            'fields' => SiteFields::all(),
            'values' => Setting::map(),
        ]);
    }

    public function update(Request $request)
    {
        $imageRules = [];
        foreach (SiteFields::images() as $key) {
            $imageRules[$key] = ['nullable', 'image', 'max:8192'];
        }
        $request->validate($imageRules);

        foreach (array_keys(SiteFields::all()) as $key) {
            if (in_array($key, SiteFields::images(), true)) {
                if ($request->hasFile($key)) {
                    Setting::put($key, $request->file($key)->store('content', 'public'));
                }
                continue;
            }

            if (in_array($key, SiteFields::secrets(), true) && trim($request->string($key)->toString()) === '') {
                continue;
            }

            Setting::put($key, $request->string($key)->toString());
        }

        return back()->with('status', 'Conteúdo do site atualizado.');
    }
}
