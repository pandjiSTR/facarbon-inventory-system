<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'      => 'Admin Facarbon',
            'email'     => 'admin@facarbon.com',
            'password'  => Hash::make('facarbon123'),
            'role'      => 'admin',
            'is_active' => true,
        ]);

        User::create([
            'name'      => 'Staff Facarbon',
            'email'     => 'staff@facarbon.com',
            'password'  => Hash::make('facarbon123'),
            'role'      => 'staff',
            'is_active' => true,
        ]);
    }
}
