import React, { FormEventHandler } from 'react';
import { useForm, Head } from '@inertiajs/react';
import { Mail, Lock, LogIn, ShieldAlert, KeyRound, Building, User } from 'lucide-react';
import { GuestLayout } from '@/Layouts/GuestLayout';
import { TextInput } from '@/Components/TextInput';
import { Button } from '@/Components/Button';
import { Card } from '@/Components/Card';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: 'alif@exfits.com',
        password: 'password',
        remember: true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login.store'), {
            onFinish: () => reset('password'),
        });
    };

    const fillDemo = (email: string) => {
        setData({
            email,
            password: 'password',
            remember: true,
        });
    };

    return (
        <GuestLayout>
            <Head title="Sign In — EXFITS Gym" />

            <Card variant="default" className="p-6 sm:p-8">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-white tracking-tight">System Sign In</h2>
                    <p className="text-xs text-[#888888] mt-1">Authenticate to access your tenant control shell.</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <TextInput
                        label="Email Address"
                        type="email"
                        id="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        icon={<Mail className="w-4 h-4" />}
                        error={errors.email}
                        placeholder="you@exfits.com"
                        required
                        autoFocus
                    />

                    <TextInput
                        label="Password"
                        type="password"
                        id="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        icon={<Lock className="w-4 h-4" />}
                        error={errors.password}
                        placeholder="••••••••••••"
                        required
                    />

                    <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="w-4 h-4 rounded bg-[#242424] border-[#3a3a3a] text-[#faff69] focus:ring-[#faff69] focus:ring-offset-[#0a0a0a]"
                            />
                            <span className="text-xs text-[#888888] hover:text-white transition-colors">Remember session</span>
                        </label>

                        <span className="text-xs font-mono text-[#5a5a5a]">v1.0-phase1</span>
                    </div>

                    <div className="pt-2">
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full h-11 text-sm font-bold uppercase tracking-wider"
                            isLoading={processing}
                        >
                            <LogIn className="w-4 h-4" />
                            Sign In to Console
                        </Button>
                    </div>
                </form>


            </Card>
        </GuestLayout>
    );
}