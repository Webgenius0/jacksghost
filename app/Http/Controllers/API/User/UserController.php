<?php

namespace App\Http\Controllers\API\User;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Subscription;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\ChangePasswordRequest;

class UserController extends Controller
{
    use ApiResponse;

    public function userProfile()
    {
        $user = User::where('id', auth()->user()->id)->first();
        $user->is_subscribed = $this->getStatus();

        return $this->success('Profile info retrieve successfully', new UserResource($user), 200);
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = Auth::user();

        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Helper::fileDelete($user->avatar);
            }
            $data['avatar'] = Helper::fileUpload(
                $request->file('avatar'),
                'avatar',
                time() . '_' . $request->file('avatar')->getClientOriginalName()
            );
        }

        $user->update($data);

        return $this->success(
            'Profile info updated successfully',
            new UserResource($user->fresh()),
            200
        );
    }

    public function changePassword(ChangePasswordRequest $request)
    {
        $user = auth()->user();

        if (!Hash::check($request->old_password, $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return $this->success('Password changed successfully', [], 200);
    }

    public function accountDelete(Request $request)
    {
        $user = Auth::user();

        $user->delete();

        return $this->success('Account deleted successfully', [], 200);
    }


    public function getStatus(): bool
    {
        $user = Auth::user();

        $subscription = Subscription::where('user_id', $user->id)
            ->latest()
            ->first();

        if (!$subscription) {
            return false;
        }

        if (
            $subscription->subscription_status === 'active' &&
            $subscription->subscription_expire_date &&
            $subscription->subscription_expire_date->isPast()
        ) {
            $subscription->update([
                'subscription_status' => 'expired',
            ]);

            $subscription->refresh();
        }

        $isActive = $subscription->subscription_status === 'active'
            && $subscription->subscription_expire_date
            && $subscription->subscription_expire_date->isFuture();


        return $isActive;
    }
}
