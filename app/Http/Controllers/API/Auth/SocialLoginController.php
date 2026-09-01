<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Http;

class SocialLoginController extends Controller
{
    use ApiResponse;

    public function socialLogin(Request $request)
    {
        $request->validate([
            'provider' => 'required|in:google,apple',
            'token' => 'required',
        ]);

        try {
            if ($request->provider === 'google') {
                $socialUser = Socialite::driver('google')->stateless()->userFromToken($request->token);
            }else {
                return $this->error('Unsupported provider', 422);
            }

            if ($socialUser) {
                $user = User::where('email', $socialUser->email)->first();
                if (!$user) {
                    $password = Str::random(16);

                    $timezone = $this->detectTimezone($request);

                    $user = User::create([
                        'name'              => $socialUser->getName() ?? "User",
                        'email'             => $socialUser->email,
                        'password'          => Hash::make($password),
                        'avatar'            => $socialUser->getAvatar() ?? null,
                        'email_verified_at' => now(),
                        'provider'          => $request->provider,
                        'provider_id'       => $socialUser->getId() ?? null,
                        'role'              => 'User',
                        'timezone'          => $timezone ?? 'UTC',
                    ]);
                }
                Auth::login($user);
                $token = $user->createToken('AuthToken')->plainTextToken;

                return response()->json([
                    'status' => 200,
                    'message' => 'Login Successful',
                    'token_type' => 'Bearer',
                    'token' => $token,
                    'data' => $user
                ]);

            } else {

                return $this->error('Invalid or Expired Token', 401);
            }
        } catch (Exception $e) {
            \Log::error('Social login failed: ' . $e->getMessage());
            return $this->error('Something went wrong', 500);
        }
    }

    public function redirectCallbackApple()
    {
        return $this->ok('You are now logged in');
    }


    private function detectTimezone(Request $request): string
    {
        try {
            $ip = $request->ip();

            // Localhost / testing
            if ($ip === '127.0.0.1' || $ip === '::1') {
                return 'Asia/Dhaka';
            }

            $response = Http::timeout(5)
                ->get("http://ip-api.com/json/{$ip}?fields=status,timezone");

            if (
                $response->successful() &&
                $response->json('status') === 'success' &&
                $response->json('timezone')
            ) {
                return $response->json('timezone');
            }

        } catch (\Exception $e) {
            // ignore
        }

        return 'UTC';
    }


}
