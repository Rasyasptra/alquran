<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyPrayer;
use Illuminate\Http\Request;

class DailyPrayerController extends Controller
{
    /**
     * Get all daily prayers
     */
    public function index(Request $request)
    {
        $query = DailyPrayer::active()->ordered();
        
        if ($request->category) {
            $query->byCategory($request->category);
        }
        
        $prayers = $query->get();
        
        return response()->json([
            'success' => true,
            'data' => $prayers->map(function ($prayer) {
                return [
                    'id' => $prayer->id,
                    'category' => $prayer->category,
                    'category_name' => DailyPrayer::getCategories()[$prayer->category] ?? $prayer->category,
                    'title_ar' => $prayer->title_ar,
                    'title_id' => $prayer->title_id,
                    'arabic_text' => $prayer->arabic_text,
                    'latin_text' => $prayer->latin_text,
                    'translation_id' => $prayer->translation_id,
                    'source' => $prayer->source,
                    'audio_url' => $prayer->audio_url
                ];
            })
        ]);
    }

    /**
     * Get prayers by category
     */
    public function byCategory($category)
    {
        $prayers = DailyPrayer::active()
            ->byCategory($category)
            ->ordered()
            ->get();
            
        if ($prayers->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'No prayers found for this category'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'category' => $category,
            'category_name' => DailyPrayer::getCategories()[$category] ?? $category,
            'data' => $prayers->map(function ($prayer) {
                return [
                    'id' => $prayer->id,
                    'title_ar' => $prayer->title_ar,
                    'title_id' => $prayer->title_id,
                    'arabic_text' => $prayer->arabic_text,
                    'latin_text' => $prayer->latin_text,
                    'translation_id' => $prayer->translation_id,
                    'source' => $prayer->source,
                    'audio_url' => $prayer->audio_url
                ];
            })
        ]);
    }

    /**
     * Get random daily prayer
     */
    public function random()
    {
        $prayer = DailyPrayer::getRandom();
        
        if (!$prayer) {
            return response()->json([
                'success' => false,
                'message' => 'No prayers found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $prayer->id,
                'category' => $prayer->category,
                'category_name' => DailyPrayer::getCategories()[$prayer->category] ?? $prayer->category,
                'title_ar' => $prayer->title_ar,
                'title_id' => $prayer->title_id,
                'arabic_text' => $prayer->arabic_text,
                'latin_text' => $prayer->latin_text,
                'translation_id' => $prayer->translation_id,
                'source' => $prayer->source,
                'audio_url' => $prayer->audio_url
            ]
        ]);
    }

    /**
     * Get all categories
     */
    public function categories()
    {
        return response()->json([
            'success' => true,
            'data' => DailyPrayer::getCategories()
        ]);
    }

    /**
     * Get specific prayer by ID
     */
    public function show($id)
    {
        $prayer = DailyPrayer::active()->find($id);
        
        if (!$prayer) {
            return response()->json([
                'success' => false,
                'message' => 'Prayer not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $prayer->id,
                'category' => $prayer->category,
                'category_name' => DailyPrayer::getCategories()[$prayer->category] ?? $prayer->category,
                'title_ar' => $prayer->title_ar,
                'title_id' => $prayer->title_id,
                'arabic_text' => $prayer->arabic_text,
                'latin_text' => $prayer->latin_text,
                'translation_id' => $prayer->translation_id,
                'source' => $prayer->source,
                'audio_url' => $prayer->audio_url
            ]
        ]);
    }
}
