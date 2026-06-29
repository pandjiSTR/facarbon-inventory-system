<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserApiTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create(['role' => 'admin']);
        $this->token = $this->user->createToken('test')->plainTextToken;
    }

    public function test_lists_users(): void
    {
        User::factory()->count(3)->create();

        $response = $this->withToken($this->token)
            ->getJson('/api/users');

        $response->assertOk()
            ->assertJsonCount(4, 'data');
    }

    public function test_creates_user(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/users', [
                'name'      => 'New Staff',
                'email'     => 'staff@example.com',
                'password'  => 'password123',
                'role'      => 'staff',
            ]);

        $response->assertCreated()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('users', [
            'email' => 'staff@example.com',
            'role'  => 'staff',
            'name'  => 'New Staff',
        ]);
    }

    public function test_shows_user(): void
    {
        $target = User::factory()->create();

        $response = $this->withToken($this->token)
            ->getJson("/api/users/{$target->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $target->id)
            ->assertJsonPath('data.email', $target->email);
    }

    public function test_updates_user(): void
    {
        $target = User::factory()->create();

        $response = $this->withToken($this->token)
            ->putJson("/api/users/{$target->id}", [
                'name' => 'Updated Name',
                'role' => 'staff',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('users', [
            'id'   => $target->id,
            'name' => 'Updated Name',
            'role' => 'staff',
        ]);
    }

    public function test_deletes_other_user(): void
    {
        $target = User::factory()->create();

        $response = $this->withToken($this->token)
            ->deleteJson("/api/users/{$target->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('users', ['id' => $target->id]);
    }

    public function test_cannot_delete_self(): void
    {
        $response = $this->withToken($this->token)
            ->deleteJson("/api/users/{$this->user->id}");

        $response->assertStatus(422)
            ->assertJsonPath('success', false);
    }

    public function test_validation_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'exists@example.com']);

        $response = $this->withToken($this->token)
            ->postJson('/api/users', [
                'name'     => 'Test',
                'email'    => 'exists@example.com',
                'password' => 'password123',
                'role'     => 'staff',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_validation_fails_with_short_password(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/users', [
                'name'     => 'Test',
                'email'    => 'test@example.com',
                'password' => 'short',
                'role'     => 'staff',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_validation_fails_with_invalid_role(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/users', [
                'name'     => 'Test',
                'email'    => 'test@example.com',
                'password' => 'password123',
                'role'     => 'superadmin',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }

    public function test_validation_fails_when_required_fields_missing(): void
    {
        $response = $this->withToken($this->token)
            ->postJson('/api/users', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password', 'role']);
    }

    public function test_requires_authentication(): void
    {
        $this->getJson('/api/users')->assertUnauthorized();
        $this->postJson('/api/users', [])->assertUnauthorized();
    }
}
