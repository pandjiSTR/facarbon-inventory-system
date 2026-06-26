<?php

namespace Tests\Feature\Api;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_with_valid_credentials_returns_token(): void
    {
        User::factory()->create([
            'email'    => 'test@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'test@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['success', 'data' => ['user', 'token']])
            ->assertJsonPath('success', true);
    }

    public function test_login_with_invalid_credentials_fails(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email'    => 'nonexistent@example.com',
            'password' => 'wrong',
        ]);

        $response->assertStatus(422);
    }

    public function test_login_with_inactive_user_fails(): void
    {
        User::factory()->create([
            'email'    => 'inactive@example.com',
            'password' => Hash::make('password'),
            'is_active' => false,
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email'    => 'inactive@example.com',
            'password' => 'password',
        ]);

        $response->assertForbidden()
            ->assertJsonPath('success', false);
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson('/api/auth/logout');

        $response->assertOk()
            ->assertJsonPath('success', true);
    }

    public function test_me_returns_authenticated_user(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $response = $this->withToken($token)
            ->getJson('/api/auth/me');

        $response->assertOk()
            ->assertJsonPath('data.email', $user->email);
    }

    public function test_unauthenticated_requests_rejected(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
        $this->getJson('/api/products')->assertUnauthorized();
    }
}
