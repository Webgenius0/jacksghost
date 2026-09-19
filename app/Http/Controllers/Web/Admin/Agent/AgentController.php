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
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

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
                'is_public',
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

        if ($request->filled('is_public') && $request->is_public !== 'all') {
            $query->where('is_public', filter_var($request->is_public, FILTER_VALIDATE_BOOLEAN));
        }

        $agents = $query->latest()->paginate($request->per_page ?? 15)->withQueryString();

        return Inertia::render('agent/index', [
            'agents'  => $agents,
            'filters' => $request->only(['search', 'status', 'is_public', 'per_page']),
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
            'is_public'             => 'nullable|boolean',
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
            'is_public'        => $request->boolean('is_public'),
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
            'is_public'        => 'nullable|boolean',
            'services'         => 'nullable|array',
            'services.*'       => 'nullable|string|max:255',
            'certifications'   => 'nullable|array',
            'certifications.*.name' => 'nullable|string|max:255',
            'certifications.*.file' => 'nullable|file|mimes:jpeg,png,jpg,pdf,webp|max:10240',
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
            'is_public'        => $request->boolean('is_public'),
            'agent_photo'      => $photoPath,
        ]);

        // Sync services
        if ($request->has('services')) {
            $agent->services()->delete();
            if (is_array($request->services)) {
                foreach ($request->services as $serviceName) {
                    if (!empty(trim((string)$serviceName))) {
                        $agent->services()->create([
                            'service_name' => trim($serviceName),
                        ]);
                    }
                }
            }
        }

        // Sync certifications
        if ($request->has('certifications')) {
            $submittedCerts = is_array($request->certifications) ? $request->certifications : [];
            $keptIds = [];

            foreach ($submittedCerts as $index => $cert) {
                $certName = $cert['name'] ?? null;
                if (empty(trim((string)$certName))) {
                    continue;
                }

                $certId = !empty($cert['id']) ? (int)$cert['id'] : null;
                $existingCert = $certId ? $agent->certifications()->find($certId) : null;
                $certFilePath = $existingCert ? $existingCert->certificate_file : null;

                if ($request->hasFile("certifications.{$index}.file")) {
                    if ($certFilePath && file_exists(public_path($certFilePath))) {
                        @unlink(public_path($certFilePath));
                    }
                    $uploadedFiles = $this->uploadToPublic($request->file("certifications.{$index}.file"), 'uploads/agents/certifications');
                    $certFilePath = $uploadedFiles[0] ?? null;
                }

                if ($existingCert) {
                    $existingCert->update([
                        'certificate_name' => trim($certName),
                        'certificate_file' => $certFilePath,
                    ]);
                    $keptIds[] = $existingCert->id;
                } else {
                    $newCert = $agent->certifications()->create([
                        'certificate_name' => trim($certName),
                        'certificate_file' => $certFilePath,
                    ]);
                    $keptIds[] = $newCert->id;
                }
            }

            // Delete removed certifications
            $removedCerts = $agent->certifications()->whereNotIn('id', $keptIds)->get();
            foreach ($removedCerts as $rem) {
                if ($rem->certificate_file && file_exists(public_path($rem->certificate_file))) {
                    @unlink(public_path($rem->certificate_file));
                }
                $rem->delete();
            }
        }

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
     * Toggle public visibility of an agent.
     */
    public function togglePublic(Request $request, Agents $agent): RedirectResponse
    {
        $agent->update([
            'is_public' => !$agent->is_public,
        ]);

        $state = $agent->is_public ? 'Public' : 'Private';
        return back()->with('success', "Agent visibility set to {$state}.");
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

    /**
     * Export agents to Excel (.xlsx).
     */
    public function export(Request $request)
    {
        $query = Agents::with(['services']);

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

        $agents = $query->latest()->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Agents');

        $headers = [
            'Agent Name',
            'Agency Name',
            'Email',
            'Phone Number',
            'Address',
            'Website',
            'Institution',
            'Degree',
            'Graduation Year',
            'Notable Clients',
            'Services',
            'Background Info',
            'Status',
            'Public Visibility',
        ];

        $columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

        foreach ($headers as $index => $header) {
            $sheet->setCellValue("{$columns[$index]}1", $header);
        }

        $sheet->getStyle('A1:N1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '1E293B'], // Slate 800
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(30);

        $rowIndex = 2;
        foreach ($agents as $agent) {
            $notableClients = is_array($agent->notable_client)
                ? implode(', ', $agent->notable_client)
                : ($agent->notable_client ?? '');

            $services = $agent->services->pluck('service_name')->filter()->implode(', ');

            $sheet->setCellValue("A{$rowIndex}", $agent->agent_name ?? '');
            $sheet->setCellValue("B{$rowIndex}", $agent->agency_name ?? '');
            $sheet->setCellValue("C{$rowIndex}", $agent->email ?? '');
            $sheet->setCellValue("D{$rowIndex}", $agent->phone_number ?? '');
            $sheet->setCellValue("E{$rowIndex}", $agent->address ?? '');
            $sheet->setCellValue("F{$rowIndex}", $agent->website_link ?? '');
            $sheet->setCellValue("G{$rowIndex}", $agent->institution_name ?? '');
            $sheet->setCellValue("H{$rowIndex}", $agent->degree ?? '');
            $sheet->setCellValue("I{$rowIndex}", $agent->graduation_year ?? '');
            $sheet->setCellValue("J{$rowIndex}", $notableClients);
            $sheet->setCellValue("K{$rowIndex}", $services);
            $sheet->setCellValue("L{$rowIndex}", $agent->background_info ?? '');
            $sheet->setCellValue("M{$rowIndex}", $agent->status ?? 'pending');
            $sheet->setCellValue("N{$rowIndex}", $agent->is_public ? 'Public' : 'Private');

            if ($rowIndex % 2 === 0) {
                $sheet->getStyle("A{$rowIndex}:N{$rowIndex}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F8FAFC'],
                    ],
                ]);
            }
            $sheet->getRowDimension($rowIndex)->setRowHeight(22);
            $rowIndex++;
        }

        foreach ($columns as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $fileName = 'agents_' . now()->format('Y_m_d_His') . '.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * Download sample Excel template for importing agents.
     */
    public function template()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Agents Template');

        $headers = [
            'Agent Name',
            'Agency Name',
            'Email',
            'Phone Number',
            'Address',
            'Website',
            'Institution',
            'Degree',
            'Graduation Year',
            'Notable Clients',
            'Services',
            'Background Info',
            'Status',
            'Public Visibility',
        ];

        $columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];

        foreach ($headers as $index => $header) {
            $sheet->setCellValue("{$columns[$index]}1", $header);
        }

        $sheet->getStyle('A1:N1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4F46E5'], // Indigo 600
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(30);

        $sampleData = [
            [
                'Scott Boras',
                'Boras Corporation',
                'sboras@borascorp.example',
                '+1 949-555-0100',
                'Newport Beach, California, USA',
                'https://borascorp.com',
                'University of the Pacific',
                'Pharm.D. & J.D.',
                '1982',
                'Bryce Harper, Gerrit Cole, Corey Seager',
                'Contract Negotiation, Brand Endorsement, Arbitration',
                'Premier baseball agent representing top tier MLB athletes worldwide.',
                'approved',
                'Public',
            ],
            [
                'Rich Paul',
                'Klutch Sports Group',
                'rpaul@klutchsports.example',
                '+1 310-555-0155',
                'Los Angeles, California, USA',
                'https://klutchsports.com',
                'Cleveland State University',
                'Business Administration',
                '2003',
                'LeBron James, Anthony Davis, Draymond Green',
                'Player Representation, Marketing, Media Production',
                'Founder of Klutch Sports Group and leading sports executive.',
                'approved',
                'Public',
            ],
        ];

        $rowIndex = 2;
        foreach ($sampleData as $row) {
            foreach ($row as $colIdx => $val) {
                $sheet->setCellValue("{$columns[$colIdx]}{$rowIndex}", $val);
            }
            $sheet->getRowDimension($rowIndex)->setRowHeight(22);
            $rowIndex++;
        }

        foreach ($columns as $col) {
            $sheet->getColumnDimension($col)->setAutoSize(true);
        }

        $fileName = 'agents_import_template.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * Import agents from an Excel / CSV file.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file'            => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
            'default_status'  => ['nullable', 'in:pending,approved,rejected'],
            'update_existing' => ['nullable'],
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $rawRows = $sheet->toArray(null, true, false, false);
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Failed to read file: ' . $e->getMessage());
        }

        if (empty($rawRows) || count($rawRows) < 2) {
            return redirect()->back()->with('error', 'The uploaded file is empty or missing data rows.');
        }

        $headerRow = array_shift($rawRows);
        $headerMap = [];

        foreach ($headerRow as $colIdx => $headerVal) {
            if ($headerVal === null || $headerVal === '') {
                continue;
            }
            $normalized = strtolower(trim(preg_replace('/[^a-zA-Z0-9]/', '', (string)$headerVal)));

            if (in_array($normalized, ['agentname', 'name', 'agent', 'fullname', 'playeragent'])) {
                $headerMap[$colIdx] = 'agent_name';
            } elseif (in_array($normalized, ['agencyname', 'agency', 'company', 'firm'])) {
                $headerMap[$colIdx] = 'agency_name';
            } elseif (in_array($normalized, ['email', 'emailaddress', 'mail'])) {
                $headerMap[$colIdx] = 'email';
            } elseif (in_array($normalized, ['phonenumber', 'phone', 'mobile', 'tel', 'cellphone'])) {
                $headerMap[$colIdx] = 'phone_number';
            } elseif (in_array($normalized, ['address', 'location', 'city', 'officeaddress'])) {
                $headerMap[$colIdx] = 'address';
            } elseif (in_array($normalized, ['websitelink', 'website', 'url', 'web', 'site'])) {
                $headerMap[$colIdx] = 'website_link';
            } elseif (in_array($normalized, ['institutionname', 'institution', 'university', 'college', 'school'])) {
                $headerMap[$colIdx] = 'institution_name';
            } elseif (in_array($normalized, ['degree', 'qualification', 'education'])) {
                $headerMap[$colIdx] = 'degree';
            } elseif (in_array($normalized, ['graduationyear', 'gradyear', 'yeargraduated'])) {
                $headerMap[$colIdx] = 'graduation_year';
            } elseif (in_array($normalized, ['notableclients', 'notableclient', 'clients', 'notableplayer', 'players'])) {
                $headerMap[$colIdx] = 'notable_client';
            } elseif (in_array($normalized, ['services', 'servicesprovided', 'service'])) {
                $headerMap[$colIdx] = 'services';
            } elseif (in_array($normalized, ['backgroundinfo', 'background', 'bio', 'description', 'info', 'about'])) {
                $headerMap[$colIdx] = 'background_info';
            } elseif (in_array($normalized, ['status', 'agentstatus'])) {
                $headerMap[$colIdx] = 'status';
            } elseif (in_array($normalized, ['ispublic', 'public', 'visibility', 'publicvisibility', 'publicstatus'])) {
                $headerMap[$colIdx] = 'is_public';
            }
        }

        if (!in_array('agent_name', $headerMap)) {
            return redirect()->back()->with('error', 'Could not find an "Agent Name" column in the uploaded file header.');
        }

        $updateExisting = filter_var($request->input('update_existing', true), FILTER_VALIDATE_BOOLEAN);
        $defaultStatus = $request->input('default_status', 'pending');

        $createdCount = 0;
        $updatedCount = 0;
        $skippedCount = 0;
        $errors = [];

        foreach ($rawRows as $rowIdx => $row) {
            $rowNum = $rowIdx + 2;

            $hasData = false;
            foreach ($row as $cell) {
                if ($cell !== null && trim((string)$cell) !== '') {
                    $hasData = true;
                    break;
                }
            }
            if (!$hasData) {
                continue;
            }

            $rowData = [];
            foreach ($headerMap as $colIdx => $key) {
                $rowData[$key] = isset($row[$colIdx]) ? trim((string)$row[$colIdx]) : null;
            }

            $agentName = $rowData['agent_name'] ?? null;
            if (empty($agentName)) {
                $errors[] = "Row {$rowNum}: Agent name is missing.";
                $skippedCount++;
                continue;
            }

            // Parse notable clients (comma separated)
            $notableClients = null;
            if (!empty($rowData['notable_client'])) {
                $parts = array_values(array_filter(array_map('trim', explode(',', $rowData['notable_client']))));
                if (!empty($parts)) {
                    $notableClients = $parts;
                }
            }

            // Parse status
            $status = $defaultStatus;
            if (!empty($rowData['status'])) {
                $rawStatus = strtolower(trim($rowData['status']));
                if (in_array($rawStatus, ['approved', 'pending', 'rejected'])) {
                    $status = $rawStatus;
                } elseif (in_array($rawStatus, ['active', 'verified'])) {
                    $status = 'approved';
                }
            }

            // Parse is_public
            $isPublic = ($status === 'approved');
            if (isset($rowData['is_public']) && $rowData['is_public'] !== '') {
                $rawPub = strtolower(trim((string)$rowData['is_public']));
                $isPublic = in_array($rawPub, ['1', 'true', 'yes', 'public', 'approved', 'y']);
            }

            $email = !empty($rowData['email']) ? $rowData['email'] : null;

            try {
                // Find existing agent by email or agent_name
                $existing = null;
                if ($email) {
                    $existing = Agents::where('email', $email)->first();
                }
                if (!$existing) {
                    $existing = Agents::where('agent_name', $agentName)->first();
                }

                if ($existing) {
                    if ($updateExisting) {
                        $existing->update([
                            'agency_name'      => $rowData['agency_name'] ?: $existing->agency_name,
                            'email'            => $email ?: $existing->email,
                            'phone_number'     => $rowData['phone_number'] ?: $existing->phone_number,
                            'address'          => $rowData['address'] ?: $existing->address,
                            'website_link'     => $rowData['website_link'] ?: $existing->website_link,
                            'institution_name' => $rowData['institution_name'] ?: $existing->institution_name,
                            'degree'           => $rowData['degree'] ?: $existing->degree,
                            'graduation_year'  => $rowData['graduation_year'] ?: $existing->graduation_year,
                            'background_info'  => $rowData['background_info'] ?: $existing->background_info,
                            'notable_client'   => $notableClients ?: $existing->notable_client,
                            'status'           => $status ?: $existing->status,
                            'is_public'        => isset($rowData['is_public']) ? $isPublic : $existing->is_public,
                        ]);
                        $agentRecord = $existing;
                        $updatedCount++;
                    } else {
                        $skippedCount++;
                        continue;
                    }
                } else {
                    $slug = Helper::makeSlug(Agents::class, $agentName);
                    $agentRecord = Agents::create([
                        'agent_name'       => $agentName,
                        'slug'             => $slug,
                        'agency_name'      => $rowData['agency_name'] ?? null,
                        'email'            => $email,
                        'phone_number'     => $rowData['phone_number'] ?? null,
                        'address'          => $rowData['address'] ?? null,
                        'website_link'     => $rowData['website_link'] ?? null,
                        'institution_name' => $rowData['institution_name'] ?? null,
                        'degree'           => $rowData['degree'] ?? null,
                        'graduation_year'  => $rowData['graduation_year'] ?? null,
                        'background_info'  => $rowData['background_info'] ?? null,
                        'notable_client'   => $notableClients,
                        'status'           => $status,
                        'is_public'        => $isPublic,
                    ]);
                    $createdCount++;
                }

                // Sync services if provided
                if (!empty($rowData['services']) && $agentRecord) {
                    $servicesList = array_filter(array_map('trim', explode(',', $rowData['services'])));
                    foreach ($servicesList as $sName) {
                        if (!empty($sName)) {
                            $agentRecord->services()->firstOrCreate(['service_name' => $sName]);
                        }
                    }
                }
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum} ({$agentName}): " . $e->getMessage();
                $skippedCount++;
            }
        }

        $message = "Import complete! Added {$createdCount} new agent(s), updated {$updatedCount} agent(s).";
        if ($skippedCount > 0 && empty($errors)) {
            $message .= " Skipped {$skippedCount} existing agent(s).";
        }

        return redirect()->back()
            ->with('success', $message)
            ->with('import_errors', !empty($errors) ? array_slice($errors, 0, 20) : null);
    }
}
