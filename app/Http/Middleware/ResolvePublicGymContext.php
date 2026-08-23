<?php

namespace App\Http\Middleware;

use App\Services\Website\PublicTenantResolver;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolvePublicGymContext
{
    public function __construct(
        protected PublicTenantResolver $tenantResolver
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $this->tenantResolver->resolve($request);

        return $next($request);
    }
}
