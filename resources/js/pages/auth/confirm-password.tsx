import { Head, useForm, usePage } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ConfirmPassword() {
    const { settings } = usePage().props as any;
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<Required<{ password: string }>>({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="" description="">
            <Head title="Confirm password" />

            <div className="flex flex-col gap-6">
                <Card className="border-none bg-[#F8F8F8] rounded-3xl shadow-none overflow-hidden">
                    <CardHeader className="flex flex-col items-center gap-2 pt-8 pb-2">
                        <img src={settings?.logo || "/assets/brand/logo.png"} alt="Logo" className="mb-4 h-12 w-auto" />
                        <CardTitle className="text-4xl font-bold text-[#037FFF]">Confirm Password</CardTitle>
                        <CardDescription className="text-gray-500 text-center text-wrap mt-2">
                            Please confirm your <br/> password before continuing
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 pt-0">
                        <form className="flex flex-col gap-6" onSubmit={submit}>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="text-black/70 font-medium">Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            placeholder="Password"
                                            autoComplete="current-password"
                                            value={data.password}
                                            autoFocus
                                            onChange={(e) => setData('password', e.target.value)}
                                            className="bg-white text-black/70 border-0 shadow-none focus-visible:ring-white/10 h-11 pr-10"
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
                                    <InputError message={errors.password} />
                                </div>

                                <Button 
                                    type="submit" 
                                    className="mt-4 w-full h-11 bg-[#037FFF] text-white hover:bg-[#026BD8] font-bold transition-all rounded-3xl active:scale-95" 
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Confirm password
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}
