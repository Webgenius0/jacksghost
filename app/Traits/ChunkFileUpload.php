<?php

namespace App\Traits;

use App\Models\ChunkUploadSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

trait ChunkFileUpload
{
    /**
     * Unified public upload
     */
    public function handleChunkedUploadPublic($fileName, $param, $folder, $chunkSizeMB = 5, $disk = 'public')
    {
        return $this->processFiles($fileName, $param, $folder, $chunkSizeMB, $disk);
    }

    /**
     * Unified storage upload
     */
    public function handleChunkedUploadStorage($fileName, $param, $folder, $chunkSizeMB = 5, $disk = 'public')
    {
        return $this->processFiles($fileName, $param, $folder, $chunkSizeMB, $disk);
    }

    /**
     * Unified cloud upload
     */
    public function handleChunkedUploadCloud($fileName, $param, $folder, $chunkSizeMB = 5, $disk = 's3')
    {
        return $this->processFiles($fileName, $param, $folder, $chunkSizeMB, $disk);
    }

    /**
     * Handle single/multiple uploads
     */
    private function processFiles($files, $param, $folder, $chunkSizeMB, $disk)
    {
        $files = is_array($files) ? $files : [$files];
        $results = [];

        foreach ($files as $file) {
            $results[] = $this->processChunkedUpload($file, $param, $folder, $chunkSizeMB, $disk);
        }

        return count($results) === 1 ? $results[0] : $results;
    }


    /**
     * Core function to handle chunking, session, merging, and storage
     */
    private function processChunkedUpload($fileName, $param, $folder, $chunkSizeMB, $disk)
    {
        $chunk = $param['chunk'];
        $index = $param['index'];
        $totalChunks = $param['total_chunks'];
        $tempId = $param['temp_id'] ?? Str::uuid()->toString();

        $localDisk = 'public';
        $tempDir = "chunk_temp/{$tempId}/";
        Storage::disk($localDisk)->makeDirectory($tempDir);

        // Create or fetch session
        $session = ChunkUploadSession::firstOrCreate(
            ['temp_id' => $tempId],
            [
                'file_name'       => $fileName,
                'disk'            => 'public',
                'folder'          => $folder,
                'total_chunks'    => $totalChunks,
                'uploaded_chunks' => 0,
                'is_completed'    => false,
            ]
        );

        if ($session->is_completed) {
            return $this->completedResponse($session);
        }

        // Save chunk
        $chunkFilename = $tempDir . "chunk_{$index}";
        if (!Storage::disk($localDisk)->exists($chunkFilename)) {
            $stream = fopen($chunk->getRealPath(), 'rb');
            Storage::disk($localDisk)->put($chunkFilename, $stream);
            if (is_resource($stream)) fclose($stream);

            $session->increment('uploaded_chunks');
            $session->refresh();
        }

        // Check completion
        if ($session->uploaded_chunks < $session->total_chunks) {
            return [
                'success'         => true,
                'temp_id'         => $tempId,
                'uploaded_chunks' => $session->uploaded_chunks,
                'total_chunks'    => $session->total_chunks,
                'progress'        => round(($session->uploaded_chunks / $session->total_chunks) * 100),
                'is_completed'    => false,
                'disk'            => 'public',
                'folder'          => $folder,
            ];
        }

        // Merge chunks and store final file
        try {
            $finalPath = $this->mergeChunksToTarget($tempDir, $fileName, $totalChunks, $disk, $folder);

            $session->update([
                'is_completed' => true,
                'final_path'   => $finalPath,
            ]);

            Storage::disk($localDisk)->deleteDirectory($tempDir);

            return [
                'success'         => true,
                'temp_id'         => $tempId,
                'uploaded_chunks' => $session->total_chunks,
                'total_chunks'    => $session->total_chunks,
                'progress'        => 100,
                'is_completed'    => true,
                'file_path'       => $finalPath,
                'disk'            => 'public',
            ];
        } catch (\Throwable $e) {
            Log::error('Failed to merge chunks: ' . $e->getMessage(), ['exception' => $e]);
            return [
                'success'         => false,
                'message'         => 'Failed to merge chunks: ' . $e->getMessage(),
                'is_completed'    => false,
                'temp_id'         => $tempId,
                'uploaded_chunks' => $session->uploaded_chunks,
                'total_chunks'    => $session->total_chunks,
            ];
        }
    }

    /**
     * Helper for completed session response
     */
    private function completedResponse($session)
    {
        return [
            'success'         => true,
            'message'         => 'Already completed',
            'is_completed'    => true,
            'temp_id'         => $session->temp_id,
            'file_path'       => $session->final_path ?? null,
            'uploaded_chunks' => $session->total_chunks,
            'total_chunks'    => $session->total_chunks,
            'progress'        => 100,
            'disk'            => 'public',
        ];
    }

    /**
     * Merge chunks to target storage (same as your original method)
     */
    private function mergeChunksToTarget(string $tempDir, string $fileName, int $totalChunks, string $targetDisk, string $targetFolder)
    {
        $localDisk = 'public';
        $finalName = time() . '_' . Str::random(8) . '_' . basename($fileName);
        $targetFolder = trim($targetFolder, '/');
        $targetRelativePath = ($targetFolder !== '') ? $targetFolder . '/' . $finalName : $finalName;

        $localFinalizeDir = 'chunk_finalize/';
        Storage::disk($localDisk)->makeDirectory($localFinalizeDir);
        $localFinalRelative = $localFinalizeDir . $finalName;
        $localFinalFullPath = Storage::disk($localDisk)->path($localFinalRelative);

        $out = fopen($localFinalFullPath, 'wb');
        if ($out === false) throw new \RuntimeException('Unable to open local final file: ' . $localFinalFullPath);

        try {
            for ($i = 1; $i <= $totalChunks; $i++) {
                $chunkPath = $tempDir . "chunk_{$i}";
                if (!Storage::disk($localDisk)->exists($chunkPath)) throw new \RuntimeException("Missing chunk #{$i}");
                $stream = Storage::disk($localDisk)->readStream($chunkPath);
                while (!feof($stream)) fwrite($out, fread($stream, 1024 * 1024));
                if (is_resource($stream)) fclose($stream);
            }
        } finally {
            if (is_resource($out)) fclose($out);
        }

        // Move to target disk
        if ($targetDisk === 'local' || $targetDisk === $localDisk) {
            Storage::disk($localDisk)->makeDirectory($targetFolder);
            Storage::disk($localDisk)->move($localFinalRelative, $targetRelativePath);
            return $targetRelativePath;
        }

        $stream = fopen($localFinalFullPath, 'rb');
        Storage::disk($targetDisk)->makeDirectory($targetFolder);
        $putSuccess = Storage::disk($targetDisk)->put($targetRelativePath, $stream);
        if (is_resource($stream)) fclose($stream);
        if (!$putSuccess) throw new \RuntimeException('Failed to store final file on disk ' . $targetDisk);
        @unlink($localFinalFullPath);

        return $targetRelativePath;
    }

}
