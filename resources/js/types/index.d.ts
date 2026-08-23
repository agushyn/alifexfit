export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string | null;
    status: 'active' | 'inactive';
    avatar?: string | null;
    gym_id?: number | null;
    is_super_admin: boolean;
    roles: string[];
    permissions: string[];
}

export interface Gym {
    id: number;
    name: string;
    slug: string;
    code: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    logo?: string | null;
    timezone: string;
    status: 'active' | 'inactive';
    users_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface EmergencyContact {
    name?: string | null;
    phone?: string | null;
    relationship?: string | null;
}

export interface MembershipPlan {
    id: number;
    gym_id: number;
    name: string;
    slug: string;
    description?: string | null;
    price: number | string;
    billing_period: 'monthly' | 'quarterly' | 'yearly' | 'custom';
    duration: number;
    joining_fee: number | string;
    trainer_quota: number;
    benefits?: string[] | null;
    status: 'active' | 'inactive';
    featured: boolean;
    sort_order: number;
    memberships_count?: number;
    created_at?: string;
    updated_at?: string;
    gym?: Gym | null;
}

export interface Membership {
    id: number;
    gym_id: number;
    member_id: number;
    membership_plan_id: number;
    start_date: string;
    end_date: string;
    status: 'pending' | 'active' | 'expired' | 'suspended' | 'cancelled';
    price: number | string;
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'expired';
    trainer_quota_total: number;
    trainer_quota_used: number;
    remaining_trainer_quota?: number;
    notes?: string | null;
    created_at: string;
    updated_at: string;
    member?: Member | null;
    membership_plan?: MembershipPlan | null;
    gym?: Gym | null;
    attendances?: Attendance[] | null;
    training_sessions?: TrainingSession[] | null;
}

export interface TrainerSchedule {
    id: number;
    gym_id: number;
    trainer_id: number;
    day_of_week: number;
    day_name?: string;
    start_time: string;
    end_time: string;
    formatted_time_range?: string;
    status: 'active' | 'inactive';
    notes?: string | null;
    created_at?: string;
    updated_at?: string;
    trainer?: Trainer | null;
    gym?: Gym | null;
}

export interface Trainer {
    id: number;
    gym_id: number;
    name: string;
    role?: string | null;
    email?: string | null;
    phone?: string | null;
    bio?: string | null;
    profile_photo?: string | null;
    profile_photo_url?: string | null;
    status: 'active' | 'inactive';
    specialization?: string | null;
    certification?: string | null;
    sort_order?: number;
    is_active?: boolean;
    hire_date?: string | null;
    notes?: string | null;
    is_available_now?: boolean;
    training_sessions_count?: number;
    schedules?: TrainerSchedule[] | null;
    active_schedules?: TrainerSchedule[] | null;
    training_sessions?: TrainingSession[] | null;
    gym?: Gym | null;
    created_at?: string;
    updated_at?: string;
}

export interface WebsiteHero {
    id: number;
    gym_id: number;
    title: string;
    subtitle?: string | null;
    description?: string | null;
    cta_label?: string | null;
    cta_url?: string | null;
    media_type: 'image' | 'video';
    media_path?: string | null;
    media_url?: string | null;
    poster_path?: string | null;
    poster_url?: string | null;
    sort_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    gym?: Gym | null;
}

export interface TrainingSession {
    id: number;
    gym_id: number;
    attendance_id: number;
    member_id: number;
    membership_id?: number | null;
    workout_type_id: number;
    trainer_id?: number | null;
    started_at: string;
    completed_at?: string | null;
    trainer_quota_consumed_at?: string | null;
    status: 'in_progress' | 'completed' | 'cancelled';
    notes?: string | null;
    duration_in_minutes: number;
    duration_formatted: string;
    created_at?: string;
    updated_at?: string;
    gym?: Gym | null;
    attendance?: Attendance | null;
    member?: Member | null;
    membership?: Membership | null;
    workout_type?: WorkoutType | null;
    trainer?: Trainer | null;
}

export interface Attendance {
    id: number;
    gym_id: number;
    member_id: number;
    membership_id: number;
    check_in_at: string;
    check_out_at?: string | null;
    status: 'in_gym' | 'checked_out' | 'cancelled';
    source: 'kiosk' | 'app' | 'admin';
    device_identifier?: string | null;
    notes?: string | null;
    duration_in_minutes?: number | null;
    duration_formatted?: string;
    created_at?: string;
    updated_at?: string;
    member?: Member | null;
    membership?: Membership | null;
    gym?: Gym | null;
    training_sessions?: TrainingSession[] | null;
    active_training_session?: TrainingSession | null;
}

export interface WorkoutType {
    id: number;
    gym_id: number;
    name: string;
    slug: string;
    description?: string | null;
    category?: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
    created_at?: string;
    updated_at?: string;
    gym?: Gym | null;
    training_sessions?: TrainingSession[] | null;
}

export interface Member {
    id: number;
    gym_id: number;
    member_number: string;
    first_name: string;
    last_name?: string | null;
    full_name: string;
    email?: string | null;
    phone?: string | null;
    date_of_birth?: string | null;
    gender?: 'male' | 'female' | 'other' | null;
    address?: string | null;
    emergency_contact?: EmergencyContact | null;
    profile_photo?: string | null;
    profile_photo_url?: string | null;
    status: 'active' | 'inactive' | 'suspended' | 'expired';
    created_at: string;
    updated_at: string;
    gym?: Gym | null;
    active_membership?: Membership | null;
    memberships?: Membership[] | null;
    active_attendance?: Attendance | null;
    latest_attendance?: Attendance | null;
    attendances?: Attendance[] | null;
    training_sessions?: TrainingSession[] | null;
}

export interface GymSetting {
    id: number;
    gym_id?: number | null;
    group: string;
    key: string;
    value?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface AuditLog {
    id: number;
    gym_id?: number | null;
    user_id?: number | null;
    action: string;
    entity_type?: string | null;
    entity_id?: number | null;
    metadata?: Record<string, any> | null;
    ip_address?: string | null;
    user_agent?: string | null;
    created_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    } | null;
    gym?: {
        id: number;
        name: string;
        code: string;
    } | null;
}

export interface WebsitePage {
    id: number;
    gym_id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    content?: string | null;
    status: 'draft' | 'published' | 'archived';
    published_at?: string | null;
    meta_title?: string | null;
    meta_description?: string | null;
    og_image?: string | null;
    og_image_url?: string | null;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
    gym?: Gym | null;
}

export interface WebsiteFaq {
    id: number;
    gym_id: number;
    question: string;
    answer: string;
    category?: string | null;
    status: 'published' | 'draft';
    sort_order: number;
    created_at?: string;
    updated_at?: string;
    gym?: Gym | null;
}

export interface WebsiteFacility {
    id: number;
    gym_id: number;
    name: string;
    description?: string | null;
    image?: string | null;
    image_url?: string | null;
    icon?: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
    created_at?: string;
    updated_at?: string;
    gym?: Gym | null;
}

export interface WebsiteSection {
    id: number;
    gym_id: number;
    section_key: string;
    title?: string | null;
    subtitle?: string | null;
    content?: string | null;
    image?: string | null;
    image_url?: string | null;
    button_text?: string | null;
    button_url?: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
    metadata?: Record<string, any> | null;
    created_at?: string;
    updated_at?: string;
    gym?: Gym | null;
}

export interface WebsiteBranding {
    gym: {
        id: number;
        name: string;
        slug: string;
        code: string;
        phone?: string | null;
        email?: string | null;
        address?: string | null;
        logo_url?: string | null;
        timezone?: string | null;
    };
    settings: {
        site_title: string;
        meta_title: string;
        meta_description: string;
        hero_headline: string;
        hero_subheadline: string;
        hero_cta_text: string;
        social_instagram?: string | null;
        social_facebook?: string | null;
        social_youtube?: string | null;
        social_tiktok?: string | null;
        contact_whatsapp?: string | null;
        contact_email?: string | null;
        contact_phone?: string | null;
        contact_address?: string | null;
        operating_hours?: string | null;
        announcement_bar?: string | null;
        google_maps_embed_url?: string | null;
        is_public_visible: boolean;
        og_image_url?: string | null;
    };
}

export interface Payment {
    id: number;
    gym_id: number;
    membership_registration_id: number;
    order_id: string;
    provider: string;
    provider_transaction_id?: string | null;
    provider_reference?: string | null;
    payment_method: string;
    payment_channel: string;
    amount: number | string;
    currency: string;
    status: 'unpaid' | 'pending' | 'paid' | 'failed' | 'expired' | 'refunded' | 'cancelled';
    payment_url?: string | null;
    qr_string?: string | null;
    va_number?: string | null;
    bill_key?: string | null;
    biller_code?: string | null;
    expires_at?: string | null;
    paid_at?: string | null;
    raw_response?: Record<string, any> | null;
    is_paid?: boolean;
    is_pending?: boolean;
    is_expired?: boolean;
    is_failed?: boolean;
    created_at: string;
    updated_at: string;
}

export interface PaymentChannel {
    name: string;
    method: string;
    channel: string;
    icon: string;
}

export interface MembershipRegistration {
    id: number;
    gym_id: number;
    membership_plan_id: number;
    registration_number: string;
    source: 'website' | 'admin';
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    payment_status: 'unpaid' | 'pending' | 'paid' | 'failed' | 'expired' | 'refunded' | 'cancelled';
    full_name: string;
    email: string;
    phone: string;
    gender: 'male' | 'female' | 'other' | null;
    date_of_birth: string | null;
    address: string | null;
    city: string | null;
    ktp_document_path?: string | null;
    ktp_original_filename?: string | null;
    ktp_uploaded_at?: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_relationship: string | null;
    notes: string | null;
    metadata: Record<string, any> | null;
    reviewed_by: number | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
    expires_at?: string | null;
    member_id: number | null;
    membership_id: number | null;
    is_pending?: boolean;
    is_approved?: boolean;
    is_rejected?: boolean;
    is_cancelled?: boolean;
    is_paid?: boolean;
    is_payment_pending?: boolean;
    created_at: string;
    updated_at: string;
    membership_plan?: MembershipPlan;
    reviewer?: User | null;
    member?: Member | null;
    membership?: Membership | null;
    payments?: Payment[] | null;
    latest_payment?: Payment | null;
    gym?: Gym;
}

export interface LeadActivity {
    id: number;
    gym_id: number;
    lead_id: number;
    user_id?: number | null;
    type: 'call' | 'whatsapp' | 'visit' | 'email' | 'note';
    note: string;
    contacted_at: string;
    next_follow_up_at?: string | null;
    metadata?: Record<string, any> | null;
    created_at?: string;
    updated_at?: string;
    user?: User | null;
    gym?: Gym | null;
}

export interface Lead {
    id: number;
    gym_id: number;
    lead_number: string;
    name: string;
    email?: string | null;
    phone: string;
    whatsapp?: string | null;
    membership_plan_id?: number | null;
    interest_type?: string | null;
    message?: string | null;
    source: string;
    source_detail?: string | null;
    status: 'new' | 'contacted' | 'qualified' | 'interested' | 'not_interested' | 'lost' | 'converted';
    assigned_to?: number | null;
    last_contacted_at?: string | null;
    next_follow_up_at?: string | null;
    converted_at?: string | null;
    membership_registration_id?: number | null;
    notes?: string | null;
    metadata?: Record<string, any> | null;
    is_terminal?: boolean;
    created_at: string;
    updated_at: string;
    gym?: Gym | null;
    membership_plan?: MembershipPlan | null;
    assigned_user?: User | null;
    membership_registration?: MembershipRegistration | null;
    activities?: LeadActivity[] | null;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
    auth: {
        user: User | null;
    };
    gym: {
        current: Gym | null;
        available: Gym[];
        branches?: Gym[];
        is_super_admin: boolean;
    };
    flash: {
        success?: string | null;
        error?: string | null;
        info?: string | null;
    };
    errors: Record<string, string>;
};

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

declare global {
    function route(name?: string, params?: any): any;
}