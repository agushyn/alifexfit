<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Auth\MemberAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberAuthController extends Controller
{
    public function __construct(
        protected MemberAuthService $authService
    ) {}

    /**
     * Authenticate member and return Bearer token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'identifier' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
            'gym_slug' => ['nullable', 'string', 'max:100'],
        ], [
            'identifier.required' => 'Nomor member, email, atau nomor HP wajib diisi.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $result = $this->authService->login(
            identifier: $request->input('identifier'),
            password: $request->input('password'),
            gymSlug: $request->input('gym_slug')
        );

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil.',
            'data' => [
                'token' => $result['token'],
                'member' => $result['member'],
                'gym' => $result['gym'],
            ],
        ]);
    }

    /**
     * Invalidate active member token on logout.
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->attributes->get('member_token');

        if ($token) {
            $this->authService->logout($token);
        }

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * Get current authenticated member profile and active gym.
     */
    public function me(Request $request): JsonResponse
    {
        /** @var \App\Models\Member $member */
        $member = $request->attributes->get('member');

        $member->load([
            'gym:id,name,slug,code,phone,email,address,logo',
            'activeMembership.membershipPlan:id,name,slug,price,duration,billing_period,trainer_quota,benefits',
            'activeAttendance',
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'member' => $member,
                'gym' => $member->gym,
            ],
        ]);
    }
}
