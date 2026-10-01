<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(CountrySeeder::class);
        $this->call(PostalcodeSeeder::class);

        $this->call(RolSeeder::class);

        $adminRol = Rol::query()->where('code', 'admin')->firstOrFail();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'rol_id' => $adminRol->id,
        ]);
    }
}
