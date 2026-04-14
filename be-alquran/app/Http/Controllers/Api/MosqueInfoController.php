<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MosqueInfo;
use Illuminate\Http\Request;

class MosqueInfoController extends Controller
{
    /**
     * Get mosque information
     */
    public function index()
    {
        $mosque = MosqueInfo::getDefault();
        
        if (!$mosque) {
            return response()->json([
                'success' => false,
                'message' => 'Mosque information not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $mosque->id,
                'name' => $mosque->name,
                'address' => $mosque->address,
                'phone' => $mosque->phone,
                'email' => $mosque->email,
                'latitude' => $mosque->latitude,
                'longitude' => $mosque->longitude,
                'timezone' => $mosque->timezone,
                'description' => $mosque->description,
                'logo_url' => $mosque->logo_url,
                'website_url' => $mosque->website_url,
                'social_media' => $mosque->social_media,
                'is_active' => $mosque->is_active
            ]
        ]);
    }

    /**
     * Update mosque information
     */
    public function update(Request $request)
    {
        $mosque = MosqueInfo::getDefault();
        
        if (!$mosque) {
            $mosque = MosqueInfo::create([
                'name' => $request->name,
                'timezone' => $request->timezone ?? 'Asia/Jakarta'
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'timezone' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|url',
            'website_url' => 'nullable|url',
            'social_media' => 'nullable|array',
            'is_active' => 'boolean'
        ]);

        $mosque->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Mosque information updated successfully',
            'data' => [
                'id' => $mosque->id,
                'name' => $mosque->name,
                'address' => $mosque->address,
                'phone' => $mosque->phone,
                'email' => $mosque->email,
                'latitude' => $mosque->latitude,
                'longitude' => $mosque->longitude,
                'timezone' => $mosque->timezone,
                'description' => $mosque->description,
                'logo_url' => $mosque->logo_url,
                'website_url' => $mosque->website_url,
                'social_media' => $mosque->social_media,
                'is_active' => $mosque->is_active
            ]
        ]);
    }

    /**
     * Store new mosque information
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'timezone' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'logo_url' => 'nullable|url',
            'website_url' => 'nullable|url',
            'social_media' => 'nullable|array',
            'is_active' => 'boolean'
        ]);

        $mosque = MosqueInfo::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Mosque information created successfully',
            'data' => [
                'id' => $mosque->id,
                'name' => $mosque->name,
                'address' => $mosque->address,
                'phone' => $mosque->phone,
                'email' => $mosque->email,
                'latitude' => $mosque->latitude,
                'longitude' => $mosque->longitude,
                'timezone' => $mosque->timezone,
                'description' => $mosque->description,
                'logo_url' => $mosque->logo_url,
                'website_url' => $mosque->website_url,
                'social_media' => $mosque->social_media,
                'is_active' => $mosque->is_active
            ]
        ], 201);
    }
}
