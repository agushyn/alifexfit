<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Payments\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService
    ) {}

    /**
     * Handle incoming Midtrans payment notification webhook.
     */
    public function handleMidtransNotification(Request $request): JsonResponse
    {
        $payload = $request->all();

        Log::info('Received Midtrans webhook request', [
            'order_id' => $payload['order_id'] ?? null,
            'transaction_status' => $payload['transaction_status'] ?? null,
        ]);

        try {
            $payment = $this->paymentService->handleWebhookNotification($payload);

            return response()->json([
                'success' => true,
                'message' => 'Notification processed successfully.',
                'order_id' => $payment->order_id,
                'status' => $payment->status,
            ]);
        } catch (\InvalidArgumentException $e) {
            Log::warning('Midtrans webhook invalid argument: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        } catch (\RuntimeException $e) {
            Log::error('Midtrans webhook runtime error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Midtrans webhook unhandled error: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Webhook processing failed.',
            ], 500);
        }
    }
}
