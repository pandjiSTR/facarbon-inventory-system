<?php

namespace Tests\Feature\Api;

use App\Models\Finance;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FinanceApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
        $this->token = $this->user->createToken('test')->plainTextToken;
    }

    public function test_creates_debit_finance_record(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/finances', [
                'date'        => now()->format('Y-m-d'),
                'description' => 'Biaya operasional bulanan',
                'category'    => 'operasional',
                'type'        => 'debit',
                'amount'      => 150000,
                'notes'       => 'Pembelian alat kebersihan',
            ]);

        $response->assertCreated()
            ->assertJsonStructure(['success', 'data', 'message'])
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('finances', [
            'id'          => $response->json('data.id'),
            'user_id'     => $this->user->id,
            'type'        => 'debit',
            'amount'      => 150000,
            'category'    => 'operasional',
        ]);
    }

    public function test_creates_kredit_finance_record(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/finances', [
                'date'        => now()->format('Y-m-d'),
                'description' => 'Pendapatan jasa',
                'category'    => 'lain_lain',
                'type'        => 'kredit',
                'amount'      => 500000,
            ]);

        $response->assertCreated()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('finances', [
            'id'       => $response->json('data.id'),
            'type'     => 'kredit',
            'amount'   => 500000,
        ]);
    }

    public function test_lists_all_finance_records(): void
    {
        Finance::create(['user_id' => $this->user->id, 'date' => now()->format('Y-m-d'), 'description' => 'A', 'category' => 'operasional', 'type' => 'debit', 'amount' => 10000]);
        Finance::create(['user_id' => $this->user->id, 'date' => now()->format('Y-m-d'), 'description' => 'B', 'category' => 'penjualan', 'type' => 'kredit', 'amount' => 20000]);
        Finance::create(['user_id' => $this->user->id, 'date' => now()->format('Y-m-d'), 'description' => 'C', 'category' => 'operasional', 'type' => 'debit', 'amount' => 30000]);

        $response = $this->withToken($this->token)
            ->getJson('/api/finances');

        $response->assertOk()
            ->assertJsonStructure(['success', 'data', 'meta' => ['total_kredit', 'total_debit', 'saldo']])
            ->assertJsonCount(3, 'data');
    }

    public function test_filters_finance_by_type(): void
    {
        Finance::create(['user_id' => $this->user->id, 'date' => now()->format('Y-m-d'), 'description' => 'Debit', 'category' => 'operasional', 'type' => 'debit', 'amount' => 100000]);
        Finance::create(['user_id' => $this->user->id, 'date' => now()->format('Y-m-d'), 'description' => 'Kredit', 'category' => 'penjualan', 'type' => 'kredit', 'amount' => 200000]);

        $response = $this->withToken($this->token)
            ->getJson('/api/finances?type=debit');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'debit');
    }

    public function test_filters_finance_by_category(): void
    {
        Finance::create(['user_id' => $this->user->id, 'date' => now()->format('Y-m-d'), 'description' => 'Ops', 'category' => 'operasional', 'type' => 'debit', 'amount' => 50000]);
        Finance::create(['user_id' => $this->user->id, 'date' => now()->format('Y-m-d'), 'description' => 'Sales', 'category' => 'penjualan', 'type' => 'kredit', 'amount' => 100000]);

        $response = $this->withToken($this->token)
            ->getJson('/api/finances?category=operasional');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.category', 'operasional');
    }

    public function test_shows_single_finance_record(): void
    {
        $finance = Finance::create([
            'user_id'     => $this->user->id,
            'date'        => now()->format('Y-m-d'),
            'description' => 'Test record',
            'category'    => 'lain_lain',
            'type'        => 'debit',
            'amount'      => 75000,
        ]);

        $response = $this->withToken($this->token)
            ->getJson("/api/finances/{$finance->id}");

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.id', $finance->id);
    }

    public function test_validation_fails_when_required_fields_missing(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/finances', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['date', 'description', 'category', 'type', 'amount']);
    }

    public function test_validation_fails_with_invalid_type(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/finances', [
                'date'        => now()->format('Y-m-d'),
                'description' => 'Test',
                'category'    => 'operasional',
                'type'        => 'invalid_type',
                'amount'      => 10000,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['type']);
    }

    public function test_validation_fails_with_invalid_category(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/finances', [
                'date'        => now()->format('Y-m-d'),
                'description' => 'Test',
                'category'    => 'invalid_category',
                'type'        => 'debit',
                'amount'      => 10000,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['category']);
    }

    public function test_validation_fails_with_invalid_amount(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/finances', [
                'date'        => now()->format('Y-m-d'),
                'description' => 'Test',
                'category'    => 'operasional',
                'type'        => 'debit',
                'amount'      => 0,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['amount']);
    }

    public function test_export_returns_csv(): void
    {
        $this->withToken($this->token)->postJson('/api/finances', [
            'date'        => now()->format('Y-m-d'),
            'description' => 'Export test',
            'category'    => 'operasional',
            'type'        => 'debit',
            'amount'      => 100000,
        ]);

        $response = $this->withToken($this->token)
            ->get('/api/finances/export');

        $response->assertOk()
            ->assertHeader('Content-Type', 'text/csv; charset=utf-8')
            ->assertHeader('Content-Disposition', 'attachment; filename="finances.csv"');
    }

    public function test_summary_returns_cached_result(): void
    {
        Finance::create(['user_id' => $this->user->id, 'date' => now()->format('Y-m-d'), 'description' => 'A', 'category' => 'operasional', 'type' => 'debit', 'amount' => 50000]);

        $this->withToken($this->token)->getJson('/api/finances/summary');

        Finance::create(['user_id' => $this->user->id, 'date' => now()->format('Y-m-d'), 'description' => 'B', 'category' => 'penjualan', 'type' => 'kredit', 'amount' => 100000]);

        $response = $this->withToken($this->token)->getJson('/api/finances/summary');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }
}
