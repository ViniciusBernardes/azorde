<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\CustomerNotice;
use App\Models\Favorite;
use App\Models\Order;
use App\Models\OrderEvent;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccountController extends Controller
{
    public function me(Request $request)
    {
        $user = $request->user();
        if (! $user || $user->is_admin) {
            return response()->json(['user' => null, 'csrf' => csrf_token(), 'favorites' => []]);
        }

        return response()->json([
            'user' => ['name' => $user->name],
            'csrf' => csrf_token(),
            'unread' => $user->notices()->whereNull('read_at')->count(),
            'favorites' => $user->favorites()->pluck('product_id'),
        ]);
    }

    public function home(Request $request)
    {
        $user = $request->user();

        return view('account.home', [
            'orders' => $user->orders()->latest()->take(4)->get(),
            'unread' => $user->notices()->whereNull('read_at')->count(),
            'favorites' => $user->favorites()->count(),
        ]);
    }

    public function orders(Request $request)
    {
        return view('account.orders', [
            'orders' => $request->user()->orders()->latest()->get(),
        ]);
    }

    public function show(Request $request, Order $order)
    {
        abort_unless($order->user_id === $request->user()->id, 403);
        $order->load('items', 'events');

        return view('account.order', ['order' => $order]);
    }

    public function checkoutForm()
    {
        return view('account.checkout');
    }

    public function checkout(Request $request)
    {
        $data = $request->validate([
            'cep' => ['required', 'string'],
            'address' => ['required', 'string', 'max:180'],
            'phone' => ['required', 'string', 'max:20'],
            'shipping_name' => ['nullable', 'string', 'max:40'],
            'shipping_cents' => ['nullable', 'integer', 'min:0'],
            'shipping_days' => ['nullable', 'integer', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'integer'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        $products = Product::query()->where('active', true)->whereIn('id', collect($data['items'])->pluck('id'))->get()->keyBy('id');
        if ($products->isEmpty()) {
            return back()->withErrors(['items' => 'Nenhuma peça válida no carrinho.']);
        }

        $order = DB::transaction(function () use ($request, $data, $products) {
            $subtotal = 0;
            $lines = [];
            foreach ($data['items'] as $item) {
                $product = $products->get((int) $item['id']);
                if (! $product) {
                    continue;
                }
                $qty = (int) $item['qty'];
                $subtotal += $product->price_cents * $qty;
                $lines[] = compact('product', 'qty');
            }

            $shipping = (int) ($data['shipping_cents'] ?? 0);
            $order = Order::query()->create([
                'user_id' => $request->user()->id,
                'number' => 'TMP',
                'status' => 'received',
                'subtotal_cents' => $subtotal,
                'shipping_cents' => $shipping,
                'shipping_name' => $data['shipping_name'] ?? null,
                'shipping_days' => $data['shipping_days'] ?? null,
                'cep' => preg_replace('/\D/', '', $data['cep']),
                'address' => $data['address'],
                'phone' => $data['phone'],
            ]);
            $order->update(['number' => 'AZ-'.str_pad((string) $order->id, 5, '0', STR_PAD_LEFT)]);

            foreach ($lines as $line) {
                OrderItem::query()->create([
                    'order_id' => $order->id,
                    'product_id' => $line['product']->id,
                    'name' => $line['product']->name,
                    'image' => $line['product']->imageUrl(),
                    'unit_price_cents' => $line['product']->price_cents,
                    'qty' => $line['qty'],
                ]);
            }

            $message = 'Recebemos o pedido '.$order->number.'.';
            OrderEvent::query()->create([
                'order_id' => $order->id,
                'status' => 'received',
                'message' => $message,
            ]);
            CustomerNotice::query()->create([
                'user_id' => $order->user_id,
                'order_id' => $order->id,
                'title' => 'Pedido recebido',
                'body' => $message,
            ]);

            $request->user()->forceFill([
                'phone' => $data['phone'],
                'cep' => preg_replace('/\D/', '', $data['cep']),
                'address' => $data['address'],
            ])->save();

            return $order;
        });

        return redirect()->route('account.orders.show', $order)->with('status', 'Pedido '.$order->number.' registrado.')->with('clear_cart', true);
    }

    public function favorites(Request $request)
    {
        $items = $request->user()->favorites()->with('product')->latest()->get();

        return view('account.favorites', ['items' => $items]);
    }

    public function toggleFavorite(Request $request, Product $product)
    {
        $existing = Favorite::query()->where('user_id', $request->user()->id)->where('product_id', $product->id)->first();
        if ($existing) {
            $existing->delete();
        } else {
            Favorite::query()->create(['user_id' => $request->user()->id, 'product_id' => $product->id]);
        }

        if ($request->expectsJson()) {
            return response()->json(['favorite' => $existing === null]);
        }

        return back();
    }

    public function notices(Request $request)
    {
        $notices = $request->user()->notices()->latest()->get();
        $request->user()->notices()->whereNull('read_at')->update(['read_at' => now()]);

        return view('account.notices', ['notices' => $notices]);
    }

    public function profile(Request $request)
    {
        return view('account.profile', ['user' => $request->user()]);
    }

    public function updateProfile(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:20'],
            'cep' => ['nullable', 'string', 'max:9'],
            'address' => ['nullable', 'string', 'max:180'],
        ]);
        $data['cep'] = preg_replace('/\D/', '', (string) ($data['cep'] ?? ''));
        $request->user()->update($data);

        return back()->with('status', 'Dados atualizados.');
    }
}
