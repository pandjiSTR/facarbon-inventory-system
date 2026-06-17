<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * GET /api/products
     * List semua produk dengan filter & search
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::query();

        // Filter
        if ($request->filled('carbon_type')) {
            $query->where('carbon_type', $request->carbon_type);
        }
        if ($request->filled('vespa_compatibility')) {
            $query->where('vespa_compatibility', 'like', '%' . $request->vespa_compatibility . '%');
        }
        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN));
        }
        if ($request->filled('out_of_stock')) {
            $query->where('current_stock', 0);
        }

        // Search by nama atau SKU
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('sku', 'like', '%' . $request->search . '%');
            });
        }

        $products = $query->orderBy('sku')->get();

        return response()->json([
            'success' => true,
            'data'    => $products,
            'meta'    => [
                'total'         => $products->count(),
                'out_of_stock'  => $products->where('current_stock', 0)->count(),
            ],
        ]);
    }

    /**
     * POST /api/products
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sku'                 => 'required|string|max:20|unique:products,sku',
            'name'                => 'required|string|max:255',
            'carbon_type'         => 'required|in:forged,twill',
            'vespa_compatibility' => 'required|array|min:1',
            'vespa_compatibility.*' => 'string',
            'modal_price'         => 'required|integer|min:0',
            'reseller_price'      => 'required|integer|min:0',
            'online_price'        => 'nullable|integer|min:0',
            'current_stock'       => 'integer|min:0',
            'is_active'           => 'boolean',
            'photo'               => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('products', 'public');
        }

        $product = Product::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil ditambahkan.',
            'data'    => $product,
        ], 201);
    }

    /**
     * GET /api/products/{id}
     */
    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => $product->load(['stockIns' => fn($q) => $q->latest()->limit(5),
                                         'stockOuts' => fn($q) => $q->latest()->limit(5)]),
        ]);
    }

    /**
     * PUT /api/products/{id}
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'sku'                 => 'sometimes|string|max:20|unique:products,sku,' . $product->id,
            'name'                => 'sometimes|string|max:255',
            'carbon_type'         => 'sometimes|in:forged,twill',
            'vespa_compatibility' => 'sometimes|array|min:1',
            'vespa_compatibility.*' => 'string',
            'modal_price'         => 'sometimes|integer|min:0',
            'reseller_price'      => 'sometimes|integer|min:0',
            'online_price'        => 'nullable|integer|min:0',
            'is_active'           => 'boolean',
            'photo'               => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($request->hasFile('photo')) {
            // Hapus foto lama
            if ($product->photo) {
                Storage::disk('public')->delete($product->photo);
            }
            $validated['photo'] = $request->file('photo')->store('products', 'public');
        }

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil diperbarui.',
            'data'    => $product->fresh(),
        ]);
    }

    /**
     * DELETE /api/products/{id}
     */
    public function destroy(Product $product): JsonResponse
    {
        if ($product->current_stock > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak bisa dihapus karena masih ada stok.',
            ], 422);
        }

        $product->delete(); // soft delete

        return response()->json([
            'success' => true,
            'message' => 'Produk berhasil dihapus.',
        ]);
    }

    /**
     * PATCH /api/products/{id}/toggle-active
     */
    public function toggleActive(Product $product): JsonResponse
    {
        $product->update(['is_active' => ! $product->is_active]);

        return response()->json([
            'success' => true,
            'message' => 'Status produk berhasil diubah.',
            'data'    => ['is_active' => $product->is_active],
        ]);
    }

    /**
     * GET /api/products/{id}/stock-history
     */
    public function stockHistory(Product $product): JsonResponse
    {
        $stockIns  = $product->stockIns()->with('user:id,name')->orderByDesc('date')->get();
        $stockOuts = $product->stockOuts()->with('user:id,name')->orderByDesc('date')->get();

        return response()->json([
            'success' => true,
            'data'    => [
                'product'    => $product->only(['id', 'sku', 'name', 'current_stock']),
                'stock_in'   => $stockIns,
                'stock_out'  => $stockOuts,
                'total_in'   => $stockIns->sum('quantity'),
                'total_out'  => $stockOuts->sum('quantity'),
            ],
        ]);
    }
}
