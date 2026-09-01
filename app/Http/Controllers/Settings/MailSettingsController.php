<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\File;

class MailSettingsController extends Controller
{
    public function edit()
    {
        return Inertia::render('settings/mail', [
            'mailConfig' => [
                'MAIL_MAILER' => env('MAIL_MAILER', ''),
                'MAIL_HOST' => env('MAIL_HOST', ''),
                'MAIL_PORT' => env('MAIL_PORT', ''),
                'MAIL_USERNAME' => env('MAIL_USERNAME', ''),
                'MAIL_PASSWORD' => env('MAIL_PASSWORD', ''),
                'MAIL_ENCRYPTION' => env('MAIL_ENCRYPTION', ''),
                'MAIL_FROM_ADDRESS' => env('MAIL_FROM_ADDRESS', ''),
            ]
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'MAIL_MAILER' => 'nullable|string',
            'MAIL_HOST' => 'nullable|string',
            'MAIL_PORT' => 'nullable|string',
            'MAIL_USERNAME' => 'nullable|string',
            'MAIL_PASSWORD' => 'nullable|string',
            'MAIL_ENCRYPTION' => 'nullable|string',
            'MAIL_FROM_ADDRESS' => 'nullable|email',
        ]);

        $this->updateEnvFile($validated);

        Artisan::call('config:clear');

        return back()->with('status', 'mail-settings-updated');
    }

    private function updateEnvFile(array $data)
    {
        $envPath = base_path('.env');
        if (File::exists($envPath)) {
            $envContent = File::get($envPath);

            foreach ($data as $key => $value) {
                if (is_null($value)) {
                    $value = '';
                }
                $value = trim($value, '"');
                if (preg_match("/^{$key}=/m", $envContent)) {
                    $envContent = preg_replace(
                        "/^{$key}=.*/m",
                        "{$key}=" . (preg_match('/\s/', $value) ? "\"{$value}\"" : $value),
                        $envContent
                    );
                } else {
                    $envContent .= "\n{$key}=" . (preg_match('/\s/', $value) ? "\"{$value}\"" : $value);
                }
            }

            File::put($envPath, $envContent);
        }
    }
}
