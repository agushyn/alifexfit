<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CancelTrainingSessionRequest;
use App\Http\Requests\Admin\CompleteTrainingSessionRequest;
use App\Models\TrainingSession;
use App\Models\WorkoutType;
use App\Services\Workouts\WorkoutSessionService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class WorkoutSessionController extends Controller
{
    public function __construct(
        protected WorkoutSessionService $sessionService
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', TrainingSession::class);

        $query = TrainingSession::with([
            'member:id,gym_id,first_name,last_name,full_name,member_number,profile_photo',
            'workoutType:id,gym_id,name,category',
            'trainer:id,gym_id,name,specialization,profile_photo',
            'attendance:id,gym_id,check_in_at,check_out_at,status',
            'gym:id,name,code',
        ]);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->whereHas('member', function ($q) use ($search) {
                $q->where('member_number', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('full_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('workout_type_id')) {
            $query->where('workout_type_id', $request->input('workout_type_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('date')) {
            $query->whereDate('started_at', $request->input('date'));
        }

        $sessions = $query->latest('started_at')->paginate(15)->withQueryString();

        $stats = [
            'in_progress' => TrainingSession::where('status', 'in_progress')->count(),
            'today' => TrainingSession::whereDate('started_at', Carbon::today())->count(),
            'completed_today' => TrainingSession::where('status', 'completed')->whereDate('started_at', Carbon::today())->count(),
            'total' => TrainingSession::count(),
        ];

        $workoutTypes = WorkoutType::where('status', 'active')->orderBy('name')->get(['id', 'name', 'category']);

        return Inertia::render('Admin/WorkoutSessions/Index', [
            'sessions' => $sessions,
            'filters' => $request->only(['search', 'workout_type_id', 'status', 'date']),
            'stats' => $stats,
            'workoutTypes' => $workoutTypes,
        ]);
    }

    public function show(TrainingSession $workoutSession): Response
    {
        Gate::authorize('view', $workoutSession);

        $workoutSession->load([
            'member:id,gym_id,first_name,last_name,full_name,member_number,email,phone,profile_photo',
            'workoutType:id,gym_id,name,category,description',
            'trainer:id,gym_id,name,specialization,profile_photo,phone,email,status',
            'attendance:id,gym_id,check_in_at,check_out_at,status,source,device_identifier',
            'membership:id,gym_id,membership_plan_id,start_date,end_date,status,price,trainer_quota_total,trainer_quota_used',
            'membership.membershipPlan:id,name',
            'gym:id,name,code,address',
        ]);

        return Inertia::render('Admin/WorkoutSessions/Show', [
            'session' => $workoutSession,
        ]);
    }

    public function complete(CompleteTrainingSessionRequest $request, TrainingSession $workoutSession): RedirectResponse
    {
        Gate::authorize('update', $workoutSession);

        $this->sessionService->completeSession($workoutSession, $request->input('notes'));

        return back()->with('success', 'Sesi workout berhasil diselesaikan.');
    }

    public function cancel(CancelTrainingSessionRequest $request, TrainingSession $workoutSession): RedirectResponse
    {
        Gate::authorize('delete', $workoutSession);

        $this->sessionService->cancelSession($workoutSession, $request->input('reason'));

        return redirect()->route('admin.workout-sessions.index')
            ->with('success', 'Sesi workout berhasil dibatalkan.');
    }
}