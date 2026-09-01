<?php

namespace App\Http\Controllers\API\Auth;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use App\Models\UserSession;

class LoginController extends Controller
{

    use ApiResponse;

    public function login(Request $request)
    {
        $request->merge([
            'remember_token' => filter_var($request->remember_token, FILTER_VALIDATE_BOOLEAN),
        ]);

        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if (!Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            return Helper::jsonErrorResponse('The provided credentials do not match our records.', 401, [
                'email' => 'The provided credentials do not match our records.'
            ]);
        }

        if (Auth::user()->email_verified_at === null) {
            return Helper::jsonErrorResponse('Email not verified.', 403, []);
        }


        $user = Auth::user();

        // handle nullable remember_token
        if ($request->remember_token) {
            $user->setRememberToken(Str::random(60));
        }

        $user->save();

        $platform = request()->header('Platform', 'unknown');
        $tokenResult = $user->createToken('AuthToken');
        // $session = UserSession::create([
        //     'user_id' => $user->id,
        //     'platform' => $platform,
        //     'login_at' => now(),
        //     'last_activity' => now(),
        //     'duration' => 0,
        //     'token_id' => $tokenResult->accessToken->id,
        // ]);

        return response()->json([
            'status' => 200,
            'message' => 'Login Successful',
            'token_type' => 'Bearer',
            'token' => $tokenResult->plainTextToken,
            // 'session_id' => $session->id,
            'data' => $user
        ]);
    }

    public function logout(Request $request)
    {
        try {
            // $user = $request->user();
            // $token = $user->currentAccessToken();

            // if ($token) {
            //     UserSession::where('token_id', $token->id)->update([
            //         'logout_at' => now()
            //     ]);
            //     $token->delete();
            // }

            // return $this->ok('Logged out successfully.');

            // Revoke the current user’s token
            $request->user()->currentAccessToken()->delete();
            // Return a response indicating the user was logged out
            return $this->success('Logged out successfully.', [], 200);
        } catch (\Exception $exception) {
            return $this->error($exception->getMessage(), 500);
        }
    }

}
