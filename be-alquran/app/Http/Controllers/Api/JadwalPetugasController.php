<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreJadwalPetugasRequest;
use App\Http\Requests\UpdateJadwalPetugasRequest;
use App\Models\JadwalPetugas;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JadwalPetugasController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = JadwalPetugas::with(['imam', 'bilal', 'muadzin', 'penceramah']);

        if ($request->has('bulan') && $request->has('tahun')) {
            $query->whereMonth('tanggal', $request->bulan)
                  ->whereYear('tanggal', $request->tahun);
        }

        $jadwal = $query->orderBy('tanggal', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Data jadwal petugas berhasil diambil.',
            'data' => $jadwal
        ]);
    }

    public function public(Request $request): JsonResponse
    {
        return $this->index($request); // Reuse index logic since it just returns data
    }

    public function store(StoreJadwalPetugasRequest $request): JsonResponse
    {
        $jadwal = JadwalPetugas::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil ditambahkan.',
            'data' => $jadwal->load(['imam', 'bilal', 'muadzin', 'penceramah'])
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $jadwal = JadwalPetugas::with(['imam', 'bilal', 'muadzin', 'penceramah'])->find($id);

        if (!$jadwal) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak ditemukan.',
                'data' => null
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data jadwal berhasil diambil.',
            'data' => $jadwal
        ]);
    }

    public function update(UpdateJadwalPetugasRequest $request, string $id): JsonResponse
    {
        $jadwal = JadwalPetugas::find($id);

        if (!$jadwal) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak ditemukan.',
                'data' => null
            ], 404);
        }

        $jadwal->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil diperbarui.',
            'data' => $jadwal->load(['imam', 'bilal', 'muadzin', 'penceramah'])
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $jadwal = JadwalPetugas::find($id);

        if (!$jadwal) {
            return response()->json([
                'success' => false,
                'message' => 'Jadwal tidak ditemukan.',
                'data' => null
            ], 404);
        }

        $jadwal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal berhasil dihapus.',
            'data' => null
        ]);
    }
}
