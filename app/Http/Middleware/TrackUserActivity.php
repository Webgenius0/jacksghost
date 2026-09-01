<?php

namespace App\Http\Middleware;

use App\Models\UserActivity;
use App\Models\UserSession;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class TrackUserActivity
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $user = auth()->user();
        if (!$user) {
            return $response;
        }

        $platform = $this->normalizePlatform($request->header('Platform'));

        UserActivity::create([
            'user_id' => $user->id,
            'action' => $request->route()?->uri() ?? $request->path(),
            'platform' => $platform,
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'ip_address' => $request->ip(),
        ]);

        $token = $user->currentAccessToken();
        if (!$token) {
            return $response;
        }

        $session = UserSession::where('token_id', (string) $token->id)
            ->whereNull('finished_at')
            ->latest('id')
            ->first(['id', 'last_activity']);

        if (!$session) {
            return $response;
        }

        $now = now();
        $lastActivity = $session->last_activity ?? $now;
        $elapsedSeconds = max(0, $lastActivity->diffInSeconds($now));

        // Reduce write pressure by updating at a small interval instead of every hit.
        if ($elapsedSeconds >= 15) {
            UserSession::whereKey($session->id)
                ->where('last_activity', $session->last_activity)
                ->update([
                'last_activity' => $now,
                'duration' => DB::raw('duration + ' . (int) $elapsedSeconds),
            ]);
        }

        return $response;
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
