<?php

namespace App\Http\Requests;

class StorePetugasRequest extends ApiRequest
{
    public function rules(): array
    {
        return [
            'nama' => 'required|string|max:255',
            'jabatan' => 'required|in:imam,bilal,muadzin,penceramah',
            'no_telepon' => 'nullable|string|max:20',
            'aktif' => 'boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required' => 'Nama petugas wajib diisi.',
            'jabatan.required' => 'Jabatan wajib dipilih.',
            'jabatan.in' => 'Jabatan tidak valid.',
        ];
    }
}
