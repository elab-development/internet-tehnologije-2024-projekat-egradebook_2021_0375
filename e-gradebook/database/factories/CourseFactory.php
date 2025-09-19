<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subject = $this->faker->randomElement([
            'Mathematics',
            'Physics',
            'Chemistry',
            'Biology',
            'History',
            'Geography',
            'English',
            'Computer Science',
            'Music',
            'Art'
        ]);

        return [
            'name' => $subject . ' ' . $this->faker->randomElement(['I', 'II', 'A', 'B']),
            'code' => strtoupper($this->faker->unique()->bothify('COURSE-###')),
            'description' => $this->faker->optional()->paragraph(),
            'teacher_id' => User::factory()->teacher(),
        ];
    }

    public function forTeacher(?User $teacher = null): static
    {
        return $this->state(fn() => [
            'teacher_id' => $teacher?->id ?? User::factory()->teacher(),
        ]);
    }
}
