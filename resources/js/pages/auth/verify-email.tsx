import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AuthLayout from '@/layouts/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { settings } = usePage().props as any;
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AuthLayout title="" description="">
            <Head title="Email verification" />

            <div className="flex flex-col gap-6">
                <Card className="border-none bg-[#F8F8F8] rounded-3xl shadow-none overflow-hidden">
                    <CardHeader className="flex flex-col items-center gap-2 pt-8 pb-2">
                        <img src={settings?.logo || "/assets/brand/logo.png"} alt="Logo" className="mb-4 h-12 w-auto" />
                        <CardTitle className="text-4xl font-bold text-[#037FFF]">Verify Email</CardTitle>
                        <CardDescription className="text-gray-500 text-center text-wrap mt-2">
                            Please verify your email address <br/> by clicking on the link we just emailed to you
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 pt-0">
                        {status === 'verification-link-sent' && (
                            <div className="mb-4 text-center text-sm font-medium text-green-600">
                                A new verification link has been sent to your email.
                            </div>
                        )}

                        <form onSubmit={submit} className="flex flex-col gap-6">
                            <Button 
                                type="submit"
                                className="w-full h-11 bg-[#037FFF] text-white hover:bg-[#026BD8] font-bold transition-all rounded-3xl active:scale-95" 
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                                Resend verification email
                            </Button>

                            <div className="text-center text-sm">
                                <TextLink href={route('logout')} method="post" className="text-[#037FFF] hover:text-[#026BD8]">
                                    Log out
                                </TextLink>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AuthLayout>
    );
}
