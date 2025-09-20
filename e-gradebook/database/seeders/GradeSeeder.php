<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Grade;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;

class GradeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $students = User::where('role', User::ROLE_STUDENT)->get();
        $courses  = Course::all();

        if ($students->isEmpty() || $courses->isEmpty()) {
            $this->command?->warn('No students or courses to grade. Seed users/courses first.');
            return;
        }

        foreach ($courses as $course) {
            foreach ($students as $student) {
                $count = rand(1, 3);
                for ($i = 0; $i < $count; $i++) {
                    Grade::create([
                        'student_id' => $student->id,
                        'course_id' => $course->id,
                        'value'  => Arr::random([1, 2, 3, 4, 5]),
                        'graded_on' => Carbon::now()->subDays(rand(0, 90)),
                        'note'  => Arr::random([
                            null,
                            'Quiz',
                            'Homework',
                            'Midterm',
                            'Participation',
                            'Project',
                        ]),
                    ]);
                }
            }
        }
    }
}
