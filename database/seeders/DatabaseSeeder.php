<?php

namespace Database\Seeders;

use App\Models\Gym;
use App\Models\GymSetting;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Roles
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin'], [
            'display_name' => 'Super Administrator',
            'description' => 'Full cross-gym system access and configuration.',
        ]);

        $gymAdminRole = Role::firstOrCreate(['name' => 'gym_admin'], [
            'display_name' => 'Gym Administrator',
            'description' => 'Full management access for a specific gym branch.',
        ]);

        $staffRole = Role::firstOrCreate(['name' => 'staff'], [
            'display_name' => 'Gym Staff',
            'description' => 'Daily operational staff for front desk and check-in.',
        ]);

        $trainerRole = Role::firstOrCreate(['name' => 'trainer'], [
            'display_name' => 'Personal Trainer',
            'description' => 'Trainer access for workouts and client sessions.',
        ]);

        // 2. Permissions
        $permissions = [
            // Dashboard
            ['name' => 'dashboard.view', 'display_name' => 'View Dashboard', 'group' => 'Dashboard'],
            // Gyms
            ['name' => 'gyms.view', 'display_name' => 'View Gyms', 'group' => 'Gyms'],
            ['name' => 'gyms.create', 'display_name' => 'Create Gyms', 'group' => 'Gyms'],
            ['name' => 'gyms.update', 'display_name' => 'Update Gyms', 'group' => 'Gyms'],
            ['name' => 'gyms.delete', 'display_name' => 'Delete Gyms', 'group' => 'Gyms'],
            // Members
            ['name' => 'members.view', 'display_name' => 'View Members', 'group' => 'Members'],
            ['name' => 'members.create', 'display_name' => 'Create Members', 'group' => 'Members'],
            ['name' => 'members.update', 'display_name' => 'Update Members', 'group' => 'Members'],
            ['name' => 'members.delete', 'display_name' => 'Delete Members', 'group' => 'Members'],
            // Attendance
            ['name' => 'attendance.view', 'display_name' => 'View Attendance', 'group' => 'Attendance'],
            ['name' => 'attendance.create', 'display_name' => 'Create Attendance (Check-in)', 'group' => 'Attendance'],
            ['name' => 'attendance.update', 'display_name' => 'Update Attendance (Check-out)', 'group' => 'Attendance'],
            ['name' => 'attendance.delete', 'display_name' => 'Cancel Attendance', 'group' => 'Attendance'],
            ['name' => 'attendance.kiosk', 'display_name' => 'Access Attendance Kiosk', 'group' => 'Attendance'],
            // Membership
            ['name' => 'membership.view', 'display_name' => 'View Membership', 'group' => 'Membership'],
            ['name' => 'membership.manage', 'display_name' => 'Manage Membership', 'group' => 'Membership'],
            // Trainers
            ['name' => 'trainers.view', 'display_name' => 'View Trainers', 'group' => 'Trainers'],
            ['name' => 'trainers.manage', 'display_name' => 'Manage Trainers', 'group' => 'Trainers'],
            // Workout
            ['name' => 'workout.view', 'display_name' => 'View Workout', 'group' => 'Workout'],
            ['name' => 'workout.manage', 'display_name' => 'Manage Workout', 'group' => 'Workout'],
            ['name' => 'workout_sessions.view', 'display_name' => 'View Workout Sessions', 'group' => 'Workout Sessions'],
            ['name' => 'workout_sessions.create', 'display_name' => 'Create Workout Sessions', 'group' => 'Workout Sessions'],
            ['name' => 'workout_sessions.update', 'display_name' => 'Update Workout Sessions', 'group' => 'Workout Sessions'],
            ['name' => 'workout_sessions.delete', 'display_name' => 'Delete/Cancel Workout Sessions', 'group' => 'Workout Sessions'],
            // Website
            ['name' => 'website.view', 'display_name' => 'View Website', 'group' => 'Website'],
            ['name' => 'website.manage', 'display_name' => 'Manage Website', 'group' => 'Website'],
            // Membership Registrations (Phase 5B & 5C)
            ['name' => 'membership_registrations.view', 'display_name' => 'View Membership Registrations', 'group' => 'Membership Registrations'],
            ['name' => 'membership_registrations.create', 'display_name' => 'Create Membership Registrations', 'group' => 'Membership Registrations'],
            ['name' => 'membership_registrations.approve', 'display_name' => 'Approve Membership Registrations', 'group' => 'Membership Registrations'],
            ['name' => 'membership_registrations.reject', 'display_name' => 'Reject Membership Registrations', 'group' => 'Membership Registrations'],
            ['name' => 'membership_registrations.cancel', 'display_name' => 'Cancel Membership Registrations', 'group' => 'Membership Registrations'],
            ['name' => 'membership_registrations.manage', 'display_name' => 'Manage Membership Registrations', 'group' => 'Membership Registrations'],
            // Leads (Phase 5D)
            ['name' => 'leads.view', 'display_name' => 'View Leads', 'group' => 'Leads'],
            ['name' => 'leads.create', 'display_name' => 'Create Leads', 'group' => 'Leads'],
            ['name' => 'leads.update', 'display_name' => 'Update Leads', 'group' => 'Leads'],
            ['name' => 'leads.assign', 'display_name' => 'Assign Leads', 'group' => 'Leads'],
            ['name' => 'leads.contact', 'display_name' => 'Record Lead Contacts', 'group' => 'Leads'],
            ['name' => 'leads.convert', 'display_name' => 'Convert Leads to Registration', 'group' => 'Leads'],
            ['name' => 'leads.manage', 'display_name' => 'Manage Leads', 'group' => 'Leads'],
            // Reports
            ['name' => 'reports.view', 'display_name' => 'View Reports', 'group' => 'Reports'],
            // Settings
            ['name' => 'settings.view', 'display_name' => 'View Settings', 'group' => 'Settings'],
            ['name' => 'settings.manage', 'display_name' => 'Manage Settings', 'group' => 'Settings'],
        ];

        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p['name']], $p);
        }

        // 3. Assign Permissions to Roles
        $allPermissions = Permission::pluck('name')->toArray();
        $gymAdminRole->syncPermissions([
            'dashboard.view',
            'gyms.view',
            'gyms.update',
            'members.view',
            'members.create',
            'members.update',
            'members.delete',
            'attendance.view',
            'attendance.create',
            'attendance.update',
            'attendance.delete',
            'attendance.kiosk',
            'membership.view',
            'membership.manage',
            'trainers.view',
            'trainers.manage',
            'workout.view',
            'workout.manage',
            'workout_sessions.view',
            'workout_sessions.create',
            'workout_sessions.update',
            'workout_sessions.delete',
            'website.view',
            'website.manage',
            'membership_registrations.view',
            'membership_registrations.create',
            'membership_registrations.approve',
            'membership_registrations.reject',
            'membership_registrations.cancel',
            'membership_registrations.manage',
            'leads.view',
            'leads.create',
            'leads.update',
            'leads.assign',
            'leads.contact',
            'leads.convert',
            'leads.manage',
            'reports.view',
            'settings.view',
            'settings.manage',
        ]);

        $staffRole->syncPermissions([
            'dashboard.view',
            'gyms.view',
            'members.view',
            'members.create',
            'members.update',
            'attendance.view',
            'attendance.create',
            'attendance.update',
            'attendance.kiosk',
            'membership.view',
            'membership_registrations.view',
            'membership_registrations.create',
            'leads.view',
            'leads.create',
            'leads.update',
            'leads.contact',
            'leads.convert',
            'trainers.view',
            'workout.view',
            'workout_sessions.view',
            'workout_sessions.create',
            'workout_sessions.update',
        ]);

        $trainerRole->syncPermissions([
            'dashboard.view',
            'trainers.view',
            'workout.view',
            'workout.manage',
        ]);

        // 4. Create Gyms
        $flagshipGym = Gym::firstOrCreate(['code' => 'EXF-JKT-01'], [
            'name' => 'Exfits Flagship - Jakarta Pusat',
            'slug' => 'exfits-flagship-jakarta',
            'phone' => '0896-7580-1787',
            'email' => 'flagship@exfits.com',
            'address' => 'Ruko New Castle, Jl. Green Lake City Boulevard No. B 2 - 3, RT.003/RW.008, Petir, Kec. Cipondoh, Kota Tangerang, Banten 15147',
            'timezone' => 'Asia/Jakarta',
            'status' => 'active',
        ]);

        $surabayaGym = Gym::firstOrCreate(['code' => 'EXF-SBY-02'], [
            'name' => 'Exfits Surabaya Branch',
            'slug' => 'exfits-surabaya',
            'phone' => '+62 31 555 0288',
            'email' => 'surabaya@exfits.com',
            'address' => 'Jl. Mayjen Sungkono No. 89, Surabaya',
            'timezone' => 'Asia/Jakarta',
            'status' => 'active',
        ]);

        // 5. Seed Users
        // Super Admin
        $superAdmin = User::firstOrCreate(['email' => 'superadmin@exfits.com'], [
            'name' => 'Exfits Super Admin',
            'phone' => '+62 811 0000 0001',
            'password' => Hash::make('password'),
            'status' => 'active',
            'gym_id' => $flagshipGym->id,
        ]);
        $superAdmin->assignRole('super_admin');

        // Flagship Admin
        $flagshipAdmin = User::firstOrCreate(['email' => 'admin.flagship@exfits.com'], [
            'name' => 'Flagship Admin',
            'phone' => '+62 811 0000 0002',
            'password' => Hash::make('password'),
            'status' => 'active',
            'gym_id' => $flagshipGym->id,
        ]);
        $flagshipAdmin->assignRole('gym_admin', $flagshipGym->id);

        // Flagship Staff
        $flagshipStaff = User::firstOrCreate(['email' => 'staff.flagship@exfits.com'], [
            'name' => 'Flagship Staff',
            'phone' => '+62 811 0000 0003',
            'password' => Hash::make('password'),
            'status' => 'active',
            'gym_id' => $flagshipGym->id,
        ]);
        $flagshipStaff->assignRole('staff', $flagshipGym->id);

        // Surabaya Admin
        $surabayaAdmin = User::firstOrCreate(['email' => 'admin.surabaya@exfits.com'], [
            'name' => 'Surabaya Admin',
            'phone' => '+62 811 0000 0004',
            'password' => Hash::make('password'),
            'status' => 'active',
            'gym_id' => $surabayaGym->id,
        ]);
        $surabayaAdmin->assignRole('gym_admin', $surabayaGym->id);

        // 6. Seed Gym Settings
        GymSetting::firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'group' => 'general',
            'key' => 'operating_hours',
        ], [
            'value' => '06:00 - 22:00 WIB',
        ]);

        GymSetting::firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'group' => 'business',
            'key' => 'currency',
        ], [
            'value' => 'IDR',
        ]);

        GymSetting::firstOrCreate([
            'gym_id' => null,
            'group' => 'system',
            'key' => 'app_version',
        ], [
            'value' => '1.0.0-phase2',
        ]);

        // 7. Seed Demo Members for Phase 2
        /** @var \App\Services\Members\MemberService $memberService */
        $memberService = app(\App\Services\Members\MemberService::class);

        // Seed Flagship Jakarta Members (MEM-000001, MEM-000002, MEM-000003)
        $memberService->createMember([
            'first_name' => 'Arya',
            'last_name' => 'Pratama',
            'email' => 'arya.pratama@example.com',
            'phone' => '+62 812 1111 2222',
            'date_of_birth' => '1995-05-14',
            'gender' => 'male',
            'address' => 'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan',
            'emergency_contact' => [
                'name' => 'Maya Pratama',
                'phone' => '+62 812 9999 0001',
                'relationship' => 'Spouse',
            ],
            'status' => 'active',
        ], null, $flagshipGym->id);

        $memberService->createMember([
            'first_name' => 'Dian',
            'last_name' => 'Kusuma',
            'email' => 'dian.kusuma@example.com',
            'phone' => '+62 812 3333 4444',
            'date_of_birth' => '1998-11-20',
            'gender' => 'female',
            'address' => 'Jl. Kemang Raya No. 15, Jakarta Selatan',
            'emergency_contact' => [
                'name' => 'Bambang Kusuma',
                'phone' => '+62 812 9999 0002',
                'relationship' => 'Father',
            ],
            'status' => 'active',
        ], null, $flagshipGym->id);

        $memberService->createMember([
            'first_name' => 'Reza',
            'last_name' => 'Rahadian',
            'email' => 'reza.rahadian@example.com',
            'phone' => '+62 812 5555 6666',
            'date_of_birth' => '1992-03-08',
            'gender' => 'male',
            'address' => 'Menteng Central, Jakarta Pusat',
            'emergency_contact' => [
                'name' => 'Sari Rahadian',
                'phone' => '+62 812 9999 0003',
                'relationship' => 'Sister',
            ],
            'status' => 'suspended',
        ], null, $flagshipGym->id);

        // Seed Surabaya Branch Members (MEM-000001, MEM-000002)
        $memberService->createMember([
            'first_name' => 'Budi',
            'last_name' => 'Santoso',
            'email' => 'budi.santoso@example.com',
            'phone' => '+62 813 1111 2222',
            'date_of_birth' => '1994-08-17',
            'gender' => 'male',
            'address' => 'Jl. Darmo No. 88, Surabaya',
            'emergency_contact' => [
                'name' => 'Rina Santoso',
                'phone' => '+62 813 9999 0001',
                'relationship' => 'Spouse',
            ],
            'status' => 'active',
        ], null, $surabayaGym->id);

        $siti = $memberService->createMember([
            'first_name' => 'Siti',
            'last_name' => 'Nurhaliza',
            'email' => 'siti.nurhaliza@example.com',
            'phone' => '+62 813 3333 4444',
            'date_of_birth' => '1996-12-05',
            'gender' => 'female',
            'address' => 'Jl. Kertajaya Indah No. 24, Surabaya',
            'emergency_contact' => [
                'name' => 'Ahmad Nurhalim',
                'phone' => '+62 813 9999 0002',
                'relationship' => 'Brother',
            ],
            'status' => 'active',
        ], null, $surabayaGym->id);

        $arya = \App\Models\Member::withoutGymScope()->where('email', 'arya.pratama@example.com')->first();
        $dian = \App\Models\Member::withoutGymScope()->where('email', 'dian.kusuma@example.com')->first();
        $reza = \App\Models\Member::withoutGymScope()->where('email', 'reza.rahadian@example.com')->first();
        $budi = \App\Models\Member::withoutGymScope()->where('email', 'budi.santoso@example.com')->first();

        // 8. Seed Membership Plans (Phase 3)
        $jktPlanBasic = \App\Models\MembershipPlan::firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'slug' => 'basic-monthly',
        ], [
            'name' => 'Basic Monthly',
            'description' => 'Unlimited off-peak gym floor and locker access.',
            'price' => 350000,
            'billing_period' => 'monthly',
            'duration' => 1,
            'joining_fee' => 50000,
            'trainer_quota' => 0,
            'benefits' => ['Gym Floor Access', 'Locker Room & Shower'],
            'status' => 'active',
            'featured' => false,
            'sort_order' => 1,
        ]);

        $jktPlanPremium = \App\Models\MembershipPlan::firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'slug' => 'premium-monthly',
        ], [
            'name' => 'Premium Monthly',
            'description' => 'All-hours access plus 4 personal training sessions included.',
            'price' => 550000,
            'billing_period' => 'monthly',
            'duration' => 1,
            'joining_fee' => 0,
            'trainer_quota' => 4,
            'benefits' => ['24/7 Access', '4 PT Sessions', 'Free Towel Service', 'Sauna Access'],
            'status' => 'active',
            'featured' => true,
            'sort_order' => 2,
        ]);

        $jktPlan3Mo = \App\Models\MembershipPlan::firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'slug' => 'premium-3-months',
        ], [
            'name' => 'Premium 3-Months',
            'description' => 'Quarterly package with 12 personal training sessions.',
            'price' => 1500000,
            'billing_period' => 'quarterly',
            'duration' => 1,
            'joining_fee' => 0,
            'trainer_quota' => 12,
            'benefits' => ['24/7 Access', '12 PT Sessions', 'Towel & Locker', 'Sauna'],
            'status' => 'active',
            'featured' => false,
            'sort_order' => 3,
        ]);

        $jktPlanAnnual = \App\Models\MembershipPlan::firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'slug' => 'annual-vip-platinum',
        ], [
            'name' => 'Annual VIP Platinum',
            'description' => 'Our flagship full-year VIP membership with 24 PT sessions.',
            'price' => 4800000,
            'billing_period' => 'yearly',
            'duration' => 1,
            'joining_fee' => 0,
            'trainer_quota' => 24,
            'benefits' => ['VIP Priority', '24 PT Sessions', 'Free Guest Passes', 'All Branches'],
            'status' => 'active',
            'featured' => true,
            'sort_order' => 4,
        ]);

        // Surabaya Plans
        $sbyPlanBasic = \App\Models\MembershipPlan::firstOrCreate([
            'gym_id' => $surabayaGym->id,
            'slug' => 'basic-monthly',
        ], [
            'name' => 'Basic Monthly',
            'description' => 'Standard gym floor access in Surabaya branch.',
            'price' => 300000,
            'billing_period' => 'monthly',
            'duration' => 1,
            'joining_fee' => 50000,
            'trainer_quota' => 0,
            'benefits' => ['Gym Floor Access', 'Locker Room'],
            'status' => 'active',
            'featured' => false,
            'sort_order' => 1,
        ]);

        $sbyPlanPremium = \App\Models\MembershipPlan::firstOrCreate([
            'gym_id' => $surabayaGym->id,
            'slug' => 'premium-monthly',
        ], [
            'name' => 'Premium Monthly',
            'description' => 'Surabaya branch premium plan with 4 PT sessions.',
            'price' => 480000,
            'billing_period' => 'monthly',
            'duration' => 1,
            'joining_fee' => 0,
            'trainer_quota' => 4,
            'benefits' => ['All-Hours Access', '4 PT Sessions', 'Towel Service'],
            'status' => 'active',
            'featured' => true,
            'sort_order' => 2,
        ]);

        // 9. Seed Workout Types (Phase 3)
        $workoutTypes = [
            ['name' => 'Strength & Conditioning', 'category' => 'Strength', 'description' => 'Barbell, dumbbell, and machine hypertrophy training.'],
            ['name' => 'Cardio Endurance', 'category' => 'Cardio', 'description' => 'Treadmill, rowing, and stationary bike aerobic training.'],
            ['name' => 'HIIT Circuit', 'category' => 'HIIT', 'description' => 'High intensity interval training with kettlebells and battle ropes.'],
            ['name' => 'Functional Training', 'category' => 'Functional', 'description' => 'Bodyweight, plyometrics, and athletic movement patterns.'],
            ['name' => 'Mobility & Recovery', 'category' => 'Mobility', 'description' => 'Stretching, foam rolling, and joint mobility exercises.'],
            ['name' => 'Full Body Blast', 'category' => 'Strength', 'description' => 'Full body compound resistance movements.'],
        ];

        foreach ([$flagshipGym, $surabayaGym] as $gymObj) {
            foreach ($workoutTypes as $idx => $wt) {
                \App\Models\WorkoutType::firstOrCreate([
                    'gym_id' => $gymObj->id,
                    'slug' => \Illuminate\Support\Str::slug($wt['name']),
                ], [
                    'name' => $wt['name'],
                    'category' => $wt['category'],
                    'description' => $wt['description'],
                    'status' => 'active',
                    'sort_order' => $idx + 1,
                ]);
            }
        }

        // 10. Seed Demo Memberships (Phase 3)
        // Historical expired membership for Arya
        \App\Models\Membership::withoutGymScope()->create([
            'gym_id' => $flagshipGym->id,
            'member_id' => $arya->id,
            'membership_plan_id' => $jktPlanBasic->id,
            'start_date' => '2026-06-01',
            'end_date' => '2026-06-30',
            'status' => 'expired',
            'price' => $jktPlanBasic->price,
            'payment_status' => 'paid',
            'trainer_quota_total' => 0,
            'trainer_quota_used' => 0,
            'notes' => 'Previous completed monthly subscription.',
        ]);

        // Current active membership for Arya
        \App\Models\Membership::withoutGymScope()->create([
            'gym_id' => $flagshipGym->id,
            'member_id' => $arya->id,
            'membership_plan_id' => $jktPlanPremium->id,
            'start_date' => '2026-08-01',
            'end_date' => '2026-08-31',
            'status' => 'active',
            'price' => $jktPlanPremium->price,
            'payment_status' => 'paid',
            'trainer_quota_total' => 4,
            'trainer_quota_used' => 0,
            'notes' => 'Active flagship premium member.',
        ]);

        // Dian active membership
        \App\Models\Membership::withoutGymScope()->create([
            'gym_id' => $flagshipGym->id,
            'member_id' => $dian->id,
            'membership_plan_id' => $jktPlanBasic->id,
            'start_date' => '2026-08-10',
            'end_date' => '2026-09-09',
            'status' => 'active',
            'price' => $jktPlanBasic->price,
            'payment_status' => 'paid',
            'trainer_quota_total' => 0,
            'trainer_quota_used' => 0,
        ]);

        // Reza suspended annual membership
        \App\Models\Membership::withoutGymScope()->create([
            'gym_id' => $flagshipGym->id,
            'member_id' => $reza->id,
            'membership_plan_id' => $jktPlanAnnual->id,
            'start_date' => '2026-07-01',
            'end_date' => '2027-06-30',
            'status' => 'suspended',
            'price' => $jktPlanAnnual->price,
            'payment_status' => 'paid',
            'trainer_quota_total' => 24,
            'trainer_quota_used' => 0,
            'notes' => 'Medical leave suspension.',
        ]);

        // Budi active membership (Surabaya)
        \App\Models\Membership::withoutGymScope()->create([
            'gym_id' => $surabayaGym->id,
            'member_id' => $budi->id,
            'membership_plan_id' => $sbyPlanBasic->id,
            'start_date' => '2026-08-05',
            'end_date' => '2026-09-04',
            'status' => 'active',
            'price' => $sbyPlanBasic->price,
            'payment_status' => 'paid',
            'trainer_quota_total' => 0,
            'trainer_quota_used' => 0,
        ]);

        // Siti active membership (Surabaya)
        $sitiMembership = \App\Models\Membership::withoutGymScope()->create([
            'gym_id' => $surabayaGym->id,
            'member_id' => $siti->id,
            'membership_plan_id' => $sbyPlanPremium->id,
            'start_date' => '2026-08-15',
            'end_date' => '2026-09-14',
            'status' => 'active',
            'price' => $sbyPlanPremium->price,
            'payment_status' => 'paid',
            'trainer_quota_total' => 4,
            'trainer_quota_used' => 0,
        ]);

        $aryaActiveMembership = \App\Models\Membership::withoutGymScope()
            ->where('member_id', $arya->id)
            ->where('status', 'active')
            ->first();

        $dianActiveMembership = \App\Models\Membership::withoutGymScope()
            ->where('member_id', $dian->id)
            ->where('status', 'active')
            ->first();

        $budiActiveMembership = \App\Models\Membership::withoutGymScope()
            ->where('member_id', $budi->id)
            ->where('status', 'active')
            ->first();

        // 11. Seed Attendance Records (Phase 4)
        // Arya Pratama: Active in-gym right now
        $aryaActiveAttendance = \App\Models\Attendance::withoutGymScope()->create([
            'gym_id' => $flagshipGym->id,
            'member_id' => $arya->id,
            'membership_id' => $aryaActiveMembership->id,
            'check_in_at' => now()->subMinutes(45),
            'check_out_at' => null,
            'status' => 'in_gym',
            'source' => 'kiosk',
            'device_identifier' => 'kiosk_main_turnstile',
            'notes' => 'Morning workout session',
        ]);

        // Arya Pratama: Yesterday completed visit
        $aryaYesterdayAttendance = \App\Models\Attendance::withoutGymScope()->create([
            'gym_id' => $flagshipGym->id,
            'member_id' => $arya->id,
            'membership_id' => $aryaActiveMembership->id,
            'check_in_at' => now()->subDay()->setTime(17, 30),
            'check_out_at' => now()->subDay()->setTime(18, 45),
            'status' => 'checked_out',
            'source' => 'kiosk',
            'device_identifier' => 'kiosk_main_turnstile',
        ]);

        // Dian Kusuma: Completed visit yesterday
        $dianYesterdayAttendance = \App\Models\Attendance::withoutGymScope()->create([
            'gym_id' => $flagshipGym->id,
            'member_id' => $dian->id,
            'membership_id' => $dianActiveMembership->id,
            'check_in_at' => now()->subDay()->setTime(7, 15),
            'check_out_at' => now()->subDay()->setTime(8, 20),
            'status' => 'checked_out',
            'source' => 'kiosk',
            'device_identifier' => 'kiosk_main_turnstile',
        ]);

        // Siti Nurhaliza: Active in-gym right now (Surabaya)
        $sitiActiveAttendance = \App\Models\Attendance::withoutGymScope()->create([
            'gym_id' => $surabayaGym->id,
            'member_id' => $siti->id,
            'membership_id' => $sitiMembership->id,
            'check_in_at' => now()->subMinutes(25),
            'check_out_at' => null,
            'status' => 'in_gym',
            'source' => 'kiosk',
            'device_identifier' => 'kiosk_surabaya_gate',
        ]);

        // Budi Santoso: Completed visit 2 days ago (Surabaya)
        $budiPastAttendance = \App\Models\Attendance::withoutGymScope()->create([
            'gym_id' => $surabayaGym->id,
            'member_id' => $budi->id,
            'membership_id' => $budiActiveMembership->id,
            'check_in_at' => now()->subDays(2)->setTime(18, 0),
            'check_out_at' => now()->subDays(2)->setTime(19, 15),
            'status' => 'checked_out',
            'source' => 'admin',
            'device_identifier' => null,
            'notes' => 'Manual front-desk check-in',
        ]);

        // 12. Seed Trainers & Schedules (Phase 4C & 6.5)
        $jktTrainersData = [
            [
                'name' => 'Budi Pratama',
                'role' => 'Head Strength Coach',
                'email' => 'budi.trainer@exfits.com',
                'phone' => '+62 812 8888 1001',
                'bio' => 'Certified CSCS strength coach with 8+ years specializing in hypertrophy, biomechanics, and progressive overload.',
                'specialization' => 'Strength & Hypertrophy',
                'certification' => 'CSCS, NASM-CPT, Precision Nutrition Level 1',
                'sort_order' => 0,
                'hire_date' => '2024-01-15',
                'status' => 'active',
            ],
            [
                'name' => 'Andi Wijaya',
                'role' => 'Performance & Conditioning Coach',
                'email' => 'andi.trainer@exfits.com',
                'phone' => '+62 812 8888 1002',
                'bio' => 'High-intensity interval trainer & functional movement specialist focusing on metabolic cardiovascular conditioning.',
                'specialization' => 'Functional & HIIT',
                'certification' => 'ACE-CPT, FMS Level 2',
                'sort_order' => 1,
                'hire_date' => '2024-03-01',
                'status' => 'active',
            ],
            [
                'name' => 'Raka Aditya',
                'role' => 'Powerlifting & Hypertrophy Specialist',
                'email' => 'raka.trainer@exfits.com',
                'phone' => '+62 812 8888 1003',
                'bio' => 'National competitive powerlifter coaching squat, bench, and deadlift technical mastery.',
                'specialization' => 'Powerlifting & Bodybuilding',
                'certification' => 'USAPL Club Coach, ISSN Sports Nutrition',
                'sort_order' => 2,
                'hire_date' => '2024-06-10',
                'status' => 'active',
            ],
            [
                'name' => 'Dimas Setiawan',
                'role' => 'Mobility & Rehab Specialist',
                'email' => 'dimas.trainer@exfits.com',
                'phone' => '+62 812 8888 1004',
                'bio' => 'Calisthenics athlete and joint mobility specialist assisting with active recovery and injury prevention.',
                'specialization' => 'Mobility & Calisthenics',
                'certification' => 'FRCms, CSCS Specialist',
                'sort_order' => 3,
                'hire_date' => '2025-01-20',
                'status' => 'inactive',
            ],
        ];

        $jktTrainers = [];
        foreach ($jktTrainersData as $tData) {
            $t = \App\Models\Trainer::withoutGymScope()->firstOrCreate([
                'gym_id' => $flagshipGym->id,
                'email' => $tData['email'],
            ], array_merge($tData, ['gym_id' => $flagshipGym->id]));
            $jktTrainers[$t->name] = $t;

            // Seed weekly schedule (Mon - Fri: 08:00-12:00, 14:00-18:00, Sat: 09:00-15:00)
            if ($t->status === 'active') {
                for ($day = 1; $day <= 5; $day++) {
                    \App\Models\TrainerSchedule::withoutGymScope()->firstOrCreate([
                        'gym_id' => $flagshipGym->id,
                        'trainer_id' => $t->id,
                        'day_of_week' => $day,
                        'start_time' => '08:00:00',
                        'end_time' => '12:00:00',
                    ], [
                        'status' => 'active',
                        'notes' => 'Morning shift',
                    ]);

                    \App\Models\TrainerSchedule::withoutGymScope()->firstOrCreate([
                        'gym_id' => $flagshipGym->id,
                        'trainer_id' => $t->id,
                        'day_of_week' => $day,
                        'start_time' => '14:00:00',
                        'end_time' => '20:00:00',
                    ], [
                        'status' => 'active',
                        'notes' => 'Afternoon/Evening shift',
                    ]);
                }

                \App\Models\TrainerSchedule::withoutGymScope()->firstOrCreate([
                    'gym_id' => $flagshipGym->id,
                    'trainer_id' => $t->id,
                    'day_of_week' => 6, // Saturday
                    'start_time' => '09:00:00',
                    'end_time' => '17:00:00',
                ], [
                    'status' => 'active',
                    'notes' => 'Weekend weekend clinic',
                ]);

                \App\Models\TrainerSchedule::withoutGymScope()->firstOrCreate([
                    'gym_id' => $flagshipGym->id,
                    'trainer_id' => $t->id,
                    'day_of_week' => 0, // Sunday
                    'start_time' => '08:00:00',
                    'end_time' => '18:00:00',
                ], [
                    'status' => 'active',
                    'notes' => 'Sunday schedule',
                ]);
            }
        }

        // Surabaya Trainers
        $sbyTrainersData = [
            [
                'name' => 'Siti Rahmawati',
                'email' => 'siti.trainer@exfits.com',
                'phone' => '+62 813 8888 2001',
                'bio' => 'Pilates master instructor and postural correction coach.',
                'specialization' => 'Pilates & Core Conditioning',
                'hire_date' => '2024-05-12',
                'status' => 'active',
            ],
            [
                'name' => 'Fajar Hidayat',
                'email' => 'fajar.trainer@exfits.com',
                'phone' => '+62 813 8888 2002',
                'bio' => 'Athletic conditioning and fat loss specialist.',
                'specialization' => 'HIIT & Weight Loss',
                'hire_date' => '2024-07-01',
                'status' => 'active',
            ],
            [
                'name' => 'Rizky Kurniawan',
                'email' => 'rizky.trainer@exfits.com',
                'phone' => '+62 813 8888 2003',
                'bio' => 'Olympic weightlifting coach focusing on clean & jerk and snatch technique.',
                'specialization' => 'Olympic Weightlifting',
                'hire_date' => '2024-09-15',
                'status' => 'active',
            ],
        ];

        $sbyTrainers = [];
        foreach ($sbyTrainersData as $tData) {
            $t = \App\Models\Trainer::withoutGymScope()->firstOrCreate([
                'gym_id' => $surabayaGym->id,
                'email' => $tData['email'],
            ], array_merge($tData, ['gym_id' => $surabayaGym->id]));
            $sbyTrainers[$t->name] = $t;

            if ($t->status === 'active') {
                for ($day = 1; $day <= 6; $day++) {
                    \App\Models\TrainerSchedule::withoutGymScope()->firstOrCreate([
                        'gym_id' => $surabayaGym->id,
                        'trainer_id' => $t->id,
                        'day_of_week' => $day,
                        'start_time' => '07:00:00',
                        'end_time' => '15:00:00',
                    ], [
                        'status' => 'active',
                    ]);
                }
                \App\Models\TrainerSchedule::withoutGymScope()->firstOrCreate([
                    'gym_id' => $surabayaGym->id,
                    'trainer_id' => $t->id,
                    'day_of_week' => 0,
                    'start_time' => '07:00:00',
                    'end_time' => '19:00:00',
                ], [
                    'status' => 'active',
                ]);
            }
        }

        // 13. Seed Training Sessions (Phase 4B & 4C)
        $jktStrength = \App\Models\WorkoutType::withoutGymScope()->where('gym_id', $flagshipGym->id)->where('name', 'Strength & Conditioning')->first();
        $jktCardio = \App\Models\WorkoutType::withoutGymScope()->where('gym_id', $flagshipGym->id)->where('name', 'Cardio Endurance')->first();
        $sbyStrength = \App\Models\WorkoutType::withoutGymScope()->where('gym_id', $surabayaGym->id)->where('name', 'Strength & Conditioning')->first();
        $sbyCardio = \App\Models\WorkoutType::withoutGymScope()->where('gym_id', $surabayaGym->id)->where('name', 'Cardio Endurance')->first();

        $budiTrainer = $jktTrainers['Budi Pratama'] ?? null;
        $andiTrainer = $jktTrainers['Andi Wijaya'] ?? null;
        $sitiTrainer = $sbyTrainers['Siti Rahmawati'] ?? null;

        // Arya: In-Progress session under active visit today (with Trainer Budi)
        if ($jktStrength) {
            \App\Models\TrainingSession::withoutGymScope()->create([
                'gym_id' => $flagshipGym->id,
                'attendance_id' => $aryaActiveAttendance->id,
                'member_id' => $arya->id,
                'membership_id' => $aryaActiveMembership->id,
                'workout_type_id' => $jktStrength->id,
                'trainer_id' => $budiTrainer?->id,
                'started_at' => now()->subMinutes(35),
                'completed_at' => null,
                'trainer_quota_consumed_at' => null,
                'status' => 'in_progress',
                'notes' => 'Heavy upper body push focus with Trainer Budi',
            ]);
        }

        // Arya: 2 Completed sessions during yesterday's attendance visit (Strength with Trainer + Cardio without trainer)
        if ($jktStrength && $jktCardio) {
            \App\Models\TrainingSession::withoutGymScope()->create([
                'gym_id' => $flagshipGym->id,
                'attendance_id' => $aryaYesterdayAttendance->id,
                'member_id' => $arya->id,
                'membership_id' => $aryaActiveMembership->id,
                'workout_type_id' => $jktStrength->id,
                'trainer_id' => $budiTrainer?->id,
                'started_at' => now()->subDay()->setTime(17, 35),
                'completed_at' => now()->subDay()->setTime(18, 20),
                'trainer_quota_consumed_at' => now()->subDay()->setTime(18, 20),
                'status' => 'completed',
                'notes' => 'Leg day quad focus with Trainer Budi',
            ]);

            // Update Arya's membership quota: 1 used out of 4
            $aryaActiveMembership->update([
                'trainer_quota_used' => 1,
            ]);

            \App\Models\TrainingSession::withoutGymScope()->create([
                'gym_id' => $flagshipGym->id,
                'attendance_id' => $aryaYesterdayAttendance->id,
                'member_id' => $arya->id,
                'membership_id' => $aryaActiveMembership->id,
                'workout_type_id' => $jktCardio->id,
                'trainer_id' => null, // Non-trainer session
                'started_at' => now()->subDay()->setTime(18, 25),
                'completed_at' => now()->subDay()->setTime(18, 45),
                'trainer_quota_consumed_at' => null,
                'status' => 'completed',
                'notes' => 'Treadmill cool-down zone 2',
            ]);
        }

        // Dian: Completed session yesterday (non-trainer)
        if ($jktCardio) {
            \App\Models\TrainingSession::withoutGymScope()->create([
                'gym_id' => $flagshipGym->id,
                'attendance_id' => $dianYesterdayAttendance->id,
                'member_id' => $dian->id,
                'membership_id' => $dianActiveMembership->id,
                'workout_type_id' => $jktCardio->id,
                'trainer_id' => null,
                'started_at' => now()->subDay()->setTime(7, 20),
                'completed_at' => now()->subDay()->setTime(8, 10),
                'trainer_quota_consumed_at' => null,
                'status' => 'completed',
                'notes' => 'Morning HIIT intervals',
            ]);
        }

        // Siti (Surabaya): In-Progress session under active attendance today
        if ($sbyStrength) {
            \App\Models\TrainingSession::withoutGymScope()->create([
                'gym_id' => $surabayaGym->id,
                'attendance_id' => $sitiActiveAttendance->id,
                'member_id' => $siti->id,
                'membership_id' => $sitiMembership->id,
                'workout_type_id' => $sbyStrength->id,
                'trainer_id' => $sitiTrainer?->id,
                'started_at' => now()->subMinutes(20),
                'completed_at' => null,
                'trainer_quota_consumed_at' => null,
                'status' => 'in_progress',
            ]);
        }

        // Budi (Surabaya): Completed session 2 days ago
        if ($sbyCardio) {
            \App\Models\TrainingSession::withoutGymScope()->create([
                'gym_id' => $surabayaGym->id,
                'attendance_id' => $budiPastAttendance->id,
                'member_id' => $budi->id,
                'membership_id' => $budiActiveMembership->id,
                'workout_type_id' => $sbyCardio->id,
                'trainer_id' => null,
                'started_at' => now()->subDays(2)->setTime(18, 10),
                'completed_at' => now()->subDays(2)->setTime(19, 05),
                'trainer_quota_consumed_at' => null,
                'status' => 'completed',
            ]);
        }

        // ==========================================
        // 14. Phase 5 — Website CMS & Public Branding
        // ==========================================

        /** @var \App\Services\Settings\SettingService $settingService */
        $settingService = app(\App\Services\Settings\SettingService::class);

        // Flagship Jakarta Website Settings
        $settingService->set('site_title', 'Exfits Flagship - Jakarta Pusat', 'website', $flagshipGym->id);
        $settingService->set('meta_title', 'Exfits Flagship Jakarta | High Voltage Performance Gym', 'website', $flagshipGym->id);
        $settingService->set('meta_description', 'Flagship fitness center in Sudirman, Jakarta Pusat. World-class strength equipment, Olympic platforms, Finnish sauna, and certified personal trainers.', 'website', $flagshipGym->id);
        $settingService->set('hero_headline', 'HIGH VOLTAGE FITNESS & ELITE TRAINING', 'website', $flagshipGym->id);
        $settingService->set('hero_subheadline', 'Sudirman’s premier strength training facility with certified personal coaches, precision biomechanics, and luxury recovery amenities.', 'website', $flagshipGym->id);
        $settingService->set('hero_cta_text', 'EXPLORE MEMBERSHIPS', 'website', $flagshipGym->id);
        $settingService->set('social_instagram', 'https://instagram.com/exfits.jakarta', 'website', $flagshipGym->id);
        $settingService->set('social_facebook', 'https://facebook.com/exfits.jakarta', 'website', $flagshipGym->id);
        $settingService->set('social_youtube', 'https://youtube.com/@exfits.jakarta', 'website', $flagshipGym->id);
        $settingService->set('social_tiktok', 'https://tiktok.com/@exfits.jakarta', 'website', $flagshipGym->id);
        $settingService->set('contact_whatsapp', '+6281100000002', 'website', $flagshipGym->id);
        $settingService->set('contact_email', 'jakarta@exfits.com', 'website', $flagshipGym->id);
        $settingService->set('contact_phone', '0896-7580-1787', 'website', $flagshipGym->id);
        $settingService->set('contact_address', 'Ruko New Castle, Jl. Green Lake City Boulevard No. B 2 - 3, RT.003/RW.008, Petir, Kec. Cipondoh, Kota Tangerang, Banten 15147', 'website', $flagshipGym->id);
        $settingService->set('operating_hours', 'Mon - Sun: 06:00 - 23:00 WIB', 'website', $flagshipGym->id);
        $settingService->set('announcement_bar', 'PROMO: Free 1 Personal Training Session with Annual Membership', 'website', $flagshipGym->id);
        $settingService->set('is_public_visible', true, 'website', $flagshipGym->id);

        // Seed Home Hero Slides (Phase 6.5)
        \App\Models\WebsiteHero::withoutGymScope()->firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'title' => 'HIGH VOLTAGE FITNESS & ELITE TRAINING',
        ], [
            'gym_id' => $flagshipGym->id,
            'title' => 'HIGH VOLTAGE FITNESS & ELITE TRAINING',
            'subtitle' => 'ENGINEERED FOR PEAK PERFORMANCE',
            'description' => 'World-class strength equipment, Olympic lifting platforms, Finnish sauna, and certified strength coaches engineered for your peak performance.',
            'cta_label' => 'EXPLORE MEMBERSHIPS',
            'cta_url' => route('public.membership'),
            'media_type' => 'image',
            'media_path' => null,
            'poster_path' => null,
            'sort_order' => 0,
            'is_active' => true,
        ]);

        \App\Models\WebsiteHero::withoutGymScope()->firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'title' => 'PRECISION COACHING & RECOVERY',
        ], [
            'gym_id' => $flagshipGym->id,
            'title' => 'PRECISION COACHING & RECOVERY',
            'subtitle' => '1-ON-1 PERSONAL TRAINING MASTERY',
            'description' => 'Train with certified strength coaches equipped with biometric monitoring and individualized progressive overload programs.',
            'cta_label' => 'MEET OUR COACHES',
            'cta_url' => route('public.trainers'),
            'media_type' => 'image',
            'media_path' => null,
            'poster_path' => null,
            'sort_order' => 1,
            'is_active' => true,
        ]);

        // Flagship Jakarta Facilities
        \App\Models\WebsiteFacility::withoutGymScope()->firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'name' => 'Olympic Lifting & Power Racks',
        ], [
            'description' => '8 professional lifting platforms with calibrated steel plates, Eleiko competition barbells, and chalk stations.',
            'icon' => 'Dumbbell',
            'status' => 'active',
            'sort_order' => 1,
        ]);

        \App\Models\WebsiteFacility::withoutGymScope()->firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'name' => 'Plate-Loaded & Cable Zone',
        ], [
            'description' => 'Comprehensive range of Hammer Strength and Prime selectorized machines for targeted muscle hypertrophy.',
            'icon' => 'Flame',
            'status' => 'active',
            'sort_order' => 2,
        ]);

        \App\Models\WebsiteFacility::withoutGymScope()->firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'name' => 'Cardio Cinema & Turf Sled Track',
        ], [
            'description' => '25-meter indoor turf sprint track with weighted push sleds, curved assault treadmills, and rowing ergs.',
            'icon' => 'Zap',
            'status' => 'active',
            'sort_order' => 3,
        ]);

        \App\Models\WebsiteFacility::withoutGymScope()->firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'name' => 'Finnish Dry Sauna & Luxury Lockers',
        ], [
            'description' => 'Post-workout thermal recovery sauna, high-pressure hot showers, digital lockers, and grooming vanity stations.',
            'icon' => 'Shield',
            'status' => 'active',
            'sort_order' => 4,
        ]);

        // Flagship Jakarta FAQs
        \App\Models\WebsiteFaq::withoutGymScope()->firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'question' => 'How do I activate my membership after joining?',
        ], [
            'answer' => 'Visit our front desk with a valid ID card (KTP / Passport). Our staff will register your account and provide you with instant QR access.',
            'category' => 'membership',
            'status' => 'published',
            'sort_order' => 1,
        ]);

        \App\Models\WebsiteFaq::withoutGymScope()->firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'question' => 'Are personal trainers included in the membership?',
        ], [
            'answer' => 'Pro and Elite packages include complimentary personal trainer sessions. You can also purchase additional PT packages directly at our front desk.',
            'category' => 'personal_training',
            'status' => 'published',
            'sort_order' => 2,
        ]);

        \App\Models\WebsiteFaq::withoutGymScope()->firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'question' => 'What amenities are included for all members?',
        ], [
            'answer' => 'Every membership includes full equipment access, digital lockers, hot showers, Finnish dry sauna, and filtered water refill stations.',
            'category' => 'facilities',
            'status' => 'published',
            'sort_order' => 3,
        ]);

        // Flagship Jakarta CMS Pages
        \App\Models\WebsitePage::withoutGymScope()->firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'slug' => 'terms-of-service',
        ], [
            'title' => 'Terms of Service',
            'excerpt' => 'General membership terms, code of conduct, and access policies for Exfits Flagship Jakarta.',
            'content' => "Welcome to Exfits Gym.\n\n1. Membership Access: Members must present valid QR credentials at turnstiles.\n2. Gym Etiquette: Please re-rack weights and wipe down equipment after use.\n3. Safety: Appropriate athletic footwear is mandatory at all times.",
            'status' => 'published',
            'published_at' => now(),
            'sort_order' => 1,
        ]);

        \App\Models\WebsitePage::withoutGymScope()->firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'slug' => 'privacy-policy',
        ], [
            'title' => 'Privacy Policy',
            'excerpt' => 'How Exfits collects, protects, and handles your personal information.',
            'content' => "Exfits is committed to data privacy and security.\n\n1. Data Collection: We collect name, contact information, and attendance timestamps for facility management.\n2. Security: All member records are strictly isolated and encrypted.\n3. Third Parties: We never sell your personal data.",
            'status' => 'published',
            'published_at' => now(),
            'sort_order' => 2,
        ]);

        // Flagship Jakarta Homepage Sections
        \App\Models\WebsiteSection::withoutGymScope()->firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'section_key' => 'hero',
        ], [
            'title' => 'HIGH VOLTAGE FITNESS & ELITE TRAINING',
            'subtitle' => 'Sudirman’s premier strength training facility with certified personal coaches, precision biomechanics, and luxury recovery amenities.',
            'button_text' => 'EXPLORE MEMBERSHIPS',
            'button_url' => '/membership',
            'status' => 'active',
            'sort_order' => 1,
        ]);

        \App\Models\WebsiteSection::withoutGymScope()->firstOrCreate([
            'gym_id' => $flagshipGym->id,
            'section_key' => 'about_preview',
        ], [
            'title' => 'ENGINEERED FOR SERIOUS RESULTS',
            'subtitle' => 'We combine heavy iron, precision machines, and top-tier coaching in an intense yet welcoming environment.',
            'content' => 'Exfits Gym was built to eliminate commercial gym gimmicks and provide an elite training ground for lifters and athletes.',
            'button_text' => 'ABOUT US',
            'button_url' => '/about',
            'status' => 'active',
            'sort_order' => 2,
        ]);

        // Surabaya Branch Website Settings
        $settingService->set('site_title', 'Exfits Surabaya Branch - Mayjen Sungkono', 'website', $surabayaGym->id);
        $settingService->set('meta_title', 'Exfits Surabaya | Strength & Conditioning Gym', 'website', $surabayaGym->id);
        $settingService->set('meta_description', 'Premier gym in Mayjen Sungkono, Surabaya. Full free weights area, functional conditioning, and professional personal coaching.', 'website', $surabayaGym->id);
        $settingService->set('hero_headline', 'POWER & PERFORMANCE SURABAYA', 'website', $surabayaGym->id);
        $settingService->set('hero_subheadline', 'Mayjen Sungkono’s dedicated gym facility built for serious lifters and daily fitness enthusiasts.', 'website', $surabayaGym->id);
        $settingService->set('hero_cta_text', 'JOIN SURABAYA BRANCH', 'website', $surabayaGym->id);
        $settingService->set('contact_whatsapp', '+6281100000004', 'website', $surabayaGym->id);
        $settingService->set('contact_email', 'surabaya@exfits.com', 'website', $surabayaGym->id);
        $settingService->set('contact_phone', '+62 31 555 0288', 'website', $surabayaGym->id);
        $settingService->set('contact_address', 'Jl. Mayjen Sungkono No. 89, Surabaya', 'website', $surabayaGym->id);
        $settingService->set('operating_hours', 'Mon - Sun: 06:00 - 22:00 WIB', 'website', $surabayaGym->id);
        $settingService->set('is_public_visible', true, 'website', $surabayaGym->id);

        // Surabaya Facilities
        \App\Models\WebsiteFacility::withoutGymScope()->firstOrCreate([
            'gym_id' => $surabayaGym->id,
            'name' => 'Free Weights & Dumbbells up to 50kg',
        ], [
            'description' => 'Extensive heavy dumbbell racks, flat/incline benches, and heavy-duty squat cages.',
            'icon' => 'Dumbbell',
            'status' => 'active',
            'sort_order' => 1,
        ]);

        \App\Models\WebsiteFacility::withoutGymScope()->firstOrCreate([
            'gym_id' => $surabayaGym->id,
            'name' => 'Functional Conditioning Turf',
        ], [
            'description' => 'Agility ladders, battle ropes, kettlebells, and plyometric boxes for HIIT circuits.',
            'icon' => 'Zap',
            'status' => 'active',
            'sort_order' => 2,
        ]);

        // Surabaya FAQs
        \App\Models\WebsiteFaq::withoutGymScope()->firstOrCreate([
            'gym_id' => $surabayaGym->id,
            'question' => 'Is parking available at the Surabaya branch?',
        ], [
            'answer' => 'Yes, spacious dedicated parking is available for both cars and motorbikes directly in front of the facility.',
            'category' => 'general',
            'status' => 'published',
            'sort_order' => 1,
        ]);

        // 13. Phase 5B — Sample Membership Registrations
        $jktPlan = \App\Models\MembershipPlan::withoutGymScope()->where('gym_id', $flagshipGym->id)->first();
        if ($jktPlan) {
            \App\Models\MembershipRegistration::withoutGymScope()->firstOrCreate([
                'gym_id' => $flagshipGym->id,
                'registration_number' => 'REG-000001',
            ], [
                'membership_plan_id' => $jktPlan->id,
                'source' => 'website',
                'status' => 'pending',
                'full_name' => 'Dimas Arya Putra',
                'email' => 'dimas.arya@example.com',
                'phone' => '081234567891',
                'gender' => 'male',
                'date_of_birth' => '1995-04-12',
                'address' => 'Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan',
                'city' => 'Jakarta Selatan',
                'emergency_contact_name' => 'Rina Putri',
                'emergency_contact_phone' => '081234567899',
                'emergency_contact_relationship' => 'Istri',
                'notes' => 'Target latihan kekuatan dan hypertrophy 4x seminggu.',
            ]);

            \App\Models\MembershipRegistration::withoutGymScope()->firstOrCreate([
                'gym_id' => $flagshipGym->id,
                'registration_number' => 'REG-000002',
            ], [
                'membership_plan_id' => $jktPlan->id,
                'source' => 'website',
                'status' => 'pending',
                'full_name' => 'Jessica Anindita',
                'email' => 'jessica.anindita@example.com',
                'phone' => '081398765432',
                'gender' => 'female',
                'date_of_birth' => '1998-09-21',
                'address' => 'Apartemen Sudirman Park Tower B No. 1204, Jakarta Pusat',
                'city' => 'Jakarta Pusat',
                'emergency_contact_name' => 'Budi Anindita',
                'emergency_contact_phone' => '081398765400',
                'emergency_contact_relationship' => 'Orang Tua',
                'notes' => 'Tertarik program fat loss dan private coaching.',
            ]);
        }

        $sbyPlan = \App\Models\MembershipPlan::withoutGymScope()->where('gym_id', $surabayaGym->id)->first();
        if ($sbyPlan) {
            \App\Models\MembershipRegistration::withoutGymScope()->firstOrCreate([
                'gym_id' => $surabayaGym->id,
                'registration_number' => 'REG-000001',
            ], [
                'membership_plan_id' => $sbyPlan->id,
                'source' => 'website',
                'status' => 'pending',
                'full_name' => 'Bayu Wicaksono',
                'email' => 'bayu.wicaksono@example.com',
                'phone' => '081765432109',
                'gender' => 'male',
                'date_of_birth' => '1992-11-05',
                'address' => 'Jl. HR Muhammad No. 88, Surabaya',
                'city' => 'Surabaya',
                'emergency_contact_name' => 'Dewi Wicaksono',
                'emergency_contact_phone' => '081765432100',
                'emergency_contact_relationship' => 'Istri',
                'notes' => 'Pindahan dari gym lain, fokus powerlifting.',
            ]);
        }
    }
}
