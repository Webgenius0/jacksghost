<?php

namespace App\Http\Controllers\Web\Admin\Agent;

use App\Helpers\Helper;
use App\Http\Controllers\Controller;
use App\Models\Agents;
use App\Traits\FileManager;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AgentController extends Controller
{
    use FileManager;

    /**
     * List all agents with search and status filter.
     */
    public function index(Request $request): Response
    {
        $query = Agents::with(['payment'])
            ->select([
                'id',
                'agent_name',
                'agency_name',
                'email',
                'phone_number',
                'agent_photo',
                'status',
                'created_at',
            ]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('agent_name', 'like', "%{$search}%")
                  ->orWhere('agency_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $agents = $query->latest()->paginate($request->per_page ?? 15)->withQueryString();

        return Inertia::render('agent/index', [
            'agents'  => $agents,
            'filters' => $request->only(['search', 'status', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new agent.
     */
    public function create(): Response
    {
        return Inertia::render('agent/create');
    }

    /**
     * Store a newly created agent in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $rules = [
            'agent_name'            => 'required|string|max:255',
            'agency_name'           => 'nullable|string|max:255',
            'email'                 => 'nullable|email|max:255',
            'phone_number'          => 'nullable|string|max:30',
            'address'               => 'nullable|string',
            'website_link'          => 'nullable|string|max:255',
            'institution_name'      => 'nullable|string|max:255',
            'degree'                => 'nullable|string|max:255',
            'graduation_year'       => 'nullable|string|max:10',
            'background_info'       => 'nullable|string',
            'notable_client'        => 'nullable',
            'status'                => 'required|in:pending,approved,rejected',
            'agent_photo'           => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'services'              => 'nullable|array',
            'services.*'            => 'nullable|string|max:255',
            'certifications'        => 'nullable|array',
            'certifications.*.name' => 'nullable|string|max:255',
            'certifications.*.file' => 'nullable|file|mimes:jpeg,png,jpg,pdf,webp|max:10240',
        ];

        $request->validate($rules);

        $photoPath = null;
        if ($request->hasFile('agent_photo')) {
            $paths = $this->uploadToPublic($request->file('agent_photo'), 'uploads/agents/photos');
            $photoPath = $paths[0] ?? null;
        }

        $notableClients = $request->notable_client;
        if (is_string($notableClients)) {
            $decoded = json_decode($notableClients, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $notableClients = $decoded;
            } elseif (trim($notableClients) !== '') {
                $notableClients = array_values(array_filter(array_map('trim', explode(',', $notableClients))));
            } else {
                $notableClients = null;
            }
        } elseif (!is_array($notableClients)) {
            $notableClients = null;
        }

        $slug = Helper::makeSlug(Agents::class, $request->agent_name);

        $agent = Agents::create([
            'agent_name'       => $request->agent_name,
            'slug'             => $slug,
            'agency_name'      => $request->agency_name,
            'email'            => $request->email,
            'phone_number'     => $request->phone_number,
            'address'          => $request->address,
            'website_link'     => $request->website_link,
            'institution_name' => $request->institution_name,
            'degree'           => $request->degree,
            'graduation_year'  => $request->graduation_year,
            'background_info'  => $request->background_info,
            'notable_client'   => $notableClients,
            'status'           => $request->status,
            'agent_photo'      => $photoPath,
        ]);

        // Create services
        if ($request->has('services') && is_array($request->services)) {
            foreach ($request->services as $serviceName) {
                if (!empty(trim((string)$serviceName))) {
                    $agent->services()->create([
                        'service_name' => trim($serviceName),
                    ]);
                }
            }
        }

        // Create certifications
        if ($request->has('certifications') && is_array($request->certifications)) {
            foreach ($request->certifications as $index => $cert) {
                $certName = $cert['name'] ?? null;
                if (!empty(trim((string)$certName))) {
                    $certFilePath = null;
                    if ($request->hasFile("certifications.{$index}.file")) {
                        $uploadedFiles = $this->uploadToPublic($request->file("certifications.{$index}.file"), 'uploads/agents/certifications');
                        $certFilePath = $uploadedFiles[0] ?? null;
                    }
                    $agent->certifications()->create([
                        'certificate_name' => trim($certName),
                        'certificate_file' => $certFilePath,
                    ]);
                }
            }
        }

        return redirect()->route('agents.index')->with('success', 'Agent created successfully!');
    }

    /**
     * Show full agent detail.
     */
    public function show(Agents $agent): Response
    {
        $agent->load(['certifications', 'services', 'payment']);

        return Inertia::render('agent/show', [
            'agent' => $agent,
        ]);
    }

    /**
     * Edit form for an agent.
     */
    public function edit(Agents $agent): Response
    {
        $agent->load(['certifications', 'services']);

        return Inertia::render('agent/edit', [
            'agent' => $agent,
        ]);
    }

    /**
     * Update agent record.
     */
    public function update(Request $request, Agents $agent): RedirectResponse
    {
        $rules = [
            'agent_name'       => 'required|string|max:255',
            'agency_name'      => 'nullable|string|max:255',
            'email'            => 'nullable|email|max:255',
            'phone_number'     => 'nullable|string|max:30',
            'address'          => 'nullable|string',
            'website_link'     => 'nullable|string|max:255',
            'institution_name' => 'nullable|string|max:255',
            'degree'           => 'nullable|string|max:255',
            'graduation_year'  => 'nullable|string|max:10',
            'background_info'  => 'nullable|string',
            'notable_client'   => 'nullable',
            'status'           => 'required|in:pending,approved,rejected',
        ];

        if ($request->hasFile('agent_photo')) {
            $rules['agent_photo'] = 'image|mimes:jpeg,png,jpg,gif,webp|max:3072';
        }

        $request->validate($rules);

        $photoPath = $agent->getRawOriginal('agent_photo');

        if ($request->hasFile('agent_photo')) {
            // Delete old photo
            if ($photoPath && file_exists(public_path($photoPath))) {
                @unlink(public_path($photoPath));
            }
            $paths = $this->uploadToPublic($request->file('agent_photo'), 'uploads/agents/photos');
            $photoPath = $paths[0] ?? $photoPath;
        }

        $notableClients = $request->notable_client;
        if (is_string($notableClients)) {
            $decoded = json_decode($notableClients, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $notableClients = $decoded;
            } elseif (trim($notableClients) !== '') {
                $notableClients = array_values(array_filter(array_map('trim', explode(',', $notableClients))));
            } else {
                $notableClients = null;
            }
        } elseif (!is_array($notableClients)) {
            $notableClients = null;
        }

        $agent->update([
            'agent_name'       => $request->agent_name,
            'agency_name'      => $request->agency_name,
            'email'            => $request->email,
            'phone_number'     => $request->phone_number,
            'address'          => $request->address,
            'website_link'     => $request->website_link,
            'institution_name' => $request->institution_name,
            'degree'           => $request->degree,
            'graduation_year'  => $request->graduation_year,
            'background_info'  => $request->background_info,
            'notable_client'   => $notableClients,
            'status'           => $request->status,
            'agent_photo'      => $photoPath,
        ]);

        return redirect()->route('agents.index')->with('success', 'Agent updated successfully!');
    }

    /**
     * Approve / reject / set pending a single agent.
     */
    public function updateStatus(Request $request, Agents $agent): RedirectResponse
    {
        $request->validate([
            'status' => 'required|in:pending,approved,rejected',
        ]);

        $agent->update(['status' => $request->status]);

        return back()->with('success', 'Agent status updated to ' . ucfirst($request->status) . '.');
    }

    /**
     * Delete an agent and their photo.
     */
    public function destroy(Agents $agent): RedirectResponse
    {
        $photoPath = $agent->getRawOriginal('agent_photo');
        if ($photoPath && file_exists(public_path($photoPath))) {
            @unlink(public_path($photoPath));
        }

        // Clean up certificate files
        foreach ($agent->certifications as $cert) {
            if ($cert->certificate_file && file_exists(public_path($cert->certificate_file))) {
                @unlink(public_path($cert->certificate_file));
            }
        }

        $agent->delete();

        return redirect()->route('agents.index')->with('success', 'Agent deleted successfully!');
    }
}
