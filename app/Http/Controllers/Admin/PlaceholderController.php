<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PlaceholderController extends Controller
{
    public function show(Request $request, string $module): Response
    {
        $moduleConfigs = [
            'members' => [
                'title' => 'Member Management',
                'phase' => 'Phase 2',
                'description' => 'Comprehensive member directory, profile management, status tracking, biometric & RFID binding.',
                'features' => ['Member Profiles & IDs', 'Status Toggling (Active/Expired/Frozen)', 'Emergency Contacts', 'Check-in History'],
            ],
            'attendance' => [
                'title' => 'Attendance & Access Control',
                'phase' => 'Phase 2',
                'description' => 'Real-time turnstile/gate monitoring, QR scanning, RFID check-in, capacity limits and peak hour metrics.',
                'features' => ['Live Check-in Stream', 'Gate & Turnstile Integration', 'Capacity & Headcount Tracking', 'Manual Check-in Override'],
            ],
            'membership-plans' => [
                'title' => 'Membership Plans & Packages',
                'phase' => 'Phase 2',
                'description' => 'Customizable gym tiers, recurring subscriptions, session passes, discounts, and terms.',
                'features' => ['Plan Configuration', 'Pricing & Billing Cycles', 'Access Restrictions', 'Promotional Codes'],
            ],
            'membership-registrations' => [
                'title' => 'Membership Registrations',
                'phase' => 'Phase 2',
                'description' => 'Incoming online and front-desk membership applications and KYC approval flow.',
                'features' => ['Application Queue', 'Review & Approval', 'Document Verification', 'Direct Activation'],
            ],
            'membership-orders' => [
                'title' => 'Membership Orders & Invoices',
                'phase' => 'Phase 2',
                'description' => 'Order processing, invoices, payment status tracking, and receipt generation.',
                'features' => ['Invoice Generation', 'Payment Reconciliation', 'Receipt Export', 'Tax Calculation'],
            ],
            'membership-payments' => [
                'title' => 'Payment Gateway & Transactions',
                'phase' => 'Phase 2',
                'description' => 'Automated payment reconciliation, virtual accounts, QRIS, credit cards, and cash desk records.',
                'features' => ['Payment Channels', 'Transaction Settlement', 'Refund Processing', 'Payout Logs'],
            ],
            'membership-verification' => [
                'title' => 'Identity & KYC Verification',
                'phase' => 'Phase 2',
                'description' => 'Secure private document inspection, KTP validation, selfie matching, and compliance logs.',
                'features' => ['Encrypted Document Viewer', 'KYC Decisioning', 'Audit Trails', 'Data Privacy Shield'],
            ],
            'trainers' => [
                'title' => 'Trainer & Instructor Management',
                'phase' => 'Phase 3',
                'description' => 'Trainer roster, specializations, commission calculations, quotas, and scheduling.',
                'features' => ['Trainer Profiles', 'PT Session Quotas', 'Availability Calendars', 'Commission Reports'],
            ],
            'workout' => [
                'title' => 'Workout Programs & Classes',
                'phase' => 'Phase 3',
                'description' => 'Group classes, personal training programs, workout libraries, and attendance tracking.',
                'features' => ['Group Class Scheduling', 'Class Booking & Waitlists', 'Workout Routine Library', 'Equipment Status'],
            ],
            'website' => [
                'title' => 'Website CMS & Landing Pages',
                'phase' => 'Phase 3',
                'description' => 'Public gym website management, hero banners, class timetables, price cards, and leads.',
                'features' => ['CMS Hero Banners', 'Schedule Publisher', 'Lead Capture Form', 'SEO & Social Meta'],
            ],
            'reports' => [
                'title' => 'Analytics & Financial Reporting',
                'phase' => 'Phase 3',
                'description' => 'Executive revenue reports, churn rate analysis, attendance heatmaps, and exportable ledgers.',
                'features' => ['Revenue Analytics', 'Member Retention Graphs', 'Attendance Heatmaps', 'CSV/PDF Exports'],
            ],
        ];

        $config = $moduleConfigs[$module] ?? [
            'title' => ucwords(str_replace('-', ' ', $module)),
            'phase' => 'Future Phase',
            'description' => 'This module is slated for subsequent project phases according to the project roadmap.',
            'features' => ['Business logic isolated for future phases'],
        ];

        return Inertia::render('Admin/Placeholders/ModulePlaceholder', [
            'moduleKey' => $module,
            'config' => $config,
        ]);
    }
}
