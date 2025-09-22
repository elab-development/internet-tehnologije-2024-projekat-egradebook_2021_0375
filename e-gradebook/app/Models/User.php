<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public const ROLE_ADMIN   = 'admin';
    public const ROLE_TEACHER = 'teacher';
    public const ROLE_STUDENT = 'student';

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }
    public function isTeacher(): bool
    {
        return $this->role === self::ROLE_TEACHER;
    }
    public function isStudent(): bool
    {
        return $this->role === self::ROLE_STUDENT;
    }

    public function taughtCourses()
    {
        return $this->hasMany(Course::class, 'teacher_id');
    }

    public function grades()
    {
        return $this->hasMany(Grade::class, 'student_id');
    }

    public function gradedCourses()
    {
        return $this->belongsToMany(Course::class, 'grades', 'student_id', 'course_id')
            ->withPivot(['value', 'graded_on', 'note'])
            ->withTimestamps();
    }

}
