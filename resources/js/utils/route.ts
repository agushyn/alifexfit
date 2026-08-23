// Comprehensive, zero-dependency Route Helper for Exfits Gym Management System
// Maps all Laravel named routes to frontend URIs and supports .current() pattern matching.

export const routesMap: Record<string, string> = {
    // Public Website Routes
    'public.home': '/',
    'public.membership': '/membership',
    'public.membership.register': '/membership/register',
    'public.membership.register.store': '/membership/register',
    'public.membership.register.success': '/membership/register/success',
    'public.leads.create': '/lead',
    'public.leads.store': '/lead',
    'public.leads.success': '/lead/success',
    'public.trainers': '/trainers',
    'public.trainers.show': '/trainers/{trainer}',
    'public.workouts': '/workouts',
    'public.facilities': '/facilities',
    'public.about': '/about',
    'public.faq': '/faq',
    'public.contact': '/contact',
    'public.pages.show': '/p/{slug}',
    'public.branch.switch': '/branch/switch',

    // Guest Auth
    'login': '/login',
    'login.store': '/login',

    // Authenticated Admin
    'admin.logout': '/admin/logout',
    'admin.dashboard': '/admin/dashboard',

    // Members (Phase 2)
    'admin.members.index': '/admin/members',
    'admin.members.create': '/admin/members/create',
    'admin.members.store': '/admin/members',
    'admin.members.show': '/admin/members/{member}',
    'admin.members.edit': '/admin/members/{member}/edit',
    'admin.members.update': '/admin/members/{member}',
    'admin.members.destroy': '/admin/members/{member}',

    // Membership Registrations (Phase 5B & 5C)
    'admin.membership-registrations.index': '/admin/membership-registrations',
    'admin.membership-registrations.onsite.create': '/admin/membership-registrations/onsite/create',
    'admin.membership-registrations.onsite.store': '/admin/membership-registrations/onsite',
    'admin.membership-registrations.onsite.success': '/admin/membership-registrations/onsite/{registration}/success',
    'admin.membership-registrations.show': '/admin/membership-registrations/{registration}',
    'admin.membership-registrations.approve': '/admin/membership-registrations/{registration}/approve',
    'admin.membership-registrations.reject': '/admin/membership-registrations/{registration}/reject',
    'admin.membership-registrations.cancel': '/admin/membership-registrations/{registration}/cancel',

    // Lead Management & CRM (Phase 5D)
    'admin.leads.index': '/admin/leads',
    'admin.leads.create': '/admin/leads/create',
    'admin.leads.store': '/admin/leads',
    'admin.leads.show': '/admin/leads/{lead}',
    'admin.leads.update': '/admin/leads/{lead}',
    'admin.leads.assign': '/admin/leads/{lead}/assign',
    'admin.leads.status': '/admin/leads/{lead}/status',
    'admin.leads.contact': '/admin/leads/{lead}/contact',
    'admin.leads.convert': '/admin/leads/{lead}/convert',

    // Attendance (Phase 4)
    'admin.attendance.index': '/admin/attendance',
    'admin.attendance.kiosk': '/admin/attendance/kiosk',
    'admin.attendance.checkin': '/admin/attendance/check-in',
    'admin.attendance.show': '/admin/attendance/{attendance}',
    'admin.attendance.checkout': '/admin/attendance/{attendance}/check-out',
    'admin.attendance.cancel': '/admin/attendance/{attendance}/cancel',

    // Workout Sessions (Phase 4B)
    'admin.workout-sessions.index': '/admin/workout-sessions',
    'admin.workout-sessions.show': '/admin/workout-sessions/{workout_session}',
    'admin.workout-sessions.complete': '/admin/workout-sessions/{workout_session}/complete',
    'admin.workout-sessions.cancel': '/admin/workout-sessions/{workout_session}/cancel',

    // Membership Plans & Subscriptions (Phase 3)
    'admin.membership-plans.index': '/admin/membership-plans',
    'admin.membership-plans.create': '/admin/membership-plans/create',
    'admin.membership-plans.store': '/admin/membership-plans',
    'admin.membership-plans.show': '/admin/membership-plans/{membership_plan}',
    'admin.membership-plans.edit': '/admin/membership-plans/{membership_plan}/edit',
    'admin.membership-plans.update': '/admin/membership-plans/{membership_plan}',
    'admin.membership-plans.destroy': '/admin/membership-plans/{membership_plan}',

    'admin.memberships.index': '/admin/memberships',
    'admin.memberships.create': '/admin/memberships/create',
    'admin.memberships.store': '/admin/memberships',
    'admin.memberships.show': '/admin/memberships/{membership}',
    'admin.memberships.edit': '/admin/memberships/{membership}/edit',
    'admin.memberships.update': '/admin/memberships/{membership}',
    'admin.memberships.destroy': '/admin/memberships/{membership}',

    // Workout Types (Phase 3)
    'admin.workout-types.index': '/admin/workout-types',
    'admin.workout-types.create': '/admin/workout-types/create',
    'admin.workout-types.store': '/admin/workout-types',
    'admin.workout-types.show': '/admin/workout-types/{workout_type}',
    'admin.workout-types.edit': '/admin/workout-types/{workout_type}/edit',
    'admin.workout-types.update': '/admin/workout-types/{workout_type}',
    'admin.workout-types.destroy': '/admin/workout-types/{workout_type}',

    // Trainers & Schedules (Phase 4C)
    'admin.trainers.index': '/admin/trainers',
    'admin.trainers.create': '/admin/trainers/create',
    'admin.trainers.store': '/admin/trainers',
    'admin.trainers.show': '/admin/trainers/{trainer}',
    'admin.trainers.edit': '/admin/trainers/{trainer}/edit',
    'admin.trainers.update': '/admin/trainers/{trainer}',
    'admin.trainers.destroy': '/admin/trainers/{trainer}',
    'admin.trainers.toggle-status': '/admin/trainers/{trainer}/toggle-status',
    'admin.trainers.schedules.index': '/admin/trainers/{trainer}/schedules',
    'admin.trainers.schedules.store': '/admin/trainers/{trainer}/schedules',
    'admin.trainers.schedules.update': '/admin/trainer-schedules/{schedule}',
    'admin.trainers.schedules.destroy': '/admin/trainer-schedules/{schedule}',

    // Website CMS (Phase 5 & 6.5)
    'admin.website.overview': '/admin/website',
    'admin.website.settings.edit': '/admin/website/settings',
    'admin.website.settings.update': '/admin/website/settings',

    // Home Hero CMS (Phase 6.5)
    'admin.website.heroes.index': '/admin/website/heroes',
    'admin.website.heroes.create': '/admin/website/heroes/create',
    'admin.website.heroes.store': '/admin/website/heroes',
    'admin.website.heroes.edit': '/admin/website/heroes/{hero}/edit',
    'admin.website.heroes.update': '/admin/website/heroes/{hero}',
    'admin.website.heroes.destroy': '/admin/website/heroes/{hero}',
    'admin.website.heroes.toggle-status': '/admin/website/heroes/{hero}/toggle-status',
    'admin.website.heroes.reorder': '/admin/website/heroes/reorder',

    'admin.website.pages.index': '/admin/website/pages',
    'admin.website.pages.create': '/admin/website/pages/create',
    'admin.website.pages.store': '/admin/website/pages',
    'admin.website.pages.show': '/admin/website/pages/{page}',
    'admin.website.pages.edit': '/admin/website/pages/{page}/edit',
    'admin.website.pages.update': '/admin/website/pages/{page}',
    'admin.website.pages.destroy': '/admin/website/pages/{page}',
    'admin.website.faqs.index': '/admin/website/faqs',
    'admin.website.faqs.create': '/admin/website/faqs/create',
    'admin.website.faqs.store': '/admin/website/faqs',
    'admin.website.faqs.show': '/admin/website/faqs/{faq}',
    'admin.website.faqs.edit': '/admin/website/faqs/{faq}/edit',
    'admin.website.faqs.update': '/admin/website/faqs/{faq}',
    'admin.website.faqs.destroy': '/admin/website/faqs/{faq}',
    'admin.website.facilities.index': '/admin/website/facilities',
    'admin.website.facilities.create': '/admin/website/facilities/create',
    'admin.website.facilities.store': '/admin/website/facilities',
    'admin.website.facilities.show': '/admin/website/facilities/{facility}',
    'admin.website.facilities.edit': '/admin/website/facilities/{facility}/edit',
    'admin.website.facilities.update': '/admin/website/facilities/{facility}',
    'admin.website.facilities.destroy': '/admin/website/facilities/{facility}',
    'admin.website.sections.index': '/admin/website/sections',
    'admin.website.sections.edit': '/admin/website/sections/{sectionKey}/edit',
    'admin.website.sections.update': '/admin/website/sections/{sectionKey}',

    // Gyms
    'admin.gyms.index': '/admin/gyms',
    'admin.gyms.create': '/admin/gyms/create',
    'admin.gyms.store': '/admin/gyms',
    'admin.gyms.show': '/admin/gyms/{gym}',
    'admin.gyms.edit': '/admin/gyms/{gym}/edit',
    'admin.gyms.update': '/admin/gyms/{gym}',
    'admin.gyms.destroy': '/admin/gyms/{gym}',
    'admin.gyms.switch': '/admin/gyms/{gym}/switch',

    // Administration
    'admin.settings.index': '/admin/settings',
    'admin.settings.update': '/admin/settings',
    'admin.audit-logs.index': '/admin/audit-logs',
    'admin.storage.private': '/admin/storage/private',
    'admin.modules.show': '/admin/modules/{module}',
};

