<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $teachers = User::where('role', User::ROLE_TEACHER)->get()->values();
        if ($teachers->count() < 2) {
            $this->command?->warn('Not enough teachers — creating some via factory.');
            $teachers = User::factory()->count(2)->teacher()->create();
        }

        $catalog = [
            [
                'name' => 'Mathematics I',
                'code' => 'MATH-101',
                'description' => 'Algebra, equations, and functions.'
            ],
            [
                'name' => 'English Language',
                'code' => 'ENG-101',
                'description' => 'Grammar, vocabulary, reading comprehension.'
            ],
            [
                'name' => 'Computer Science',
                'code' => 'CS-101',
                'description' => 'Programming basics and algorithms.'
            ],
            [
                'name' => 'History',
                'code' => 'HIST-101',
                'description' => 'Ancient to modern world history.'
            ],
            [
                'name' => 'Physics',
                'code' => 'PHYS-101',
                'description' => 'Mechanics, motion, and forces.'
            ],
        ];

        foreach ($catalog as $i => $c) {
            Course::updateOrCreate(
                ['code' => $c['code']],
                [
                    'name' => $c['name'],
                    'description' => $c['description'],
                    'teacher_id' => $teachers[$i % $teachers->count()]->id,
                ]
            );
        }
    }
}
