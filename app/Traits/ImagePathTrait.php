<?php

namespace App\Traits;

use Illuminate\Support\Facades\Storage;

trait ImagePathTrait
{
    /**
     * Convert a file path into a full URL.
     * Works for both public and storage uploaded files.
     */
    public function fullImageUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }

        // If already URL, return as-is
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $path;
        }

        // 1. Public uploaded file: starts with "uploads/"
        if (str_starts_with($path, 'uploads/') || str_starts_with($path, '/uploads/')) {
            return url($path); // public path
        }

        // 2. Storage uploaded file: example "uploads/image.jpg"
        if (Storage::exists($path)) {
            return url(Storage::url($path));
        }

        // If nothing matches, just return the original value
        return $path;
    }

    /**
     * Convert ONLY for API requests.
     */
    public function fullImageUrlForApi(?string $path): ?string
    {
        if (request()->is('api/*')) {
            return $this->fullImageUrl($path);
        }

        return $path;
    }
}
