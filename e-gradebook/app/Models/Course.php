<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'teacher_id'
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function grades()
    {
        return $this->hasMany(Grade::class);
    }

    public function students()
    {
        return $this->belongsToMany(User::class, 'grades', 'course_id', 'student_id')
            ->withPivot(['value', 'graded_on', 'note'])
            ->withTimestamps();
    }
}
