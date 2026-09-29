<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomerNotice;
use App\Models\Order;
use App\Models\OrderEvent;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function index()
    {
        return view('admin.orders.index', [
            'orders' => Order::query()->with('user')->latest()->get(),
        ]);
    }

    public function show(Order $order)
    {
        $order->load('user', 'items', 'events');

        return view('admin.orders.show', ['order' => $order, 'statuses' => Order::STATUSES]);
    }

    public function update(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(array_keys(Order::STATUSES))],
            'message' => ['nullable', 'string', 'max:500'],
            'tracking_code' => ['nullable', 'string', 'max:40'],
        ]);

        $order->status = $data['status'];
        $order->tracking_code = $data['tracking_code'] ?? $order->tracking_code;
        $order->save();

        $message = trim((string) ($data['message'] ?? ''));
        if ($message === '') {
            $message = 'Seu pedido '.$order->number.' agora está: '.$order->statusLabel().'.';
            if ($order->tracking_code) {
                $message .= ' Código de rastreio: '.$order->tracking_code.'.';
            }
        }

        OrderEvent::query()->create([
            'order_id' => $order->id,
            'status' => $order->status,
            'message' => $message,
        ]);
        CustomerNotice::query()->create([
            'user_id' => $order->user_id,
            'order_id' => $order->id,
            'title' => $order->statusLabel(),
            'body' => $message,
        ]);

        return back()->with('status', 'Status atualizado e o cliente foi avisado.');
    }
}
