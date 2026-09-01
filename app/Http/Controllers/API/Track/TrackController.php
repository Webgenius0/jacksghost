<?php

namespace App\Http\Controllers\API\Track;

use App\Http\Controllers\Controller;
use App\Models\UserSession;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class TrackController extends Controller
{
    use ApiResponse;
    public function start(Request $request)
    {
        $request->validate([
            'platform' => 'nullable|string|max:20',
        ]);

        $user = auth()->user();

        $platform = $this->normalizePlatform($request->platform ?? $request->header('Platform'));

        $token = $user->currentAccessToken();

        if (!$token) {
            return $this->error('Token not found', 401); 
        }

        $tokenId = (string) $token->id;
        $now = now();

        $openSessions = UserSession::where('token_id', $tokenId)
            ->whereNull('finished_at')
            ->get(['id', 'duration', 'last_activity']);

        foreach ($openSessions as $openSession) {
            $extraSeconds = $openSession->last_activity
                ? $openSession->last_activity->diffInSeconds($now)
                : 0;

            $openSession->update([
                'finished_at' => $now,
                'duration' => (int) $openSession->duration + $extraSeconds,
            ]);
        }

        $session = UserSession::create([
            'user_id'       => $user->id,
            'platform'      => $platform,
            'started_at'    => $now,
            'last_activity' => $now,
            'token_id'      => $tokenId,
            'duration'      => 0,
        ]);

        return $this->success('Session started', $session, 200);
    }

    /**
     * End user session
     */
    public function end(Request $request)
    {
        $user = auth()->user();

        $token = $user->currentAccessToken();

        if (!$token) {
            return $this->error('Token not found', 401);
        }

        $tokenId = (string) $token->id;

        $session = UserSession::where('token_id', $tokenId)
            ->whereNull('finished_at')
            ->latest()
            ->first();

        if (!$session) {
            return $this->error('No active session found', 404);
        }

        $now = now();
        $extraSeconds = $session->last_activity
            ? $session->last_activity->diffInSeconds($now)
            : 0;

        $session->update([
            'finished_at' => $now,
            'duration' => (int) $session->duration + $extraSeconds,
        ]);

        return $this->success('Session ended', $session, 200);
    }

    private function normalizePlatform(?string $platform): string
    {
        $normalized = strtolower(trim((string) $platform));

        return match ($normalized) {
            'mobile', 'ios', 'android', 'app' => 'app',
            'web', 'website', 'browser' => 'web',
            '', 'unknown' => 'unknown',
            default => $normalized,
        };
    }
}
