<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\Request;

class PushController extends Controller
{
    /**
     * Store push subscription
     */
    public function subscribe(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|url',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        $subscription = PushSubscription::updateOrCreate(
            ['endpoint' => $request->endpoint],
            [
                'public_key' => $request->keys['p256dh'],
                'auth_token' => $request->keys['auth'],
            ]
        );

        return response()->json(['success' => true, 'message' => 'Subscribed successfully.']);
    }

    /**
     * Remove push subscription
     */
    public function unsubscribe(Request $request)
    {
        $request->validate([
            'endpoint' => 'required|url'
        ]);

        PushSubscription::where('endpoint', $request->endpoint)->delete();

        return response()->json(['success' => true, 'message' => 'Unsubscribed successfully.']);
    }

    /**
     * Get VAPID public key
     */
    public function vapidPublicKey()
    {
        return response()->json([
            'public_key' => env('VAPID_PUBLIC_KEY')
        ]);
    }
}
