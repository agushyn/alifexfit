<?php

namespace App\Services\Auth;

use App\Models\Gym;
use App\Models\Member;
use App\Models\MemberToken;
use App\Services\Audit\AuditService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class MemberAuthService
{
    public function __construct(
        protected AuditService $auditService
    ) {}

    /**
     * Authenticate member and generate API token.
     *
     * @return array{token: string, member: Member, gym: Gym}
     */
    public function login(string $identifier, string $password, ?string $gymSlug = null): array
    {
        $cleanIdentifier = trim($identifier);

        $query = Member::withoutGymScope()->with(['gym', 'activeMembership.membershipPlan']);

        if ($gymSlug) {
            $gym = Gym::where('slug', $gymSlug)->first();
            if ($gym) {
                $query->where('gym_id', $gym->id);
            }
        }

        $member = $query->where(function ($q) use ($cleanIdentifier) {
            $q->where('member_number', $cleanIdentifier)
                ->orWhere('email', $cleanIdentifier)
                ->orWhere('phone', $cleanIdentifier);
        })->first();

        if (! $member || ! Hash::check($password, $member->password)) {
            throw ValidationException::withMessages([
                'identifier' => 'Nomor member / email / nomor HP atau password salah.',
            ]);
        }

        if ($member->status === 'inactive') {
            throw ValidationException::withMessages([
                'identifier' => 'Akun member non-aktif. Silakan hubungi Front Desk gym.',
            ]);
        }

        if ($member->status === 'suspended') {
            throw ValidationException::withMessages([
                'identifier' => 'Akun member sedang ditangguhkan. Silakan hubungi Front Desk gym.',
            ]);
        }

        $tokenData = MemberToken::createToken($member);

        $this->auditService->log(
            action: 'member.login',
            entityType: Member::class,
            entityId: $member->id,
            metadata: [
                'member_number' => $member->member_number,
                'token_id' => $tokenData['token']->id,
            ],
            gymId: $member->gym_id
        );

        return [
            'token' => $tokenData['plainTextToken'],
            'member' => $member,
            'gym' => $member->gym,
        ];
    }

    /**
     * Revoke member token on logout.
     */
    public function logout(MemberToken $token): void
    {
        $member = $token->member;

        $this->auditService->log(
            action: 'member.logout',
            entityType: Member::class,
            entityId: $member->id,
            metadata: [
                'member_number' => $member->member_number,
                'token_id' => $token->id,
            ],
            gymId: $token->gym_id
        );

        $token->delete();
    }
}
