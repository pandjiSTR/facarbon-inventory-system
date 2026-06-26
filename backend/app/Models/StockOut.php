<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockOut extends Model
{
    protected $table = 'stock_out';

    protected $fillable = [
        'product_id',
        'user_id',
        'quantity',
        'channel',
        'sell_price',
        'invoice_id',
        'date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity'   => 'integer',
            'sell_price' => 'integer',
            'date'       => 'date',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function finance()
    {
        return $this->hasOne(Finance::class, 'stock_out_id');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    public function getTotalRevenueAttribute(): int
    {
        return $this->quantity * $this->sell_price;
    }
}
