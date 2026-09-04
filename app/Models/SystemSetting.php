<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'email',
        'number',
        'system_name',
        'address',
        'copyright_text',
        'logo',
        'favicon',
        'description',
        'agent_listing_fee',
        'subscription_fee',
    ];

    protected $casts = [
        'agent_listing_fee' => 'decimal:2',
        'subscription_fee'  => 'decimal:2',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    public function getLogoAttribute($value)
    {
        return $this->resolveUploadUrl($value);
    }

    public function getFaviconAttribute($value)
    {
        return $this->resolveUploadUrl($value);
    }

    private function resolveUploadUrl(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }

        $path = $this->normalizeUploadPath($value);

        if (! str_starts_with($path, 'uploads/') && ! str_starts_with($path, 'storage/uploads/')) {
            return filter_var($value, FILTER_VALIDATE_URL) ? $value : $path;
        }

        $uploadPath = str_starts_with($path, 'storage/')
            ? substr($path, strlen('storage/'))
            : $path;

        if (file_exists(public_path($uploadPath))) {
            return $uploadPath;
        }

        if ($this->hasStorageLink() && file_exists(storage_path('app/public/' . $uploadPath))) {
            return 'storage/' . $uploadPath;
        }

        return $uploadPath;
    }

    private function normalizeUploadPath(string $value): string
    {
        if (! filter_var($value, FILTER_VALIDATE_URL)) {
            return ltrim($value, '/');
        }

        $appUrl = rtrim(config('app.url'), '/');

        if (str_starts_with($value, $appUrl . '/')) {
            return ltrim(substr($value, strlen($appUrl)), '/');
        }

        return ltrim(parse_url($value, PHP_URL_PATH) ?: $value, '/');
    }

    private function hasStorageLink(): bool
    {
        return is_link(public_path('storage')) || is_dir(public_path('storage'));
    }

    protected static function booted()
    {
        static::updating(function ($systemSetting) {
            if ($systemSetting->isDirty('favicon')) {
                $oldFavicon = $systemSetting->getOriginal('favicon');
                if ($oldFavicon && Storage::disk('public')->exists($oldFavicon)) {
                    Storage::disk('public')->delete($oldFavicon);
                }
            }

            if ($systemSetting->isDirty('logo')) {
                $oldLogo = $systemSetting->getOriginal('logo');
                if ($oldLogo && Storage::disk('public')->exists($oldLogo)) {
                    Storage::disk('public')->delete($oldLogo);
                }
            }
        });
    }
}
