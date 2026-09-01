<?php

namespace App\Http\Controllers\API\Agent;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAgentListingRequest;
use App\Http\Resources\AgentResource;
use App\Models\AgentListingTemp;
use App\Models\Agents;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Stripe\StripeClient;

class AgentController extends Controller
{
    use ApiResponse;

    protected StripeClient $stripe;

    public function __construct()
    {
        $this->stripe = new StripeClient(config('stripe.secret'));
    }

    /**
     * Returns a hosted checkout URL — the frontend redirects the user there to pay.
     */
    public function createCheckoutSession(StoreAgentListingRequest $request): JsonResponse
    {
        $user = Auth::user();

        $agentPhotoPath = null;
        if ($request->hasFile('agent_photo')) {
            $agentPhotoPath = Helper::fileUpload(
                $request->file('agent_photo'),
                'agents/photos',
                time() . '_' . $request->file('agent_photo')->getClientOriginalName()
            );
        }

        $certifications = [];
        if ($request->has('certifications') && is_array($request->certifications)) {
            foreach ($request->certifications as $index => $cert) {
                $certFilePath = null;
                if ($request->hasFile("certifications.{$index}.file")) {
                    $certFile     = $request->file("certifications.{$index}.file");
                    $certFilePath = Helper::fileUpload(
                        $certFile,
                        'agents/certifications',
                        time() . '_' . $certFile->getClientOriginalName()
                    );
                }
                $certifications[] = [
                    'name' => $cert['name'] ?? null,
                    'file' => $certFilePath,
                ];
            }
        }

        // Build form data payload to persist temporarily until payment is confirmed
        $formData = [
            'agent_name'       => $request->agent_name,
            'agency_name'      => $request->agency_name,
            'agent_photo'      => $agentPhotoPath,
            'services'         => $request->services ?? [],
            'institution_name' => $request->institution_name,
            'degree'           => $request->degree,
            'graduation_year'  => $request->graduation_year,
            'certifications'   => $certifications,
            'address'          => $request->address,
            'phone_number'     => $request->phone_number,
            'email'            => $request->email ?? $user->email,
            'bio'              => $request->bio,
        ];

        $frontendUrl = rtrim(config('app.frontend_url', config('app.url')), '/');

        $session = $this->stripe->checkout->sessions->create([
            'mode'         => 'payment',
            'customer_email' => $user->email,
            'line_items'   => [
                [
                    'price_data' => [
                        'currency'     => 'usd',
                        'unit_amount'  => config('stripe.agent_listing_fee'),
                        'product_data' => [
                            'name'        => 'Agent Profile Listing',
                            'description' => 'One-time fee to list your agent profile in the directory.',
                        ],
                    ],
                    'quantity' => 1,
                ],
            ],
            'success_url'  => $frontendUrl . '/agent/listing-success?session_id={CHECKOUT_SESSION_ID}',
            'cancel_url'   => $frontendUrl . '/agent/listing-cancelled',
            'metadata'     => [
                'user_id'    => $user->id,
                'user_email' => $user->email,
                'type'       => 'agent_listing',
            ],
        ]);

        // Store form data temporarily — deleted after webhook confirms payment
        AgentListingTemp::updateOrCreate(
            ['user_id' => $user->id],
            [
                'stripe_session_id' => $session->id,
                'form_data'         => $formData,
                'payment_status'    => 'pending',
            ]
        );

        return $this->success('Checkout session created. Redirect the user to the checkout URL.', [
            'checkout_url' => $session->url,
        ]);
    }

    /**
     * Verify a completed session and create the agent listing.
     */
    public function verifySession(Request $request): JsonResponse
    {
        $request->validate([
            'session_id' => ['required', 'string'],
        ]);

        $user = Auth::user();

        $temp = AgentListingTemp::where('user_id', $user->id)
            ->where('stripe_session_id', $request->session_id)
            ->first();

        if (!$temp) {
            return $this->error('No pending listing found for this session.', 404);
        }

        // Already processed by webhook?
        if ($temp->payment_status === 'succeeded') {
            $agent = Agents::where('payment_intent_id', $request->session_id)
                ->orWhere('user_id', $user->id)
                ->whereIn('payment_status', ['succeeded', 'paid'])
                ->first();

            if ($agent) {
                return $this->success(
                    'Your agent listing is already active.',
                    new AgentResource($agent->load(['services', 'certifications']))
                );
            }
        }

        $session = $this->stripe->checkout->sessions->retrieve($request->session_id);

        if ($session->payment_status !== 'paid') {
            return $this->error(
                'Payment has not been completed yet. Status: ' . $session->payment_status,
                402
            );
        }

        $agent = $this->createAgentFromTemp($temp, $user->id, $session->payment_intent);

        return $this->success(
            'Your agent listing has been submitted successfully!',
            new AgentResource($agent->load(['services', 'certifications'])),
            201
        );
    }

    /**
     * Create an agent record from temp data.
     * Shared between webhook handler and verifySession fallback.
     */
    public static function createAgentFromTemp(AgentListingTemp $temp, int $userId, ?string $paymentIntentId = null): Agents
    {
        $data = $temp->form_data;

        $slug = Helper::makeSlug(Agents::class, $data['agent_name']);

        $agent = Agents::create([
            'user_id'           => $userId,
            'agent_name'        => $data['agent_name'],
            'agency_name'       => $data['agency_name'] ?? null,
            'agent_photo'       => $data['agent_photo'] ?? null,
            'slug'              => $slug,
            'institution_name'  => $data['institution_name'] ?? null,
            'degree'            => $data['degree'] ?? null,
            'graduation_year'   => $data['graduation_year'] ?? null,
            'address'           => $data['address'] ?? null,
            'phone_number'      => $data['phone_number'] ?? null,
            'email'             => $data['email'] ?? null,
            'background_info'   => $data['bio'] ?? null,
            'status'            => 'active',
            'payment_intent_id' => $paymentIntentId ?? $temp->stripe_session_id,
            'payment_status'    => 'succeeded',
        ]);

        // Create services
        if (!empty($data['services'])) {
            foreach ($data['services'] as $serviceName) {
                if ($serviceName) {
                    $agent->services()->create(['service_name' => $serviceName]);
                }
            }
        }

        // Create certifications
        if (!empty($data['certifications'])) {
            foreach ($data['certifications'] as $cert) {
                if (!empty($cert['name'])) {
                    $agent->certifications()->create([
                        'certificate_name' => $cert['name'],
                        'certificate_file' => $cert['file'] ?? null,
                    ]);
                }
            }
        }

        // Mark temp as processed and clean up
        $temp->update(['payment_status' => 'succeeded']);
        $temp->delete();

        return $agent;
    }

    /**
     * Get the authenticated user's agent profile.
     */
    public function myListing(): JsonResponse
    {
        $user  = Auth::user();
        $agent = Agents::where('user_id', $user->id)
            ->with(['services', 'certifications'])
            ->first();

        if (!$agent) {
            return $this->error('No agent listing found.', 404);
        }

        return $this->success('Agent listing retrieved successfully.', new AgentResource($agent));
    }
}
