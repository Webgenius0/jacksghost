<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SystemSettingController extends Controller
{
    /**
     * Display the system settings page.
     *
     * @return Response
     */
    public function edit(): Response {
        $settings = SystemSetting::first();
        return Inertia::render('settings/systemSetting', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update the system settings.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function update(Request $request): RedirectResponse {
        $request->validate([
            'title'               => 'nullable|string|max:255',
            'email'               => 'nullable|email|max:255',
            'system_name'         => 'nullable|string|max:255',
            'copyright_text'      => 'nullable|string|max:255',
            'number'              => 'nullable|string|max:20',
            'address'             => 'nullable|string',
            'description'         => 'nullable|string',
            'agent_listing_fee'   => 'nullable|numeric|min:0',
            'subscription_fee'    => 'nullable|numeric|min:0',
            // hasFile() is true ONLY when an actual binary upload is present.
            // A plain URL string (unchanged field) returns false, so it falls
            // back to 'nullable' and the rule is skipped entirely.
            'logo'                => $request->hasFile('logo')
                                        ? 'image|max:2048'
                                        : 'nullable',
            'favicon'             => $request->hasFile('favicon')
                                        ? 'image|max:1024'
                                        : 'nullable',
        ]);

        try {
            $setting = SystemSetting::firstOrNew();
            $setting->title          = $request->title;
            $setting->email          = $request->email;
            $setting->system_name    = $request->system_name;
            $setting->copyright_text = $request->copyright_text;
            $setting->number         = $request->number;
            $setting->address        = $request->address;
            $setting->description    = $request->description;
            $setting->agent_listing_fee = $request->agent_listing_fee ?? 0.00;
            $setting->subscription_fee  = $request->subscription_fee ?? 0.00;

            if ($request->hasFile('logo')) {
                if ($setting->logo && Storage::disk('public')->exists($setting->logo)) {
                    Storage::disk('public')->delete($setting->logo);
                }
                $logo = $request->file('logo');
                $logoName = time() . '_' . str_replace(' ', '_', $logo->getClientOriginalName());
                $setting->logo = $logo->storeAs('uploads/logo', $logoName, 'public');
            }

            if ($request->hasFile('favicon')) {
                if ($setting->favicon && Storage::disk('public')->exists($setting->favicon)) {
                    Storage::disk('public')->delete($setting->favicon);
                }
                $favicon = $request->file('favicon');
                $faviconName = time() . '_' . str_replace(' ', '_', $favicon->getClientOriginalName());
                $setting->favicon = $favicon->storeAs('uploads/favicon', $faviconName, 'public');
            }

            $setting->save();
            return back()->with('success', 'Updated successfully');
        } catch (Exception $e) {
            return back()->with('error', 'Failed to update: ' . $e->getMessage());
        }
    }
}
