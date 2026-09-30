<?php

namespace Database\Seeders;

use App\Models\Rol;
use Illuminate\Database\Seeder;

class RolSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Rol::query()->updateOrCreate(
            ['code' => 'admin'],
            ['name' => 'Administrador', 'description' => 'Acces complet al sistema'],
        );

        Rol::query()->updateOrCreate(
            ['code' => 'user'],
            ['name' => 'Usuari', 'description' => 'Acces basic d\'usuari'],
        );
    }
}
