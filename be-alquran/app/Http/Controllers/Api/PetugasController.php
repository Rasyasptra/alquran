<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePetugasRequest;
use App\Http\Requests\UpdatePetugasRequest;
use App\Models\Petugas;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PetugasController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Petugas::query();

        if ($request->has('jabatan')) {
            $query->where('jabatan', $request->jabatan);
        }

        $petugas = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Data petugas berhasil diambil.',
            'data' => $petugas
        ]);
    }

    public function store(StorePetugasRequest $request): JsonResponse
    {
        $petugas = Petugas::create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Petugas berhasil ditambahkan.',
            'data' => $petugas
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $petugas = Petugas::find($id);

        if (!$petugas) {
            return response()->json([
                'success' => false,
                'message' => 'Petugas tidak ditemukan.',
                'data' => null
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data petugas berhasil diambil.',
            'data' => $petugas
        ]);
    }

    public function update(UpdatePetugasRequest $request, string $id): JsonResponse
    {
        $petugas = Petugas::find($id);

        if (!$petugas) {
            return response()->json([
                'success' => false,
                'message' => 'Petugas tidak ditemukan.',
                'data' => null
            ], 404);
        }

        $petugas->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Petugas berhasil diperbarui.',
            'data' => $petugas
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $petugas = Petugas::find($id);

        if (!$petugas) {
            return response()->json([
                'success' => false,
                'message' => 'Petugas tidak ditemukan.',
                'data' => null
            ], 404);
        }

        $petugas->delete();

        return response()->json([
            'success' => true,
            'message' => 'Petugas berhasil dihapus.',
            'data' => null
        ]);
    }
}
