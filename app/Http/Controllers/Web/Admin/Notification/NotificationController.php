<?php

namespace App\Http\Controllers\Web\Admin\Notification;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $admin */
        $admin = $request->user();

        $notifications = $admin->notifications()
            ->latest()
            ->paginate(15)
            ->through(function (DatabaseNotification $notification): array {
                $data = $notification->data;

                return [
                    'id' => $notification->id,
                    'title' => $data['title'] ?? 'Notification',
                    'message' => $data['message'] ?? '',
                    'user_name' => $data['user_name'] ?? null,
                    'user_email' => $data['user_email'] ?? null,
                    'url' => $data['url'] ?? null,
                    'created_at' => $notification->created_at?->toDateTimeString(),
                    'read_at' => $notification->read_at?->toDateTimeString(),
                    'resolved_at' => $notification->resolved_at ?? null,
                ];
            });

        return Inertia::render('notification/index', [
            'notificationData' => $notifications,
            'unreadCount' => $admin->unreadNotifications()->count(),
            'resolvedCount' => $admin->notifications()->whereNotNull('resolved_at')->count(),
        ]);
    }

    public function markRead(Request $request, DatabaseNotification $notification): RedirectResponse
    {
        $this->authorizeNotification($request, $notification);
        $notification->markAsRead();

        return back();
    }

    public function markUnread(Request $request, DatabaseNotification $notification): RedirectResponse
    {
        $this->authorizeNotification($request, $notification);
        $notification->read_at = null;
        $notification->save();

        return back();
    }

    public function markResolved(Request $request, DatabaseNotification $notification): RedirectResponse
    {
        $this->authorizeNotification($request, $notification);
        $notification->resolved_at = now();
        $notification->save();

        return back();
    }

    public function markUnresolved(Request $request, DatabaseNotification $notification): RedirectResponse
    {
        $this->authorizeNotification($request, $notification);
        $notification->resolved_at = null;
        $notification->save();

        return back();
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        /** @var User $admin */
        $admin = $request->user();
        $admin->unreadNotifications()->update(['read_at' => now()]);

        return back();
    }

    protected function authorizeNotification(Request $request, DatabaseNotification $notification): void
    {
        /** @var User $admin */
        $admin = $request->user();

        abort_unless(
            $notification->notifiable_type === User::class && (int) $notification->notifiable_id === (int) $admin->id,
            403
        );
    }
}
