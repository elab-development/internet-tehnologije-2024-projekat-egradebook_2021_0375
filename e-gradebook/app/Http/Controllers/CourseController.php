<?php

namespace App\Http\Controllers;

use App\Http\Resources\CourseResource;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $query = Course::query()->with('teacher');

        if ($request->filled('teacher_id')) {
            $query->where('teacher_id', (int) $request->query('teacher_id'));
        }

        $courses = $query->orderBy('name')->paginate(20);


        return response()->json([
            'courses' => CourseResource::collection($courses),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Only admins can access this resource'], 403);
        }

        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'code' => ['nullable', 'string', 'max:50', 'unique:courses,code'],
            'description' => ['nullable', 'string'],
            'teacher_id'  => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(fn($q) => $q->where('role', 'teacher')),
            ],
        ]);

        $course = Course::create($data);

        return (new CourseResource($course->load('teacher')))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $course->load('teacher');
        return new CourseResource($course);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Course $course)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Only admins can access this resource'], 403);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:150'],
            'code' => ['sometimes', 'nullable', 'string', 'max:50', Rule::unique('courses', 'code')->ignore($course->id)],
            'description' => ['sometimes', 'nullable', 'string'],
            'teacher_id'  => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(fn($q) => $q->where('role', 'teacher')),
            ],
        ]);

        $course->update($data);

        return new CourseResource($course->load('teacher'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        if (Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Only admins can access this resource'], 403);
        }

        $course->delete();
        return response()->noContent();
    }
}
