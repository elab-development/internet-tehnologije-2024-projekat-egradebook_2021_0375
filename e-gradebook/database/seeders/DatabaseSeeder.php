<?php

namespace Database\Seeders;


use App\Models\User;
//use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@eschool.com'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('password'),
                'role' => User::ROLE_ADMIN,
                'email_verified_at' => now(),
            ]
        );

        $teachers = collect([
            ['name' => 'Ana Petrović',    'email' => 'ana.petrovic@eschool.com'],
            ['name' => 'Marko Jovanović', 'email' => 'marko.jovanovic@eschool.com'],
            ['name' => 'Ivana Kovač',     'email' => 'ivana.kovac@eschool.com'],
        ])->map(function ($t) {
            return User::updateOrCreate(
                ['email' => $t['email']],
                [
                    'name' => $t['name'],
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_TEACHER,
                    'email_verified_at' => now(),
                ]
            );
        });

        User::factory()->count(20)->student()->create([
            'password' => Hash::make('password'),
        ]);

        $this->call([
            CourseSeeder::class,
            GradeSeeder::class,
        ]);
    }
}
