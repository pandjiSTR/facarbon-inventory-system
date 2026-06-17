<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'invoice_number',
        'user_id',
        'buyer_name',
        'buyer_contact',
        'date',
        'total_amount',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'integer',
            'date'         => 'date',
        ];
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function stockOuts()
    {
        return $this->hasMany(StockOut::class);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Generate nomor invoice otomatis: INV/2024/001
     */
    public static function generateNumber(): string
    {
        $year  = now()->format('Y');
        $last  = self::whereYear('created_at', $year)->count();
        $seq   = str_pad($last + 1, 3, '0', STR_PAD_LEFT);

        return "INV/{$year}/{$seq}";
    }

    /**
     * Hitung ulang total amount dari items
     */
    public function recalculateTotal(): void
    {
        $this->total_amount = $this->items()->sum('subtotal');
        $this->saveQuietly();
    }
}
