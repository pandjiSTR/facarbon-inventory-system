<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id',
        'product_id',
        'product_name',
        'product_sku',
        'quantity',
        'unit_price',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'quantity'   => 'integer',
            'unit_price' => 'integer',
            'subtotal'   => 'integer',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Hitung subtotal otomatis sebelum save
     */
    protected static function booted(): void
    {
        static::saving(function (InvoiceItem $item) {
            $item->subtotal = $item->quantity * $item->unit_price;
        });
    }
}
