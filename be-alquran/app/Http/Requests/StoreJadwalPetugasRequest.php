<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;

class StoreJadwalPetugasRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'tanggal' => 'required|date|unique:jadwal_petugas,tanggal',
            'imam_id' => 'nullable|exists:petugas,id',
            'bilal_id' => 'nullable|exists:petugas,id',
            'muadzin_id' => 'nullable|exists:petugas,id',
            'penceramah_id' => 'nullable|exists:petugas,id',
            'catatan' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'tanggal.required' => 'Tanggal wajib diisi.',
            'tanggal.date' => 'Format tanggal tidak valid.',
            'tanggal.unique' => 'Jadwal untuk tanggal ini sudah ada.',
            'imam_id.exists' => 'Petugas imam tidak ditemukan.',
            'bilal_id.exists' => 'Petugas bilal tidak ditemukan.',
            'muadzin_id.exists' => 'Petugas muadzin tidak ditemukan.',
            'penceramah_id.exists' => 'Petugas penceramah tidak ditemukan.',
        ];
    }
}
