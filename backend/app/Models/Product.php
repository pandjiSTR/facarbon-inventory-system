<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sku',
        'name',
        'carbon_type',
        'vespa_compatibility',
        'modal_price',
        'reseller_price',
        'online_price',
        'current_stock',
        'photo',
        'is_active',
    ];

    protected $appends = ['photo_url'];

    protected function casts(): array
    {
        return [
            'modal_price'         => 'integer',
            'reseller_price'      => 'integer',
            'online_price'        => 'integer',
            'current_stock'       => 'integer',
            'is_active'           => 'boolean',
            'vespa_compatibility' => 'array',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function stockIns()
    {
        return $this->hasMany(StockIn::class);
    }

    public function stockOuts()
    {
        return $this->hasMany(StockOut::class);
    }

    public function invoiceItems()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Hitung ulang current_stock dari total stock_in - total stock_out
     * Dipanggil otomatis setelah ada perubahan stok
     */
    public function recalculateStock(): void
    {
        $totalIn  = $this->stockIns()->sum('quantity');
        $totalOut = $this->stockOuts()->sum('quantity');

        $this->current_stock = max(0, $totalIn - $totalOut);
        $this->saveQuietly(); // saveQuietly agar tidak trigger event lagi
    }

    public function isOutOfStock(): bool
    {
        return $this->current_stock === 0;
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo
            ? asset('storage/' . $this->photo)
            : null;
    }
}
