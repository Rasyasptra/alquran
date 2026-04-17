<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MosqueStaffSchedule;
use Illuminate\Http\Request;

class MosqueStaffScheduleController extends Controller
{
    /**
     * [PUBLIK] Get staff schedules — bisa diakses tanpa auth, untuk user dashboard
     */
    public function publicIndex(Request $request)
    {
        $query = MosqueStaffSchedule::query();

        if ($request->month) {
            $query->byMonth($request->month);
        }

        $schedules = $query->orderBy('date')->get();

        return response()->json([
            'success' => true,
            'data'    => $schedules,
        ]);
    }

    /**
     * [ADMIN] Get staff schedules for a month (requires auth)
     */
    public function index(Request $request)
    {
        $query = MosqueStaffSchedule::query();
        
        if ($request->month) {
            $query->byMonth($request->month);
        }
        
        $schedules = $query->orderBy('date')->get();
        
        return response()->json([
            'success' => true,
            'data' => $schedules
        ]);
    }

    /**
     * Get staff schedule for specific date
     */
    public function show($date)
    {
        $schedule = MosqueStaffSchedule::byDate($date)->first();
        
        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Staff schedule not found for this date'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $schedule
        ]);
    }

    /**
     * Create new staff schedule
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date|unique:mosque_staff_schedules,date',
            'imam' => 'nullable|string|max:255',
            'bilal' => 'nullable|string|max:255',
            'muadzin' => 'nullable|string|max:255',
            'penceramah' => 'nullable|string|max:255',
            'notes' => 'nullable|string'
        ]);

        $schedule = MosqueStaffSchedule::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Staff schedule created successfully',
            'data' => $schedule
        ], 201);
    }

    /**
     * Update staff schedule
     */
    public function update(Request $request, $id)
    {
        $schedule = MosqueStaffSchedule::find($id);
        
        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Staff schedule not found'
            ], 404);
        }

        $validated = $request->validate([
            'date' => 'sometimes|required|date|unique:mosque_staff_schedules,date,' . $id,
            'imam' => 'nullable|string|max:255',
            'bilal' => 'nullable|string|max:255',
            'muadzin' => 'nullable|string|max:255',
            'penceramah' => 'nullable|string|max:255',
            'notes' => 'nullable|string'
        ]);

        $schedule->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Staff schedule updated successfully',
            'data' => $schedule
        ]);
    }

    /**
     * Delete staff schedule
     */
    public function destroy($id)
    {
        $schedule = MosqueStaffSchedule::find($id);
        
        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Staff schedule not found'
            ], 404);
        }

        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Staff schedule deleted successfully'
        ]);
    }
}
