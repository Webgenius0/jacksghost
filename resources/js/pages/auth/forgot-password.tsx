import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { settings } = usePage().props as any;
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout title="" description="">
            <Head title="Forgot password" />

            <div className="flex flex-col gap-6">
                <Card className="border-none bg-[#F8F8F8] rounded-3xl shadow-none overflow-hidden">
                    <CardHeader className="flex flex-col items-center gap-2 pt-8 pb-2">
                        <img src={settings?.logo || "/assets/brand/logo.png"} alt="Logo" className="mb-4 h-12 w-auto" />
                        <CardTitle className="text-4xl font-bold text-[#037FFF]">Forgot Password</CardTitle>
                        <CardDescription className="text-gray-500 text-center text-wrap mt-2">
                            Enter your email to receive a <br/> password reset link
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 pt-0">
                        {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

                        <form className="flex flex-col gap-6" onSubmit={submit}>
                            <div className="grid gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-black/70 font-medium">Email address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        autoComplete="off"
                                        value={data.email}
                                        autoFocus
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="email@example.com"
                                        className="bg-white text-black/70 border-0 shadow-none focus-visible:ring-white/10 h-11"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <Button 
                                    type="submit" 
                                    className="mt-2 w-full h-11 bg-[#037FFF] text-white hover:bg-[#026BD8] font-bold transition-all rounded-3xl active:scale-95" 
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                    Email reset link
                                </Button>
                            </div>

                            <div className="text-center text-sm text-black/70">
                                <span>Or, return to</span>{' '}
                                <TextLink href={route('login')} className="text-[#037FFF] hover:text-[#026BD8]">
                                    log in
                                </TextLink>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}
