<?php

namespace App\Http\Controllers;

use App\Http\Resources\GradeResource;
use App\Models\Course;
use App\Models\Grade;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class GradeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $user = Auth::user();
        $perPage = (int) $request->query('per_page', 30);
        $perPage = max(1, min($perPage, 100));

        $rules = ['course_id' => ['sometimes', 'integer', 'exists:courses,id']];
        if ($user->role === User::ROLE_ADMIN) {
            $rules['teacher_id'] = [
                'sometimes',
                'integer',
                Rule::exists('users', 'id')->where(fn($q) => $q->where('role', User::ROLE_TEACHER)),
            ];
            $rules['student_id'] = [
                'sometimes',
                'integer',
                Rule::exists('users', 'id')->where(fn($q) => $q->where('role', User::ROLE_STUDENT)),
            ];
        } elseif ($user->role === User::ROLE_TEACHER) {
            // teacher MORA da navede course_id
            $rules['course_id'][] = 'required';
            // može i student_id da suzi na jednog učenika
            $rules['student_id'] = [
                'sometimes',
                'integer',
                Rule::exists('users', 'id')->where(fn($q) => $q->where('role', User::ROLE_STUDENT)),
            ];
        }

        $data = $request->validate($rules);

        $query = Grade::query()
            ->with(['student', 'course.teacher'])
            ->orderByDesc('graded_on')
            ->orderByDesc('id');

        if ($user->role === User::ROLE_ADMIN) {
            if (isset($data['teacher_id'])) {
                $tid = (int) $data['teacher_id'];
                $query->whereHas('course', fn($q) => $q->where('teacher_id', $tid));
            }
            if (isset($data['course_id'])) {
                $query->where('course_id', (int) $data['course_id']);
            }
            if (isset($data['student_id'])) {
                $query->where('student_id', (int) $data['student_id']);
            }
        } elseif ($user->role === User::ROLE_TEACHER) {
            $courseId = (int) $data['course_id'];
            // Provera da li kurs pripada nastavniku
            $course = Course::where('id', $courseId)->where('teacher_id', $user->id)->first();
            if (!$course) {
                return response()->json(['message' => 'Forbidden: course does not belong to this teacher'], 403);
            }
            $query->where('course_id', $courseId);

            if (isset($data['student_id'])) {
                $query->where('student_id', (int) $data['student_id']);
            }
        } else {
            // student
            $query->where('student_id', $user->id);
            if (isset($data['course_id'])) {
                $query->where('course_id', (int) $data['course_id']);
            }
        }

        $page = $query->paginate($perPage);

        return response()->json([
            'message' => 'Grades list',
            'filters' => [
                'teacher_id' => $data['teacher_id'] ?? null,
                'course_id' => $data['course_id']  ?? null,
                'student_id' => ($user->role === User::ROLE_ADMIN || $user->role === User::ROLE_TEACHER)
                    ? ($data['student_id'] ?? null)
                    : $user->id,
                'per_page'   => $perPage,
            ],
            'grades' => GradeResource::collection($page->items()),
            'pagination' => [
                'current_page' => $page->currentPage(),
                'per_page' => $page->perPage(),
                'total' => $page->total(),
                'last_page' => $page->lastPage(),
            ],
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
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $user = Auth::user();
        if ($user->role !== User::ROLE_TEACHER) {
            return response()->json(['message' => 'Only teachers can create grades'], 403);
        }

        $data = $request->validate([
            'student_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where(fn($q) => $q->where('role', User::ROLE_STUDENT)),
            ],
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'value' => ['required', 'integer', 'between:1,5'],
            'graded_on' => ['nullable', 'date'],
            'note' => ['nullable', 'string'],
        ]);

        // course mora pripadati nastavniku
        $course = Course::where('id', (int) $data['course_id'])
            ->where('teacher_id', $user->id)
            ->first();
        if (!$course) {
            return response()->json(['message' => 'Forbidden: course does not belong to this teacher'], 403);
        }

        $grade = Grade::create($data)->load(['student', 'course.teacher']);

        return response()->json([
            'message' => 'Grade created',
            'grade' => new GradeResource($grade),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Grade $grade)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Grade $grade)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Grade $grade)
    {
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $user = Auth::user();
        if ($user->role !== User::ROLE_TEACHER) {
            return response()->json(['message' => 'Only teachers can update grades'], 403);
        }

        $grade->load('course'); // provera vlasništva kursa
        if (!$grade->course || $grade->course->teacher_id !== $user->id) {
            return response()->json(['message' => 'Forbidden: grade does not belong to your course'], 403);
        }

        $data = $request->validate([
            'value' => ['sometimes', 'integer', 'between:1,5'],
            'graded_on' => ['sometimes', 'nullable', 'date'],
            'note' => ['sometimes', 'nullable', 'string'],
        ]);

        if (empty($data)) {
            return response()->json(['message' => 'No changes provided'], 422);
        }

        $grade->update($data);
        $grade->load(['student', 'course.teacher']);

        return response()->json([
            'message' => 'Grade updated',
            'grade' => new GradeResource($grade),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Grade $grade)
    {
        //
    }
}
