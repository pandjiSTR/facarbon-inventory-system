<?php

namespace Tests\Unit\Models;

use App\Models\Invoice;
use App\Models\StockIn;
use App\Models\StockOut;
use App\Models\Finance;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    public function test_is_admin_returns_true_for_admin_role(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->assertTrue($user->isAdmin());
    }

    public function test_is_admin_returns_false_for_staff_role(): void
    {
        $user = User::factory()->create(['role' => 'staff']);

        $this->assertFalse($user->isAdmin());
    }

    public function test_password_is_hashed_automaticall(): void
    {
        $user = User::factory()->create(['password' => 'plain-text']);

        $this->assertNotEquals('plain-text', $user->password);
        $this->assertTrue(Hash::check('plain-text', $user->password));
    }

    public function test_has_many_stock_ins(): void
    {
        $user = User::factory()->create();
        StockIn::factory()->count(2)->create(['user_id' => $user->id]);

        $this->assertCount(2, $user->stockIns);
    }

    public function test_has_many_stock_outs(): void
    {
        $user = User::factory()->create();
        StockOut::factory()->count(2)->create(['user_id' => $user->id]);

        $this->assertCount(2, $user->stockOuts);
    }

    public function test_has_many_finances(): void
    {
        $user = User::factory()->create();
        Finance::create(['user_id' => $user->id, 'date' => now()->format('Y-m-d'), 'description' => 'Test', 'category' => 'operasional', 'type' => 'debit', 'amount' => 10000]);
        Finance::create(['user_id' => $user->id, 'date' => now()->format('Y-m-d'), 'description' => 'Test', 'category' => 'penjualan', 'type' => 'kredit', 'amount' => 20000]);

        $this->assertCount(2, $user->finances);
    }

    public function test_is_active_is_cast_to_boolean(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $this->assertTrue($user->is_active);
        $this->assertIsBool($user->is_active);
    }
}
