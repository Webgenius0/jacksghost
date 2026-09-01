<?php

namespace App\Http\Controllers\API\Notification;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\FirebaseToken;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $user = Auth::user();
        $data = $user->only('email_notification', 'reminder');

        return $this->success('Data Retrieve Successfully!', $data, 200);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'email_notification' => 'sometimes|boolean',
            'app_notification'   => 'sometimes|boolean',
            'reminder'           => 'sometimes|in:Morning,Afternoon,Evening',
        ]);

        $user = Auth::user();
        $user->update($validated);

        return $this->success(
            'Data Updated Successfully!',
            $user->only('email_notification', 'app_notification', 'reminder'),
            200
        );
    }

    public function userNotifications(Request $request)
    {
        $user = Auth::user();

        $user->unreadNotifications->markAsRead();

        $notifications = $user->notifications()->latest()->get();

        return $this->success(
            'Notifications Retrieved Successfully!',
            NotificationResource::collection($notifications),
            200
        );
    }

    public function storeFirebaseToken(Request $request)
    {
        $validated = $request->validate([
            'token'     => 'required',
            'device_id' => 'required',
        ]);

        $user = Auth::user();

        FirebaseToken::updateOrCreate(
            ['user_id' => $user->id],
            ['token' => $validated['token'], 'device_id' => $validated['device_id']]
        );

        return $this->success('Firebase token stored successfully!', null, 200);
    }
}
