<?php

namespace App\Http\Controllers\Web\Admin\League;

use App\Http\Controllers\Controller;
use App\Models\Agents;
use App\Models\DraftPlayer;
use App\Models\League;
use App\Models\Year;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class DraftPlayerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search    = $request->input('search');
        $leagueId  = $request->input('league_id');
        $yearValue = $request->input('year');

        $query = DraftPlayer::with(['league']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhereRaw("CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')) LIKE ?", ["%{$search}%"])
                    ->orWhere('position', 'like', "%{$search}%")
                    ->orWhere('current_team', 'like', "%{$search}%")
                    ->orWhere('draft_team', 'like', "%{$search}%")
                    ->orWhere('school', 'like', "%{$search}%")
                    ->orWhere('agent_name', 'like', "%{$search}%")
                    ->orWhere('agency_name', 'like', "%{$search}%")
                    ->orWhere('nationality', 'like', "%{$search}%");
            });
        }

        if ($leagueId) {
            $query->where('league_id', $leagueId);
        }

        if ($yearValue) {
            $query->where('year', $yearValue);
        }

        $draftPlayers = $query->latest()->paginate($request->input('per_page', 10))->withQueryString();

        $leagues = League::select('id', 'league_name')
            ->where('is_draft_pick', true)
            ->orderBy('league_name')
            ->get();

        $years = Year::select('id', 'year')
            ->orderBy('year', 'desc')
            ->get();

        return Inertia::render('draft-player/index', [
            'draftPlayers' => $draftPlayers,
            'leagues'      => $leagues,
            'years'        => $years,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $leagues = League::select('id', 'league_name')
            ->where('is_draft_pick', true)
            ->orderBy('league_name')
            ->get();

        $years = Year::select('id', 'year')
            ->orderBy('year', 'desc')
            ->get();

        return Inertia::render('draft-player/create', [
            'leagues' => $leagues,
            'years'   => $years,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'league_id'    => ['required', 'exists:leagues,id'],
            'year'         => ['required', 'integer', 'exists:years,year'],
            'round'        => ['nullable', 'integer', 'min:1'],
            'pick'         => ['nullable', 'integer', 'min:1'],
            'first_name'   => ['required', 'string', 'max:255'],
            'last_name'    => ['nullable', 'string', 'max:255'],
            'position'     => ['nullable', 'string', 'max:100'],
            'current_team' => ['nullable', 'string', 'max:255'],
            'draft_team'   => ['nullable', 'string', 'max:255'],
            'school'       => ['nullable', 'string', 'max:255'],
            'agent_name'   => ['nullable', 'string', 'max:255'],
            'agency_name'  => ['nullable', 'string', 'max:255'],
            'height'       => ['nullable', 'string', 'max:20'],
            'weight'       => ['nullable', 'string', 'max:20'],
            'birthdate'    => ['nullable', 'date'],
            'nationality'  => ['nullable', 'string', 'max:100'],
            'status'       => ['nullable', 'string', 'max:50'],
        ]);

        $fullName = trim("{$request->first_name} {$request->last_name}");

        DraftPlayer::create([
            'league_id'    => $request->league_id,
            'year'         => $request->year,
            'round'        => $request->round,
            'pick'         => $request->pick,
            'first_name'   => $request->first_name,
            'last_name'    => $request->last_name,
            'position'     => $request->position,
            'current_team' => $request->current_team,
            'draft_team'   => $request->draft_team,
            'school'       => $request->school,
            'slug'         => Str::slug($fullName ?: $request->first_name),
            'agent_name'   => $request->agent_name,
            'agency_name'  => $request->agency_name,
            'height'       => $request->height,
            'weight'       => $request->weight,
            'birthdate'    => $request->birthdate,
            'nationality'  => $request->nationality,
            'status'       => $request->status ?? 'unsigned_draft',
        ]);

        return redirect()->route('draft-player.index')->with('success', 'Draft player created successfully!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(DraftPlayer $draftPlayer)
    {
        $leagues = League::select('id', 'league_name')
            ->where('is_draft_pick', true)
            ->orderBy('league_name')
            ->get();

        $years = Year::select('id', 'year')
            ->orderBy('year', 'desc')
            ->get();

        return Inertia::render('draft-player/edit', [
            'draftPlayer' => $draftPlayer,
            'leagues'     => $leagues,
            'years'       => $years,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, DraftPlayer $draftPlayer)
    {
        $request->validate([
            'league_id'    => ['required', 'exists:leagues,id'],
            'year'         => ['required', 'integer', 'exists:years,year'],
            'round'        => ['nullable', 'integer', 'min:1'],
            'pick'         => ['nullable', 'integer', 'min:1'],
            'first_name'   => ['required', 'string', 'max:255'],
            'last_name'    => ['nullable', 'string', 'max:255'],
            'position'     => ['nullable', 'string', 'max:100'],
            'current_team' => ['nullable', 'string', 'max:255'],
            'draft_team'   => ['nullable', 'string', 'max:255'],
            'school'       => ['nullable', 'string', 'max:255'],
            'agent_name'   => ['nullable', 'string', 'max:255'],
            'agency_name'  => ['nullable', 'string', 'max:255'],
            'height'       => ['nullable', 'string', 'max:20'],
            'weight'       => ['nullable', 'string', 'max:20'],
            'birthdate'    => ['nullable', 'date'],
            'nationality'  => ['nullable', 'string', 'max:100'],
            'status'       => ['nullable', 'string', 'max:50'],
        ]);

        $fullName = trim("{$request->first_name} {$request->last_name}");

        $draftPlayer->update([
            'league_id'    => $request->league_id,
            'year'         => $request->year,
            'round'        => $request->round,
            'pick'         => $request->pick,
            'first_name'   => $request->first_name,
            'last_name'    => $request->last_name,
            'position'     => $request->position,
            'current_team' => $request->current_team,
            'draft_team'   => $request->draft_team,
            'school'       => $request->school,
            'slug'         => Str::slug($fullName ?: $request->first_name),
            'agent_name'   => $request->agent_name,
            'agency_name'  => $request->agency_name,
            'height'       => $request->height,
            'weight'       => $request->weight,
            'birthdate'    => $request->birthdate,
            'nationality'  => $request->nationality,
            'status'       => $request->status ?? 'unsigned_draft',
        ]);

        return redirect()->route('draft-player.index')->with('success', 'Draft player updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(DraftPlayer $draftPlayer)
    {
        $draftPlayer->delete();

        return redirect()->back()->with('success', 'Draft player deleted successfully!');
    }

    /**
     * Export draft players to Excel (.xlsx).
     */
    public function export(Request $request)
    {
        $query = DraftPlayer::with(['league']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhereRaw("CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')) LIKE ?", ["%{$search}%"])
                    ->orWhere('position', 'like', "%{$search}%")
                    ->orWhere('current_team', 'like', "%{$search}%")
                    ->orWhere('draft_team', 'like', "%{$search}%")
                    ->orWhere('school', 'like', "%{$search}%")
                    ->orWhere('agent_name', 'like', "%{$search}%")
                    ->orWhere('agency_name', 'like', "%{$search}%")
                    ->orWhere('nationality', 'like', "%{$search}%");
            });
        }

        if ($request->filled('league_id')) {
            $query->where('league_id', $request->league_id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $draftPlayers = $query->orderBy('year', 'desc')
            ->orderBy('round', 'asc')
            ->orderBy('pick', 'asc')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Draft Players');

        $headers = [
            'First Name',
            'Last Name',
            'League',
            'Year',
            'Round',
            'Pick',
            'Position',
            'Current Team',
            'Draft Team',
            'School',
            'Agent Name',
            'Agency Name',
            'Height',
            'Weight',
            'Birthdate',
            'Nationality',
            'Status',
        ];

        $columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];

        foreach ($headers as $index => $header) {
            $sheet->setCellValue("{$columns[$index]}1", $header);
        }

        $sheet->getStyle('A1:Q1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '1E293B'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(30);

        $rowIndex = 2;
        foreach ($draftPlayers as $player) {
            $sheet->setCellValue("A{$rowIndex}", $player->first_name ?? '');
            $sheet->setCellValue("B{$rowIndex}", $player->last_name ?? '');
            $sheet->setCellValue("C{$rowIndex}", $player->league?->league_name ?? '');
            $sheet->setCellValue("D{$rowIndex}", $player->year ?? '');
            $sheet->setCellValue("E{$rowIndex}", $player->round ?? '');
            $sheet->setCellValue("F{$rowIndex}", $player->pick ?? '');
            $sheet->setCellValue("G{$rowIndex}", $player->position ?? '');
            $sheet->setCellValue("H{$rowIndex}", $player->current_team ?? '');
            $sheet->setCellValue("I{$rowIndex}", $player->draft_team ?? '');
            $sheet->setCellValue("J{$rowIndex}", $player->school ?? '');
            $sheet->setCellValue("K{$rowIndex}", $player->agent_name ?: ($player->agent?->agent_name ?? ''));
            $sheet->setCellValue("L{$rowIndex}", $player->agency_name ?: ($player->agent?->agency_name ?? ''));
            $sheet->setCellValue("M{$rowIndex}", $player->height ?? '');
            $sheet->setCellValue("N{$rowIndex}", $player->weight ?? '');
            $sheet->setCellValue("O{$rowIndex}", $player->birthdate ? Carbon::parse($player->birthdate)->format('Y-m-d') : '');
            $sheet->setCellValue("P{$rowIndex}", $player->nationality ?? '');
            $sheet->setCellValue("Q{$rowIndex}", $player->status ?? 'unsigned_draft');

            if ($rowIndex % 2 === 0) {
                $sheet->getStyle("A{$rowIndex}:Q{$rowIndex}")->applyFromArray([
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

        $fileName = 'draft_players_' . now()->format('Y_m_d_His') . '.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * Download sample Excel template for importing draft players.
     */
    public function template()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Draft Players Template');

        $headers = [
            'First Name',
            'Last Name',
            'League',
            'Year',
            'Round',
            'Pick',
            'Position',
            'Current Team',
            'Draft Team',
            'School',
            'Agent Name',
            'Agency Name',
            'Height',
            'Weight',
            'Birthdate',
            'Nationality',
            'Status',
        ];

        $columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];

        foreach ($headers as $index => $header) {
            $sheet->setCellValue("{$columns[$index]}1", $header);
        }

        $sheet->getStyle('A1:Q1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '0F766E'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);
        $sheet->getRowDimension(1)->setRowHeight(30);

        $sampleLeague = League::where('is_draft_pick', true)->first()?->league_name ?? 'MLB';

        $sampleData = [
            [
                'John',
                'Smith',
                $sampleLeague,
                2026,
                1,
                1,
                'PG',
                'Mariners',
                'Giants',
                'Arizona State University, Arizona',
                'Michael Brown',
                'ABC Sports',
                "6'3\"",
                '195 lbs',
                '2003-04-12',
                'USA',
                'unsigned_draft',
            ],
            [
                'Alex',
                'Rodriguez',
                $sampleLeague,
                2026,
                1,
                2,
                'SS',
                'Yankees',
                'Mariners',
                'University of Miami, Florida',
                'Scott Boras',
                'Boras Corporation',
                "6'1\"",
                '185 lbs',
                '2003-08-25',
                'Dominican Republic',
                'signed',
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

        $fileName = 'draft_players_import_template.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    /**
     * Import draft players from an Excel / CSV file.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file'              => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
            'default_league_id' => ['nullable', 'exists:leagues,id'],
            'update_existing'   => ['nullable'],
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

            if (in_array($normalized, ['firstname', 'fname', 'first'])) {
                $headerMap[$colIdx] = 'first_name';
            } elseif (in_array($normalized, ['lastname', 'lname', 'last', 'surname'])) {
                $headerMap[$colIdx] = 'last_name';
            } elseif (in_array($normalized, ['playername', 'player', 'name', 'fullname'])) {
                $headerMap[$colIdx] = 'player_name';
            } elseif (in_array($normalized, ['league', 'leaguename', 'leagueid', 'leagueslug'])) {
                $headerMap[$colIdx] = 'league';
            } elseif (in_array($normalized, ['year', 'draftyear'])) {
                $headerMap[$colIdx] = 'year';
            } elseif (in_array($normalized, ['round', 'draftround'])) {
                $headerMap[$colIdx] = 'round';
            } elseif (in_array($normalized, ['pick', 'draftpick', 'picknumber'])) {
                $headerMap[$colIdx] = 'pick';
            } elseif (in_array($normalized, ['position', 'pos'])) {
                $headerMap[$colIdx] = 'position';
            } elseif (in_array($normalized, ['currentteam', 'current_team', 'team', 'presentteam'])) {
                $headerMap[$colIdx] = 'current_team';
            } elseif (in_array($normalized, ['draftteam', 'draft_team', 'draftedteam', 'draftedby'])) {
                $headerMap[$colIdx] = 'draft_team';
            } elseif (in_array($normalized, ['school', 'college', 'university'])) {
                $headerMap[$colIdx] = 'school';
            } elseif (in_array($normalized, ['agentname', 'agent', 'representative'])) {
                $headerMap[$colIdx] = 'agent_name';
            } elseif (in_array($normalized, ['agencyname', 'agency', 'company'])) {
                $headerMap[$colIdx] = 'agency_name';
            } elseif (in_array($normalized, ['height', 'playerheight'])) {
                $headerMap[$colIdx] = 'height';
            } elseif (in_array($normalized, ['weight', 'playerweight'])) {
                $headerMap[$colIdx] = 'weight';
            } elseif (in_array($normalized, ['birthdate', 'dob', 'dateofbirth', 'birthday', 'birth'])) {
                $headerMap[$colIdx] = 'birthdate';
            } elseif (in_array($normalized, ['nationality', 'country', 'nation', 'citizenship'])) {
                $headerMap[$colIdx] = 'nationality';
            } elseif (in_array($normalized, ['status', 'playerstatus', 'draftstatus'])) {
                $headerMap[$colIdx] = 'status';
            }
        }

        if (!in_array('first_name', $headerMap) && !in_array('player_name', $headerMap)) {
            return redirect()->back()->with('error', 'Could not find a "First Name" (or "Player Name") column in the uploaded file header.');
        }

        $allLeagues = League::all();
        $defaultLeague = $request->default_league_id
            ? $allLeagues->firstWhere('id', $request->default_league_id)
            : $allLeagues->firstWhere('is_draft_pick', true);

        $updateExisting = filter_var($request->input('update_existing', true), FILTER_VALIDATE_BOOLEAN);
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

            $firstName = $rowData['first_name'] ?? null;
            $lastName  = $rowData['last_name'] ?? null;

            // Fallback: If only player_name/fullname was provided in uploaded spreadsheet
            if (empty($firstName) && !empty($rowData['player_name'])) {
                $parts = explode(' ', trim($rowData['player_name']), 2);
                $firstName = $parts[0] ?? null;
                $lastName  = $parts[1] ?? null;
            }

            if (empty($firstName)) {
                $errors[] = "Row {$rowNum}: First name is missing.";
                $skippedCount++;
                continue;
            }

            $fullName = trim("{$firstName} {$lastName}");

            // Resolve League
            $leagueId = null;
            $rowLeague = $rowData['league'] ?? null;
            if (!empty($rowLeague)) {
                $matchedLeague = $allLeagues->first(function ($l) use ($rowLeague) {
                    return strcasecmp(trim($l->league_name), $rowLeague) === 0
                        || strcasecmp(trim($l->league_slug), $rowLeague) === 0
                        || (string)$l->id === $rowLeague;
                });
                if ($matchedLeague) {
                    $leagueId = $matchedLeague->id;
                }
            }
            if (!$leagueId && $defaultLeague) {
                $leagueId = $defaultLeague->id;
            }
            if (!$leagueId) {
                $errors[] = "Row {$rowNum} ({$fullName}): League '{$rowLeague}' could not be resolved and no default draft league is selected.";
                $skippedCount++;
                continue;
            }

            // Resolve Year
            $yearVal = !empty($rowData['year']) ? (int)$rowData['year'] : (int)date('Y');
            Year::firstOrCreate(['year' => $yearVal]);

            // Resolve Round & Pick
            $round = !empty($rowData['round']) && is_numeric($rowData['round']) ? (int)$rowData['round'] : null;
            $pick  = !empty($rowData['pick']) && is_numeric($rowData['pick']) ? (int)$rowData['pick'] : null;

            // Resolve Agent
            $agentName  = $rowData['agent_name'] ?? null;
            $agencyName = $rowData['agency_name'] ?? null;

            // Resolve Birthdate
            $birthdate = null;
            if (!empty($rowData['birthdate'])) {
                $bVal = $rowData['birthdate'];
                if (is_numeric($bVal)) {
                    try {
                        $birthdate = ExcelDate::excelToDateTimeObject((float)$bVal)->format('Y-m-d');
                    } catch (\Throwable $e) {
                        $birthdate = null;
                    }
                } else {
                    try {
                        $birthdate = Carbon::parse($bVal)->format('Y-m-d');
                    } catch (\Throwable $e) {
                        $birthdate = null;
                    }
                }
            }

            // Resolve Status
            $status = 'unsigned_draft';
            if (!empty($rowData['status'])) {
                $rawStatus = strtolower(trim(str_replace([' ', '-'], '_', $rowData['status'])));
                if (in_array($rawStatus, ['signed', 'unsigned_draft', 'undrafted'])) {
                    $status = $rawStatus;
                } elseif ($rawStatus === 'unsigned') {
                    $status = 'unsigned_draft';
                }
            }

            try {
                $existingQuery = DraftPlayer::where('first_name', $firstName)
                    ->where('year', $yearVal)
                    ->where('league_id', $leagueId);

                if (!empty($lastName)) {
                    $existingQuery->where('last_name', $lastName);
                } else {
                    $existingQuery->where(function ($q) {
                        $q->whereNull('last_name')->orWhere('last_name', '');
                    });
                }

                $existing = $existingQuery->first();

                if ($existing) {
                    if ($updateExisting) {
                        $existing->update([
                            'round'        => $round ?? $existing->round,
                            'pick'         => $pick ?? $existing->pick,
                            'position'     => $rowData['position'] ?: $existing->position,
                            'current_team' => $rowData['current_team'] ?: $existing->current_team,
                            'draft_team'   => $rowData['draft_team'] ?: $existing->draft_team,
                            'school'       => $rowData['school'] ?: $existing->school,
                            'agent_name'   => $agentName ?: $existing->agent_name,
                            'agency_name'  => $agencyName ?: $existing->agency_name,
                            'height'       => $rowData['height'] ?: $existing->height,
                            'weight'       => $rowData['weight'] ?: $existing->weight,
                            'birthdate'    => $birthdate ?: $existing->birthdate,
                            'nationality'  => $rowData['nationality'] ?: $existing->nationality,
                            'status'       => $status,
                        ]);
                        $updatedCount++;
                    } else {
                        $skippedCount++;
                    }
                } else {
                    DraftPlayer::create([
                        'league_id'    => $leagueId,
                        'year'         => $yearVal,
                        'round'        => $round,
                        'pick'         => $pick,
                        'first_name'   => $firstName,
                        'last_name'    => $lastName,
                        'position'     => $rowData['position'] ?? null,
                        'current_team' => $rowData['current_team'] ?? null,
                        'draft_team'   => $rowData['draft_team'] ?? null,
                        'school'       => $rowData['school'] ?? null,
                        'slug'         => Str::slug($fullName ?: $firstName),
                        'agent_name'   => $agentName,
                        'agency_name'  => $agencyName,
                        'height'       => $rowData['height'] ?? null,
                        'weight'       => $rowData['weight'] ?? null,
                        'birthdate'    => $birthdate,
                        'nationality'  => $rowData['nationality'] ?? null,
                        'status'       => $status,
                    ]);
                    $createdCount++;
                }
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum} ({$fullName}): " . $e->getMessage();
                $skippedCount++;
            }
        }

        $message = "Import complete! Added {$createdCount} new player(s), updated {$updatedCount} player(s).";
        if ($skippedCount > 0 && empty($errors)) {
            $message .= " Skipped {$skippedCount} existing player(s).";
        }

        return redirect()->back()
            ->with('success', $message)
            ->with('import_errors', !empty($errors) ? array_slice($errors, 0, 20) : null);
    }
}
