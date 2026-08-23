<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Storage\SecureStorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;

class StorageController extends Controller
{
    public function showPrivate(Request $request, SecureStorageService $storageService): Response
    {
        $path = $request->query('path');

        if (!$path || !Storage::disk('local')->exists($path)) {
            abort(404, 'Requested document not found.');
        }

        if (!$storageService->canUserAccessPrivateFile($request->user(), $path)) {
            abort(403, 'Unauthorized access to private document.');
        }

        return Storage::disk('local')->response($path);
    }
}
