<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockIn extends Model
{
    use HasFactory;

    protected $table = 'stock_in';

    protected $fillable = [
        'product_id',
        'user_id',
        'quantity',
        'modal_price',
        'category',
        'date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity'    => 'integer',
            'modal_price' => 'integer',
            'date'        => 'date',
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

    public function finance()
    {
        return $this->hasOne(Finance::class, 'stock_in_id');
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Total nilai modal dari stok masuk ini
     */
    public function getTotalModalAttribute(): int
    {
        return $this->quantity * $this->modal_price;
    }
}
