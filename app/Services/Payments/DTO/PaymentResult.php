<?php

namespace App\Services\Payments\DTO;

use Carbon\Carbon;

class PaymentResult
{
    public function __construct(
        public readonly bool $success,
        public readonly string $status, // pending, paid, failed, expired, cancelled, refunded
        public readonly string $orderId,
        public readonly ?string $providerTransactionId = null,
        public readonly ?string $providerReference = null,
        public readonly ?string $paymentMethod = null,
        public readonly ?string $paymentChannel = null,
        public readonly ?float $grossAmount = null,
        public readonly ?string $paymentUrl = null,
        public readonly ?string $qrString = null,
        public readonly ?string $vaNumber = null,
        public readonly ?string $billKey = null,
        public readonly ?string $billerCode = null,
        public readonly ?Carbon $expiresAt = null,
        public readonly ?Carbon $paidAt = null,
        public readonly ?string $errorMessage = null,
        public readonly array $rawResponse = []
    ) {}
}
