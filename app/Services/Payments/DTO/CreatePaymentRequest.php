<?php

namespace App\Services\Payments\DTO;

use App\Models\MembershipRegistration;

class CreatePaymentRequest
{
    public function __construct(
        public readonly MembershipRegistration $registration,
        public readonly string $orderId,
        public readonly string $paymentMethod,
        public readonly string $paymentChannel,
        public readonly float $amount,
        public readonly string $customerName,
        public readonly string $customerEmail,
        public readonly string $customerPhone,
        public readonly string $itemName,
        public readonly int $expiryMinutes = 60,
        public readonly array $customDetails = []
    ) {}
}
