<?php

namespace App\Http\Middleware;

use App\Models\SystemSetting;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'settings' => fn () => Cache::remember('system_settings', 3600, function () {

                $setting = SystemSetting::first();

                if (!$setting) {
                    return [
                        'system_name' => config('app.name'),
                        'favicon' => '/assets/brand/favicon.png',
                        'logo' => '/assets/brand/logo.png',
                    ];
                }

                return [
                    'system_name' => $setting->system_name,
                    'favicon' => $setting->favicon ?: '/assets/brand/favicon.png',
                    'logo' => $setting->logo ?: '/assets/brand/logo.png',
                ];
            }),
            'notifications' => function () use ($request) {
                $user = $request->user();
                if (!$user) return null;

                return [
                    'items' => $user->notifications()->latest()->take(10)->get()->map(function ($notification) {
                        $data = $notification->data;
                        return [
                            'id' => $notification->id,
                            'title' => $data['title'] ?? 'Notification',
                            'message' => $data['message'] ?? '',
                            'url' => $data['url'] ?? null,
                            'created_at' => $notification->created_at?->toDateTimeString(),
                            'read_at' => $notification->read_at?->toDateTimeString(),
                            'resolved_at' => $notification->resolved_at ?? null,
                        ];
                    }),
                    'unread_count' => $user->unreadNotifications()->count(),
                    'resolved_count' => $user->notifications()->whereNotNull('resolved_at')->count(),
                ];
            },
        ];
    }
}
