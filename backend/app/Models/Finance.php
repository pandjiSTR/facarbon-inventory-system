<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Finance extends Model
{
    protected $table = 'finances';

    protected $fillable = [
        'user_id',
        'stock_in_id',
        'stock_out_id',
        'date',
        'description',
        'category',
        'type',
        'amount',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'date'   => 'date',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function stockIn()
    {
        return $this->belongsTo(StockIn::class, 'stock_in_id');
    }

    public function stockOut()
    {
        return $this->belongsTo(StockOut::class, 'stock_out_id');
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeDebit($query)
    {
        return $query->where('type', 'debit');
    }

    public function scopeKredit($query)
    {
        return $query->where('type', 'kredit');
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByDateRange($query, string $from, string $to)
    {
        return $query->whereBetween('date', [$from, $to]);
    }
}
