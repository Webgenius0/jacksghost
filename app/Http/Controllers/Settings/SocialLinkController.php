<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\SocialLink;
use Illuminate\Http\Request;
use Exception;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SocialLinkController extends Controller
{
    /**
     * Display the social links settings page.
     *
     * @return Response
     */
    public function edit(): Response {
        $socialLink = SocialLink::first();
        return Inertia::render('settings/socialLink', [
            'socialLink' => $socialLink,
        ]);
    }

    /**
     * Update the social links.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function update(Request $request): RedirectResponse {
        $request->validate([
            'facebook_link'  => 'nullable|url|max:255',
            'instagram_link' => 'nullable|url|max:255',
            'twitter_link'   => 'nullable|url|max:255',
            'tiktok_link'    => 'nullable|url|max:255',
            'linkedin_link'  => 'nullable|url|max:255',
            'github_link'    => 'nullable|url|max:255',
            'youtube_link'   => 'nullable|url|max:255',
        ]);

        try {
            $socialLink = SocialLink::firstOrNew();
            $socialLink->facebook_link  = $request->facebook_link;
            $socialLink->instagram_link = $request->instagram_link;
            $socialLink->twitter_link   = $request->twitter_link;
            $socialLink->tiktok_link    = $request->tiktok_link;
            $socialLink->linkedin_link  = $request->linkedin_link;
            $socialLink->github_link    = $request->github_link;
            $socialLink->youtube_link   = $request->youtube_link;

            $socialLink->save();
            return back()->with('success', 'Social links updated successfully');
        } catch (Exception $e) {
            return back()->with('error', 'Failed to update: ' . $e->getMessage());
        }
    }
}
