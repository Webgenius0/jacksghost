import { Head, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
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

    return (
        <AuthLayout title="" description="">
            <Head title="Log in" />

            <div className="flex flex-col gap-6">
                <Card className="border-none bg-[#F8F8F8] rounded-3xl shadow-none overflow-hidden">
                    <CardHeader className="flex flex-col items-center gap-2 pt-8 pb-2">
                        <img src={settings?.logo || "/assets/brand/logo.svg"} alt="Logo" className="mb-4 w-auto" />
                        {/* <CardTitle className="text-4xl font-bold text-[#037FFF]">{settings?.system_name || 'Login'}</CardTitle> */}
                        <CardDescription className="text-gray-500 text-center text-wrap mt-2">
                            Enter your email and password <br/> below to login
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 pt-0">
                        <form className="flex flex-col gap-6" onSubmit={submit}>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-black/70 font-medium">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="email@example.com"
                                        className="bg-white text-black/70  border-0 shadow-none focus-visible:ring-white/10 h-11"
                                    />
                                    <InputError message={errors.email} className="text-red-200" />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="text-black/70 font-medium">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            tabIndex={2}
                                            autoComplete="current-password"
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Password"
                                            className="bg-white text-black/70 border-0 shadow-none focus-visible:ring-white/30 h-11 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} className="text-red-200" />
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        checked={data.remember}
                                        onCheckedChange={(checked) => setData('remember', checked === true)}
                                        tabIndex={3}
                                        className="bg-white data-[state=checked]:bg-white data-[state=checked]:text-[#037FFF]"
                                    />

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between w-full">
                                            <Label
                                                htmlFor="remember"
                                                className="text-black/70 text-sm cursor-pointer"
                                            >
                                                Remember me
                                            </Label>

                                            {canResetPassword && (
                                                <TextLink
                                                    href={route('password.request')}
                                                    className="text-[#037FFF] hover:text-black/70 text-sm transition-colors"
                                                    tabIndex={5}
                                                >
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-4 w-full h-11 bg-[#037FFF] text-white hover:bg-[#026BD8] font-bold transition-all rounded-3xl active:scale-95"
                                    tabIndex={4}
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Log in
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
            </div>
        </AuthLayout>
    );
}
