<?php

namespace App\Http\Controllers\Web\Admin\User;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\SystemSetting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

use App\Traits\FileManager;

class UserController extends Controller
{
    use FileManager;
    public function index(Request $request): Response
    {
        $users = User::where('role', 'User')
            ->select([
                'id',
                'name',
                'email',
                'phone',
                'avatar',
                'status',
                'last_login_date',
                'login_count',
                'last_ip',
                'created_at',
            ])->with(['activeSubscription'])->search(['name', 'email', 'phone'])->paginateData();

        return Inertia::render('user/index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        return Inertia::render('user/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $avatarPath = null;
        if ($request->hasFile('avatar')) {
            $paths = $this->uploadToPublic($request->file('avatar'), 'uploads/users');
            $avatarPath = $paths[0] ?? null;
        }

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
            'phone' => $request->phone,
            'avatar' => $avatarPath,
            'role' => 'User',
            'status' => 'Active',
        ]);

        return redirect()->route('user.index')->with('success', 'User created successfully!');
    }

    public function edit(User $user)
    {
        return Inertia::render('user/edit', [
            'user' => $user,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $avatarPath = $user->avatar;
        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                $this->deleteFromPublic($user, 'avatar');
            }
            $paths = $this->uploadToPublic($request->file('avatar'), 'uploads/users');
            $avatarPath = $paths[0] ?? null;
        }

        $data = [
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'avatar' => $avatarPath,
        ];

        if ($request->filled('password')) {
            $data['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->route('user.index')->with('success', 'User updated successfully!');
    }

    public function updateStatus(User $user)
    {
        $user->update([
            'status' => $user->status === 'Active' ? 'Inactive' : 'Active',
        ]);

        return redirect()->back()->with('success', 'User status updated successfully!');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->back()->with('success', 'User deleted successfully!');
    }

    /**
     * Manually grant a 1-year subscription to a user (admin action).
     */
    public function grantSubscription(User $user)
    {
        $settings = SystemSetting::first();
        $amount   = $settings?->subscription_fee ?? 0;

        // Cancel any existing active subscriptions first
        Subscription::where('user_id', $user->id)
            ->where('subscription_status', 'active')
            ->update(['subscription_status' => 'canceled']);

        Subscription::create([
            'user_id'                  => $user->id,
            'stripe_email'             => $user->email,
            'stripe_customer_id'       => null,
            'stripe_subscription_id'   => null,
            'amount'                   => $amount,
            'subscribe_date'           => now(),
            'subscription_status'      => 'active',
            'subscription_expire_date' => now()->addYear(),
            'uuid'                     => (string) Str::uuid(),
        ]);

        return redirect()->back()->with('success', "Subscription granted to {$user->name} for 1 year.");
    }

    public function export(Request $request)
    {
        $query = User::with(['activeSubscription']);

        if ($request->filled('role')) {
            $query->where('role', $request->role);
        } else {
            $query->where('role', 'User');
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Users');

        $headers = [
            'ID',
            'Name',
            'Email',
            'Phone',
            'Role',
            'Status',
            'Subscription Status',
            'Subscription Expires At',
            'Login Count',
            'Last Login Date',
            'Last IP',
            'Registered At',
        ];

        $columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

        foreach ($headers as $index => $header) {
            $sheet->setCellValue("{$columns[$index]}1", $header);
        }

        $sheet->getStyle('A1:L1')->applyFromArray([
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
        foreach ($users as $user) {
            $sub = $user->activeSubscription;
            $subStatus = $sub ? 'Active' : 'No subscription';
            $subExpires = ($sub && $sub->subscription_expire_date)
                ? Carbon::parse($sub->subscription_expire_date)->format('Y-m-d H:i')
                : '';

            $sheet->setCellValue("A{$rowIndex}", $user->id);
            $sheet->setCellValue("B{$rowIndex}", $user->name ?? '');
            $sheet->setCellValue("C{$rowIndex}", $user->email ?? '');
            $sheet->setCellValue("D{$rowIndex}", $user->phone ?? '');
            $sheet->setCellValue("E{$rowIndex}", $user->role ?? 'User');
            $sheet->setCellValue("F{$rowIndex}", $user->status ?? 'Active');
            $sheet->setCellValue("G{$rowIndex}", $subStatus);
            $sheet->setCellValue("H{$rowIndex}", $subExpires);
            $sheet->setCellValue("I{$rowIndex}", $user->login_count ?? 0);
            $sheet->setCellValue("J{$rowIndex}", $user->last_login_date ? Carbon::parse($user->last_login_date)->format('Y-m-d H:i') : 'Never');
            $sheet->setCellValue("K{$rowIndex}", $user->last_ip ?? '');
            $sheet->setCellValue("L{$rowIndex}", $user->created_at ? Carbon::parse($user->created_at)->format('Y-m-d H:i') : '');

            if ($rowIndex % 2 === 0) {
                $sheet->getStyle("A{$rowIndex}:L{$rowIndex}")->applyFromArray([
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

        $fileName = 'users_' . now()->format('Y_m_d_His') . '.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    public function exportCsv(Request $request)
    {
        return $this->export($request);
    }

    public function template()
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Users Import Template');

        $headers = [
            'Name',
            'Email',
            'Phone',
            'Password',
            'Status',
            'Role',
            'Timezone',
        ];

        $columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

        foreach ($headers as $index => $header) {
            $sheet->setCellValue("{$columns[$index]}1", $header);
        }

        $sheet->getStyle('A1:G1')->applyFromArray([
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

        $sampleData = [
            [
                'John Doe',
                'john.doe@example.com',
                '+1 (555) 123-4567',
                'Password123!',
                'Active',
                'User',
                'UTC',
            ],
            [
                'Jane Smith',
                'jane.smith@example.com',
                '+1 (555) 987-6543',
                'SecretPass@2026',
                'Active',
                'User',
                'America/New_York',
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

        $fileName = 'users_import_template.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            $writer = new Xlsx($spreadsheet);
            $writer->save('php://output');
        }, $fileName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file'             => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:10240'],
            'default_status'   => ['nullable', 'in:Active,Inactive'],
            'default_role'     => ['nullable', 'in:User,Admin'],
            'default_password' => ['nullable', 'string', 'min:6'],
            'update_existing'  => ['nullable'],
        ]);

        try {
            $file = $request->file('file');
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheet = $spreadsheet->getActiveSheet();
            $rawRows = $sheet->toArray(null, true, false, false);
        } catch (\Throwable $e) {
            return redirect()->back()->with('error', 'Failed to read spreadsheet file: ' . $e->getMessage());
        }

        if (empty($rawRows) || count($rawRows) < 2) {
            return redirect()->back()->with('error', 'The uploaded file is empty or does not contain any data rows.');
        }

        $headerRow = array_shift($rawRows);
        $headerMap = [];

        foreach ($headerRow as $colIdx => $headerVal) {
            if ($headerVal === null || $headerVal === '') {
                continue;
            }
            $normalized = strtolower(trim(preg_replace('/[^a-zA-Z0-9]/', '', (string)$headerVal)));

            if (in_array($normalized, ['name', 'fullname', 'username', 'user', 'displayname'])) {
                $headerMap[$colIdx] = 'name';
            } elseif (in_array($normalized, ['email', 'emailaddress', 'mail', 'useremail'])) {
                $headerMap[$colIdx] = 'email';
            } elseif (in_array($normalized, ['phone', 'phonenumber', 'mobile', 'cell', 'tel', 'telephone'])) {
                $headerMap[$colIdx] = 'phone';
            } elseif (in_array($normalized, ['password', 'pass', 'pwd'])) {
                $headerMap[$colIdx] = 'password';
            } elseif (in_array($normalized, ['status', 'userstatus', 'state', 'accountstatus'])) {
                $headerMap[$colIdx] = 'status';
            } elseif (in_array($normalized, ['role', 'userrole', 'type', 'accounttype'])) {
                $headerMap[$colIdx] = 'role';
            } elseif (in_array($normalized, ['timezone', 'tz', 'time_zone'])) {
                $headerMap[$colIdx] = 'timezone';
            }
        }

        if (!in_array('name', $headerMap) || !in_array('email', $headerMap)) {
            return redirect()->back()->with('error', 'Uploaded file must include both a "Name" and an "Email" column in the header row.');
        }

        $defaultStatus = $request->input('default_status', 'Active') ?: 'Active';
        $defaultRole = $request->input('default_role', 'User') ?: 'User';
        $defaultPassword = $request->input('default_password', 'Password123!') ?: 'Password123!';
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

            $name = $rowData['name'] ?? null;
            $email = $rowData['email'] ?? null;

            if (empty($name)) {
                $errors[] = "Row {$rowNum}: Skipped because Name is required.";
                $skippedCount++;
                continue;
            }

            if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors[] = "Row {$rowNum} (" . ($name ?: 'Unnamed') . "): Skipped because Email is invalid or missing (" . ($email ?: 'empty') . ").";
                $skippedCount++;
                continue;
            }

            $phone = !empty($rowData['phone']) ? $rowData['phone'] : null;

            // Status normalization
            $status = $defaultStatus;
            if (!empty($rowData['status'])) {
                $s = strtolower($rowData['status']);
                if (in_array($s, ['active', '1', 'enabled', 'true', 'yes'])) {
                    $status = 'Active';
                } elseif (in_array($s, ['inactive', '0', 'disabled', 'false', 'no'])) {
                    $status = 'Inactive';
                }
            }

            // Role normalization
            $role = $defaultRole;
            if (!empty($rowData['role'])) {
                $r = strtolower($rowData['role']);
                if (in_array($r, ['admin', 'administrator'])) {
                    $role = 'Admin';
                } elseif (in_array($r, ['user', 'member', 'client'])) {
                    $role = 'User';
                }
            }

            $timezone = !empty($rowData['timezone']) ? $rowData['timezone'] : 'UTC';

            $existingUser = User::where('email', $email)->first();

            if ($existingUser) {
                if ($updateExisting) {
                    $updatePayload = [
                        'name'     => $name,
                        'phone'    => $phone ?? $existingUser->phone,
                        'status'   => $status,
                        'role'     => $role,
                        'timezone' => $timezone,
                    ];
                    if (!empty($rowData['password'])) {
                        $updatePayload['password'] = Hash::make($rowData['password']);
                    }
                    $existingUser->update($updatePayload);
                    $updatedCount++;
                } else {
                    $errors[] = "Row {$rowNum}: User '{$email}' already exists and duplicate updating was disabled.";
                    $skippedCount++;
                }
            } else {
                $password = !empty($rowData['password']) ? $rowData['password'] : $defaultPassword;
                User::create([
                    'name'     => $name,
                    'email'    => $email,
                    'phone'    => $phone,
                    'password' => Hash::make($password),
                    'status'   => $status,
                    'role'     => $role,
                    'timezone' => $timezone,
                ]);
                $createdCount++;
            }
        }

        $summary = "Import completed: {$createdCount} users created, {$updatedCount} users updated.";
        if ($skippedCount > 0) {
            $summary .= " ({$skippedCount} rows skipped/warned).";
        }

        return redirect()->route('user.index')
            ->with('success', $summary)
            ->with('import_errors', !empty($errors) ? array_slice($errors, 0, 30) : null);
    }
}
