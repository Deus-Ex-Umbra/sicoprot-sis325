<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        Usuario::factory()->create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
            'rol' => 'SuperAdmin',
        ]);

        Usuario::factory()->create([
            'email' => 'asesor@example.com',
            'password' => Hash::make('password123'),
            'rol' => 'Asesor',
        ]);

        Usuario::factory()->create([
            'email' => 'estudiante@example.com',
            'password' => Hash::make('password123'),
            'rol' => 'Estudiante',
        ]);
        
        Usuario::factory(10)->create();
    }
}