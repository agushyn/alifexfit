<?php

namespace App\Services\Payments;

use App\Models\Payment;
use App\Services\Payments\DTO\CreatePaymentRequest;
use App\Services\Payments\DTO\PaymentResult;

interface PaymentGatewayInterface
{
    /**
     * Create a charge or payment transaction with the provider.
     */
    public function createPayment(CreatePaymentRequest $request): PaymentResult;

    /**
     * Query provider for latest payment transaction status.
     */
    public function getPaymentStatus(Payment $payment): PaymentResult;

    /**
     * Verify incoming webhook notification signature and authenticity.
     */
    public function verifyWebhookSignature(array $payload): bool;

    /**
     * Parse webhook notification payload into normalized PaymentResult.
     */
    public function parseWebhookNotification(array $payload): PaymentResult;
}
