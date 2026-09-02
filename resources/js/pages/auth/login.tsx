import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Eye,
    EyeOff,
    LoaderCircle,
    Mail,
    Lock,
    ShieldCheck,
    Trophy,
    Users,
    ArrowRight,
    CheckCircle2,
    Sparkles,
} from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword?: boolean;
}

function normalizeLogoSrc(src?: string | null) {
    if (!src) return '/assets/brand/logo.svg';
    if (/^(?:https?:)?\/\//.test(src)) return src;
    if (src.startsWith('/storage/uploads/')) return `${window.location.origin}/${src.replace('storage/', '')}`;
    if (src.startsWith('storage/uploads/')) return `${window.location.origin}/${src.replace('storage/', '')}`;
    if (src.startsWith('/uploads/')) return `${window.location.origin}${src}`;
    if (src.startsWith('uploads/')) return `${window.location.origin}/${src}`;
    if (src.startsWith('/')) return src;
    return `/${src}`;
}

export default function Login({ status, canResetPassword = true }: LoginProps) {
    const { settings } = usePage().props as any;
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const logoSrc = normalizeLogoSrc(settings?.logo);
    const systemName = settings?.system_name || 'Sports Agent Directory';

    return (
        <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-slate-50 dark:bg-gray-950 font-sans selection:bg-blue-600 selection:text-white">
            <Head title="Admin Login - Sports Agent Directory" />

            {/* ── Left Hero Side (Brand & Operations Engine) ── */}
            <div className="relative hidden lg:flex lg:col-span-7 flex-col justify-between p-12 xl:p-16 bg-[#080d1a] text-white overflow-hidden border-r border-slate-800/60">
                {/* Ambient Glows & Dot Grid Background */}
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[140px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
                <div
                    className="absolute inset-0 opacity-[0.04] pointer-events-none"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                        backgroundSize: '28px 28px',
                    }}
                />

                {/* Top Header */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link href={route('home')} className="flex items-center gap-3.5 group">
                        <img
                            src={logoSrc}
                            alt={systemName}
                            className="h-8 xl:h-9 w-auto max-w-[220px] object-contain brightness-0 invert transition-opacity group-hover:opacity-90"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/brand/logo.svg';
                            }}
                        />
                        <div className="h-5 w-px bg-slate-700/80" />
                        <span className="text-[11px] tracking-wider uppercase font-semibold text-blue-400">
                            Operations Engine
                        </span>
                    </Link>

                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        Enterprise v1.0
                    </span>
                </div>

                {/* Center Content */}
                <div className="relative z-10 my-auto py-10 max-w-xl">
                    {/* Badge Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold mb-6">
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>Sports Agent &amp; Draft Intelligence Portal</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-extrabold tracking-tight text-white leading-[1.18] mb-4">
                        Elevate Athlete Representation &amp; Draft Operations
                    </h1>

                    <p className="text-slate-300/80 text-sm xl:text-base leading-relaxed mb-8">
                        A centralized, state-of-the-art control panel for managing verified sports agents,
                        multi-league draft picks, player representation profiles, and directory listings.
                    </p>

                    {/* 3 Highlights Cards */}
                    <div className="grid grid-cols-3 gap-3.5">
                        {/* Card 1 */}
                        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.07] transition-all">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2.5">
                                <Users className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-semibold text-white">Verified Agents</h2>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                Directory &amp; certified representation
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.07] transition-all">
                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2.5">
                                <Trophy className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-semibold text-white">Draft Engine</h2>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                Multi-league picks &amp; year archives
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.07] transition-all">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5">
                                <ShieldCheck className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-semibold text-white">Role Security</h2>
                            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                Encrypted access &amp; governance
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Footer Status */}
                <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-6 border-t border-slate-800/60">
                    <div className="flex items-center gap-2 font-medium">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>System Operational • 100% Encrypted Connection</span>
                    </div>
                    <span className="text-slate-500">Since 1997</span>
                </div>
            </div>

            {/* ── Right Login Form Side ── */}
            <div className="col-span-1 lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen bg-slate-50 dark:bg-gray-950">
                {/* Mobile Top Header (only visible on mobile/tablet) */}
                <div className="flex items-center justify-between lg:hidden mb-6">
                    <Link href={route('home')}>
                        <img
                            src={logoSrc}
                            alt={systemName}
                            className="h-8 w-auto max-w-[180px] object-contain"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/brand/logo.svg';
                            }}
                        />
                    </Link>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        Admin Portal
                    </span>
                </div>

                <div className="hidden lg:block"></div>

                {/* Floating Card / Form Container */}
                <div className="w-full max-w-md mx-auto my-auto">
                    <div className="bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-xl shadow-slate-200/60 dark:shadow-none rounded-3xl p-7 sm:p-9 transition-all">
                        
                        {/* Form Header with natural Logo presentation */}
                        <div className="flex flex-col items-center text-center mb-7">
                            <Link href={route('home')} className="inline-flex items-center justify-center mb-5 hover:opacity-90 transition-opacity">
                                <img
                                    src={logoSrc}
                                    alt={systemName}
                                    className="h-9 sm:h-10 w-auto max-w-[240px] object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/assets/brand/logo.svg';
                                    }}
                                />
                            </Link>
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                Admin Portal
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Welcome back! Please enter your credentials to continue.
                            </p>
                        </div>

                        {/* Status Alert */}
                        {status && (
                            <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-sm font-medium text-emerald-800 dark:text-emerald-300">
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                <span>{status}</span>
                            </div>
                        )}

                        {/* Login Form */}
                        <form className="space-y-4" onSubmit={submit}>
                            {/* Email */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Mail className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="admin@example.com"
                                        disabled={processing}
                                        className="pl-10 h-11 bg-slate-50/70 dark:bg-gray-800/60 border-slate-200 dark:border-gray-700 rounded-xl text-sm focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <Link
                                            href={route('password.request')}
                                            className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        disabled={processing}
                                        className="pl-10 pr-10 h-11 bg-slate-50/70 dark:bg-gray-800/60 border-slate-200 dark:border-gray-700 rounded-xl text-sm focus:bg-white dark:focus:bg-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            {/* Remember Me */}
                            <div className="flex items-center space-x-2 pt-1">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onCheckedChange={(checked) => setData('remember', checked === true)}
                                    tabIndex={3}
                                    className="rounded-md border-slate-300 dark:border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm text-slate-600 dark:text-slate-400 font-normal cursor-pointer select-none"
                                >
                                    Remember me
                                </Label>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-[#037FFF] hover:bg-[#026BD8] text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 group"
                                    tabIndex={4}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <>
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <span>Sign In to Dashboard</span>
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Bottom Footer */}
                <div className="text-center text-xs text-slate-400 dark:text-slate-600 pt-6">
                    {settings?.copyright_text || '© 1997 - 2026 Sports Agent Directory. All rights reserved.'}
                </div>
            </div>
        </div>
    );
}
