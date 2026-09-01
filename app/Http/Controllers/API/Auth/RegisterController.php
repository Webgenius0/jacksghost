<?php

namespace App\Http\Controllers\API\Auth;


use App\Helpers\Helper;
use App\Models\QuestPreference;
use App\Notifications\AdminNotification;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use App\Models\User;
use Ichtrojan\Otp\Otp; // Unused after transition to link-based verification
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Http;



class RegisterController extends Controller
{
    use ApiResponse;

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'password' => 'required|min:6|confirmed',
        ]);

        $exists = User::where('email', $request->email)->first();

        if ($exists) {
            if ($exists->email_verified_at !== null) {
                return $this->error('Email already verified', 400);
            }

            // Resend OTP instead of creating new user
            $otp = (new Otp)->generate($request->email, 'numeric', 6, 60);

            // Mail::to($exists->email)->send(new EmailVerification($otp->token, $exists));
            \Mail::to($exists->email)->send(new \App\Mail\OTP($otp->token, $exists, "Verify your email address", "verify"));


            return $this->success('Otp sent to your email successfully', ['otp' => $otp->token, 'user' => $exists], 201);
        }

        DB::beginTransaction();
        try {

            $timezone = $this->detectTimezone($request);
            // Create user
            $user = User::create([
                'name'          => $request->name,
                'email'         => $request->email,
                'password'      => Hash::make($request->password),
                'timezone'      => $timezone ?? 'UTC',
                'role'          => 'User',
            ]);

            // Send OTP
            $otp = $this->send_otp($user);

            if (!$otp) {
                throw new \Exception('Failed to send OTP.');
            }
            // $tokenResult = $user->createToken('AuthToken');


            DB::commit();
            return response()->json([
                'status'  => 200,
                'message' => 'Otp sent to your email successfully',
                'otp'     => $otp->token,
                // 'token_type' => 'Bearer',
                // 'token' => $tokenResult->plainTextToken,
                'data' => $user
            ]);
            // return $this->success('Registered successfully.', ['token' => $tokenResult->plainTextToken, 'token_type' => 'Bearer', 'data' => $user], 201);
        } catch (\Exception $exception) {
            DB::rollBack();
            return $this->error($exception->getMessage(), 500);
        }
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

    public function send_otp(User $user, $mailType = 'verify')
    {
        $otp  = (new Otp)->generate($user->email, 'numeric', 6, 60);
        $message = $mailType === 'verify' ? 'Verify Your Email Address' : 'Reset Your Password';
        \Mail::to($user->email)->send(new \App\Mail\OTP($otp->token, $user, $message, $mailType));
        return $otp;
    }

    public function resend_otp(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
        ]);

        try {
            $user = User::where('email', $request->email)->first();
            if ($user) {
                $otp = $this->send_otp($user);
                return $this->success('OTP send successfully.', ['otp' => $otp->token], 201);
            } else {
                return $this->error('Email not found', 404);
            }
        } catch (\Exception $exception) {
            return $this->error($exception->getMessage(), 500);
        }
    }

    public function verify_otp(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'otp' => 'required|string|digits:6',
        ]);
        try {
            $user = User::where('email', $request->email)->first();
            if (!$user) {
                return $this->error('Email not found', 404);
            }

            if ($user->email_verified_at !== null) {
                return $this->error('Email already verified', 404);
            }

            $verify = (new Otp)->validate($request->email, $request->otp);
            if ($verify->status) {
                $user->email_verified_at = now();
                $user->save();

                return response()->json([
                    'status' => 200,
                    'message' => 'Email verified successfully',
                    'token_type' => 'Bearer',
                    'token' => $user->createToken('AuthToken')->plainTextToken,
                    'data' => $user
                ]);
            } else {
                return $this->error($verify->message, 404);
            }
        } catch (\Exception $exception) {
            return $this->error($exception->getMessage(), 500);
        }
    }

    public function forgot_password(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        try {
            $user = User::where('email', $request->email)->first();
            if (!$user) {
                return $this->error('User not found', 404);
            }
            $otp = $this->send_otp($user, 'forget');
            return $this->success('OTP send to your email successfully.', ['otp' => $otp->token], 201);
        } catch (\Exception $exception) {
            return $this->error($exception->getMessage(), 500);
        }
    }

    public function forgot_verify_otp(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'otp' => 'required|string|digits:6',
        ]);

        $verify = (new Otp)->validate($request->email, $request->otp);
        if ($verify->status) {
            $user = User::where('email', $request->email)->first();
            if (!$user) {
                return Helper::jsonErrorResponse('Email not found', 404);
            }
            $user->reset_code = \Str::random(40);
            $user->reset_code_expires_at = Carbon::now()->addDays(1);
            $user->save();
            return $this->success('OTP verified successfully', [
                'token' => $user->reset_code,
            ], 201);
        } else {
            return $this->error($verify->message, 404);
        }
    }

    public function reset_password(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'password' => 'required|string|confirmed',
        ]);

        try {
            $user = User::where('reset_code', $request->token)->first();

            if (!$user) {
                return $this->error('Invalid Token', 404);
            }

            if ($user->reset_code_expires_at < Carbon::now()) {
                return $this->error('Token expired', 404);
            }

            $user->password = Hash::make($request->password);
            $user->reset_code = null;
            $user->reset_code_expires_at = null;
            $user->save();

            return $this->ok('Password reset successfully');
        } catch (\Exception $exception) {
            return $this->error($exception->getMessage(), 404);
        }
    }
}
