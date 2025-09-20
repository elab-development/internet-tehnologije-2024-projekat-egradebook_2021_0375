<?php

namespace Database\Factories;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Grade>
 */
class GradeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => User::factory()->student(),
            'course_id' => Course::factory(),
            'value' => $this->faker->numberBetween(1, 5),
            'graded_on' => $this->faker->optional(0.8)->dateTimeBetween('-6 months', 'now'),
            'note' => $this->faker->optional(0.3)->sentence(),
        ];
    }

    public function forCourse(?Course $course = null): static
    {
        return $this->state(fn() => [
            'course_id' => $course?->id ?? Course::factory(),
        ]);
    }

    public function forStudent(?User $student = null): static
    {
        return $this->state(fn() => [
            'student_id' => $student?->id ?? User::factory()->student(),
        ]);
    }
}
