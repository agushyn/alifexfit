<?php

namespace App\Services\Members;

use App\Models\Member;
use App\Services\MemberIdGenerator;
use App\Services\Storage\SecureStorageService;
use App\Services\Tenancy\GymContext;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class MemberService
{
    public function __construct(
        protected MemberIdGenerator $idGenerator,
        protected SecureStorageService $storageService,
        protected GymContext $gymContext
    ) {}

    public function createMember(array $data, ?UploadedFile $photo = null, ?int $gymId = null): Member
    {
        $resolvedGymId = $gymId ?? $this->gymContext->getGymId();

        if (!$resolvedGymId) {
            throw new \InvalidArgumentException('A valid tenant gym context is required to create a member.');
        }

        return DB::transaction(function () use ($data, $photo, $resolvedGymId) {
            // Generate single-source-of-truth member number
            $memberNumber = $this->idGenerator->generate($resolvedGymId);

            $photoPath = null;
            if ($photo) {
                $photoPath = $this->storageService->storePublic($photo, "gyms/{$resolvedGymId}/members");
            }

            $member = Member::create([
                'gym_id' => $resolvedGymId,
                'member_number' => $memberNumber,
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'] ?? 'password',
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'gender' => $data['gender'] ?? null,
                'address' => $data['address'] ?? null,
                'emergency_contact' => $data['emergency_contact'] ?? null,
                'profile_photo' => $photoPath,
                'status' => $data['status'] ?? 'active',
            ]);

            return $member;
        });
    }

    public function updateMember(Member $member, array $data, ?UploadedFile $photo = null): Member
    {
        return DB::transaction(function () use ($member, $data, $photo) {
            $updateData = [
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'gender' => $data['gender'] ?? null,
                'address' => $data['address'] ?? null,
                'emergency_contact' => $data['emergency_contact'] ?? null,
                'status' => $data['status'] ?? $member->status,
            ];

            if ($photo) {
                $updateData['profile_photo'] = $this->storageService->storePublic(
                    $photo,
                    "gyms/{$member->gym_id}/members"
                );
            }

            $member->update($updateData);

            return $member->fresh();
        });
    }

    public function deleteMember(Member $member): bool
    {
        return $member->delete();
    }
}