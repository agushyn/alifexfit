<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Midtrans Configuration
    |--------------------------------------------------------------------------
    |
    | Credentials and mode configuration for Midtrans Payment Gateway.
    | Default mode is Sandbox (is_production = false).
    |
    */

    'server_key' => env('MIDTRANS_SERVER_KEY', ''),
    'client_key' => env('MIDTRANS_CLIENT_KEY', ''),
    'merchant_id' => env('MIDTRANS_MERCHANT_ID', ''),
    'is_production' => (bool) env('MIDTRANS_IS_PRODUCTION', false),
    'is_sanitized' => true,
    'is_3ds' => true,

    /*
    |--------------------------------------------------------------------------
    | Payment Expiration Duration
    |--------------------------------------------------------------------------
    |
    | Default duration in minutes before payment transactions expire.
    |
    */
    'expiry_duration' => (int) env('MIDTRANS_EXPIRY_DURATION', 60), // 60 minutes
    'expiry_unit' => 'minute',

    /*
    |--------------------------------------------------------------------------
    | Enabled Payment Channels
    |--------------------------------------------------------------------------
    |
    | Default enabled payment channels for EXFIT online membership registration.
    |
    */
    'enabled_channels' => [
        'qris' => [
            'name' => 'QRIS (Gopay / ShopeePay / BCA / All E-Wallets)',
            'method' => 'qris',
            'channel' => 'qris',
            'icon' => 'qr-code',
        ],
        'bca_va' => [
            'name' => 'BCA Virtual Account',
            'method' => 'bank_transfer',
            'channel' => 'bca',
            'icon' => 'bank',
        ],
        'bni_va' => [
            'name' => 'BNI Virtual Account',
            'method' => 'bank_transfer',
            'channel' => 'bni',
            'icon' => 'bank',
        ],
        'bri_va' => [
            'name' => 'BRI Virtual Account',
            'method' => 'bank_transfer',
            'channel' => 'bri',
            'icon' => 'bank',
        ],
        'mandiri_bill' => [
            'name' => 'Mandiri Bill Payment',
            'method' => 'echannel',
            'channel' => 'mandiri',
            'icon' => 'bank',
        ],
        'permata_va' => [
            'name' => 'Permata Virtual Account',
            'method' => 'bank_transfer',
            'channel' => 'permata',
            'icon' => 'bank',
        ],
        'cimb_va' => [
            'name' => 'CIMB Niaga Virtual Account',
            'method' => 'bank_transfer',
            'channel' => 'cimb',
            'icon' => 'bank',
        ],
    ],
];
