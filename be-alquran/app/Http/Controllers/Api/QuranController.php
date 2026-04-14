<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Surah;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class QuranController extends Controller
{
    /**
     * Get all surahs with optional audio filter
     */
    public function index(Request $request)
    {
        $query = Surah::orderBy('number', 'asc');
        
        // Filter by audio availability
        if ($request->has('with_audio') && $request->with_audio === 'true') {
            $query->withAudio();
        }
        
        // Filter by revelation type
        if ($request->has('revelation')) {
            $query->byRevelation($request->revelation);
        }
        
        // Filter by reciter
        if ($request->has('reciter')) {
            $query->where('reciter', $request->reciter);
        }
        
        $surahs = $query->get();
        
        return response()->json([
            'success' => true,
            'data' => $surahs->map(function ($surah) {
                return [
                    'id' => $surah->id,
                    'number' => $surah->number,
                    'name_ar' => $surah->name_ar,
                    'name_id' => $surah->name_id,
                    'translation_id' => $surah->translation_id,
                    'number_of_verses' => $surah->numberOfVerses,
                    'revelation' => $surah->revelation,
                    'audio' => [
                        'has_audio' => $surah->has_audio,
                        'audio_url' => $surah->audio_url,
                        'reciter' => $surah->reciter,
                        'duration' => $surah->formatted_duration,
                        'file_size' => $surah->formatted_file_size,
                        'format' => $surah->audio_format
                    ]
                ];
            })
        ]);
    }
    
    /**
     * Get specific surah by number
     */
    public function show($number)
    {
        $surah = Surah::where('number', $number)->first();
        
        if (!$surah) {
            return response()->json([
                'success' => false,
                'message' => 'Surah not found'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $surah->id,
                'number' => $surah->number,
                'name_ar' => $surah->name_ar,
                'name_id' => $surah->name_id,
                'translation_id' => $surah->translation_id,
                'number_of_verses' => $surah->numberOfVerses,
                'revelation' => $surah->revelation,
                'audio' => [
                    'has_audio' => $surah->has_audio,
                    'audio_url' => $surah->audio_url,
                    'reciter' => $surah->reciter,
                    'duration' => $surah->formatted_duration,
                    'file_size' => $surah->formatted_file_size,
                    'format' => $surah->audio_format
                ]
            ]
        ]);
    }
    
    /**
     * Get surahs with audio only
     */
    public function withAudio()
    {
        $surahs = Surah::withAudio()->orderBy('number', 'asc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $surahs->map(function ($surah) {
                return [
                    'id' => $surah->id,
                    'number' => $surah->number,
                    'name_ar' => $surah->name_ar,
                    'name_id' => $surah->name_id,
                    'translation_id' => $surah->translation_id,
                    'audio_url' => $surah->audio_url,
                    'reciter' => $surah->reciter,
                    'duration' => $surah->formatted_duration,
                    'file_size' => $surah->formatted_file_size
                ];
            })
        ]);
    }
    
    /**
     * Get available reciters
     */
    public function reciters()
    {
        return response()->json([
            'success' => true,
            'data' => Surah::getReciters()
        ]);
    }
    
    /**
     * Get surahs by reciter
     */
    public function byReciter($reciter)
    {
        $surahs = Surah::where('reciter', $reciter)
            ->where('has_audio', true)
            ->orderBy('number', 'asc')
            ->get();
            
        if ($surahs->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No surahs found for this reciter'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'reciter' => $reciter,
            'reciter_name' => Surah::getReciters()[$reciter] ?? $reciter,
            'data' => $surahs->map(function ($surah) {
                return [
                    'id' => $surah->id,
                    'number' => $surah->number,
                    'name_ar' => $surah->name_ar,
                    'name_id' => $surah->name_id,
                    'audio_url' => $surah->audio_url,
                    'duration' => $surah->formatted_duration,
                    'file_size' => $surah->formatted_file_size
                ];
            })
        ]);
    }
    
    /**
     * Search surahs by name
     */
    public function search(Request $request)
    {
        $query = $request->get('q');
        
        if (!$query) {
            return response()->json([
                'success' => false,
                'message' => 'Search query is required'
            ], 400);
        }
        
        $surahs = Surah::where('name_id', 'LIKE', "%{$query}%")
            ->orWhere('name_ar', 'LIKE', "%{$query}%")
            ->orWhere('translation_id', 'LIKE', "%{$query}%")
            ->orderBy('number', 'asc')
            ->get();
            
        return response()->json([
            'success' => true,
            'query' => $query,
            'data' => $surahs->map(function ($surah) {
                return [
                    'id' => $surah->id,
                    'number' => $surah->number,
                    'name_ar' => $surah->name_ar,
                    'name_id' => $surah->name_id,
                    'translation_id' => $surah->translation_id,
                    'revelation' => $surah->revelation,
                    'has_audio' => $surah->has_audio,
                    'reciter' => $surah->reciter
                ];
            })
        ]);
    }
    
    /**
     * Get audio streaming URL for surah
     */
    public function stream($number)
    {
        $surah = Surah::where('number', $number)
            ->where('has_audio', true)
            ->first();
            
        if (!$surah || !$surah->audio_url) {
            return response()->json([
                'success' => false,
                'message' => 'Audio not available for this surah'
            ], 404);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'surah_number' => $surah->number,
                'surah_name' => $surah->name_id,
                'reciter' => $surah->reciter,
                'audio_url' => $surah->audio_url,
                'duration' => $surah->audio_duration,
                'format' => $surah->audio_format
            ]
        ]);
    }

    /**
     * Proxy/stream audio so browser can play without CORS/content-type issues.
     * Simple approach: fetch and output with proper headers.
     */
    public function streamProxy(Request $request, $number)
    {
        $surah = Surah::where('number', $number)
            ->where('has_audio', true)
            ->first();

        if (!$surah || !$surah->audio_url) {
            return response()->json([
                'success' => false,
                'message' => 'Audio not available for this surah'
            ], 404);
        }

        $url = $surah->audio_url;

        // Fetch audio content
        $context = stream_context_create([
            'http' => [
                'timeout' => 30,
                'follow_location' => true,
                'user_agent' => 'Mozilla/5.0 (AudioProxy)',
            ]
        ]);

        $content = @file_get_contents($url, false, $context);

        if ($content === false) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch audio from source'
            ], 502);
        }

        return response($content)
            ->header('Content-Type', 'audio/mpeg')
            ->header('Accept-Ranges', 'bytes')
            ->header('Cache-Control', 'public, max-age=86400')
            ->header('Content-Length', strlen($content));
    }
}
