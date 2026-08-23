<?php

namespace App\Http\Middleware;

use App\Models\MemberToken;
use App\Services\Tenancy\GymContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateMemberToken
{
    public function __construct(
        protected GymContext $gymContext
    ) {}

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $bearerToken = $request->bearerToken();

        if (! $bearerToken) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated. Bearer token diperlukan.',
            ], 401);
        }

        $token = MemberToken::findToken($bearerToken);

        if (! $token || ! $token->member) {
            return response()->json([
                'success' => false,
                'message' => 'Token tidak valid atau telah kedaluwarsa.',
            ], 401);
        }

        $member = $token->member;

        if ($member->status === 'inactive' || $member->status === 'suspended') {
            return response()->json([
                'success' => false,
                'message' => 'Akun member tidak aktif atau sedang ditangguhkan.',
            ], 403);
        }

        // Touch token usage
        $token->touchUsage();

        // Set tenant gym context
        $this->gymContext->setGym($member->gym);

        // Bind member & token to request
        $request->attributes->set('member', $member);
        $request->attributes->set('member_token', $token);

        // Also define macro or helper on request if accessed
        $request->setUserResolver(function () use ($member) {
            return $member;
        });

        return $next($request);
    }
}