export interface RouteFunction {
    (name?: string, params?: any): string;
    current: (name?: string, params?: any) => boolean;
}

export function route(name?: string, params?: any): any {
    if (!name) {
        return {
            current: (pattern?: string, patternParams?: any): boolean => {
                if (typeof window === 'undefined') return false;
                const pathname = window.location.pathname;

                if (!pattern) return false;

                // Wildcard matching e.g. 'admin.members.*'
                if (pattern.endsWith('*')) {
                    const prefix = pattern.slice(0, -1);
                    for (const [routeName, routePath] of Object.entries(routesMap)) {
                        if (routeName.startsWith(prefix)) {
                            const baseRoutePath = routePath.replace(/\/\{[^}]+\}.*$/, '');
                            if (pathname === baseRoutePath || pathname.startsWith(baseRoutePath + '/')) {
                                return true;
                            }
                        }
                    }
                    return false;
                }

                // Exact route matching
                const targetPath = routesMap[pattern];
                if (!targetPath) return false;

                if (patternParams && typeof patternParams === 'object') {
                    let filledPath = targetPath;
                    for (const [k, v] of Object.entries(patternParams)) {
                        filledPath = filledPath.replace(`{${k}}`, String(v));
                    }
                    return pathname === filledPath;
                }

                const regexPattern = new RegExp('^' + targetPath.replace(/\{[^}]+\}/g, '[^/]+') + '$');
                return regexPattern.test(pathname);
            },
        };
    }

    const template = routesMap[name];
    if (!template) {
        // Fallback for custom or unknown routes
        return '/' + name.replace(/\./g, '/');
    }

    if (params === undefined || params === null) {
        return template;
    }

    // Scalar parameter (e.g. route('admin.members.show', 5))
    if (typeof params !== 'object') {
        const paramNameMatch = template.match(/\{([^}]+)\}/);
        if (paramNameMatch) {
            return template.replace(paramNameMatch[0], encodeURIComponent(String(params)));
        }
        return template;
    }

    // Object parameters
    let url = template;
    const remainingParams: Record<string, any> = {};

    for (const [key, value] of Object.entries(params)) {
        const placeholder = `{${key}}`;
        if (url.includes(placeholder)) {
            url = url.replace(placeholder, encodeURIComponent(String(value)));
        } else if (value !== undefined && value !== null) {
            remainingParams[key] = value;
        }
    }

    // Append query parameters
    const queryEntries = Object.entries(remainingParams);
    if (queryEntries.length > 0) {
        const queryString = queryEntries
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
            .join('&');
        url += (url.includes('?') ? '&' : '?') + queryString;
    }

    return url;
}

// Bind route globally to window and globalThis in browser environment
if (typeof window !== 'undefined') {
    (window as any).route = route;
}
if (typeof globalThis !== 'undefined') {
    (globalThis as any).route = route;
}
