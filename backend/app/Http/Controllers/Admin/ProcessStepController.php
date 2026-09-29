<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProcessStep;
use Illuminate\Http\Request;

class ProcessStepController extends Controller
{
    public function index()
    {
        return view('admin.steps.index', [
            'steps' => ProcessStep::query()->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function create()
    {
        return view('admin.steps.form', ['step' => new ProcessStep(['sort_order' => 0])]);
    }

    public function store(Request $request)
    {
        ProcessStep::query()->create($this->validated($request));

        return redirect()->route('admin.steps.index')->with('status', 'Etapa criada.');
    }

    public function edit(ProcessStep $step)
    {
        return view('admin.steps.form', ['step' => $step]);
    }

    public function update(Request $request, ProcessStep $step)
    {
        $step->update($this->validated($request));

        return redirect()->route('admin.steps.index')->with('status', 'Etapa atualizada.');
    }

    public function destroy(ProcessStep $step)
    {
        $step->delete();

        return redirect()->route('admin.steps.index')->with('status', 'Etapa removida.');
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'label' => ['required', 'string', 'max:8'],
            'title' => ['required', 'string', 'max:80'],
            'body' => ['required', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);
        $data['sort_order'] = (int) ($data['sort_order'] ?? 0);

        return $data;
    }
}
