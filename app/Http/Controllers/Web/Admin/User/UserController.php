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
use Inertia\Inertia;
use Inertia\Response;
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
}
