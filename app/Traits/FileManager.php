<?php

namespace App\Traits;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

trait FileManager
{
    /**
     * Normalize any file input into a flat array of UploadedFile objects.
     */
    private function normalizeFiles($files): array
    {
        if (empty($files)) return [];

        if ($files instanceof UploadedFile) return [$files];

        $iterator = is_array($files) ? $files : [$files];
        $normalized = [];

        foreach ($iterator as $item) {
            if ($item instanceof UploadedFile) {
                $normalized[] = $item;
            } elseif (is_array($item)) {
                $normalized = array_merge($normalized, $this->normalizeFiles($item));
            }
        }

        return $normalized;
    }

    /**
     * Upload single or multiple files to public folder
     */
    public function uploadToPublic($files, string $folder = 'uploads'): array
    {
        $files = $this->normalizeFiles($files);
        $folder = trim($folder, '/');
        $paths = [];

        foreach ($files as $file) {
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $path = public_path($folder);
            if (!file_exists($path)) mkdir($path, 0777, true);

            $file->move($path, $filename);
            $paths[] = "$folder/$filename";
        }

        return $paths;
    }

    /**
     * Delete single or multiple files from public folder + DB update
     */
    public function deleteFromPublic(object $model, string $column): bool
    {
        $raw = $model->getRawOriginal($column);
        if (empty($raw)) return false;

        $files = is_array($raw) ? $raw : json_decode($raw, true);

        foreach ((array)$files as $filePath) {
            $full = public_path($filePath);
            if (file_exists($full)) unlink($full);
        }

        $model->{$column} = null;
        return $model->save();
    }

    /**
     * Upload single or multiple files to storage folder
     */
    public function uploadToStorage($files, string $folder = 'uploads', string $disk = 'public'): array
    {
        $files = $this->normalizeFiles($files);
        $folder = trim($folder, '/');
        $paths = [];

        foreach ($files as $file) {
            $paths[] = $file->store($folder, $disk);
        }

        return $paths;
    }

    /**
     * Delete single or multiple files from storage folder + DB update
     */
    public function deleteFromStorage(object $model, string $column,  string $disk = 'public'): bool
    {
        $raw = $model->getRawOriginal($column);
        if (empty($raw)) return false;

        $files = is_array($raw) ? $raw : json_decode($raw, true);

        foreach ((array)$files as $filePath) {
            if (Storage::disk($disk)->exists($filePath)) Storage::disk($disk)->delete($filePath);
        }

        $model->{$column} = null;
        return $model->save();
    }

    /**
     * Update files in public folder: delete old + upload new
     */
    public function updateToPublic(object $model, string $column, $newFiles, string $folder = 'uploads'): array
    {
        $this->deleteFromPublic($model, $column);
        $paths = $this->uploadToPublic($newFiles, $folder);

        $model->{$column} = $paths;
        $model->save();

        return $paths;
    }

    /**
     * Update files in storage folder: delete old + upload new
     */
    public function updateToStorage(object $model, string $column, $newFiles, string $folder = 'uploads',  string $disk = 'public'): array
    {
        $this->deleteFromStorage($model, $column);
        $paths = $this->uploadToStorage($newFiles, $folder, $disk);

        $model->{$column} = $paths;
        $model->save();

        return $paths;
    }

}
