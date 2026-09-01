import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { toast } from 'sonner';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Social Links Settings',
        href: '/settings/social-links',
    },
];

interface SocialLink {
    facebook_link?: string;
    instagram_link?: string;
    twitter_link?: string;
    tiktok_link?: string;
    linkedin_link?: string;
    github_link?: string;
    youtube_link?: string;
    status?: 'active' | 'inactive';
}

export default function SocialLinkSettings({ socialLink }: { socialLink: SocialLink | null }) {
    const { data, setData, post, errors, processing } = useForm<any>({
        facebook_link: socialLink?.facebook_link || '',
        instagram_link: socialLink?.instagram_link || '',
        twitter_link: socialLink?.twitter_link || '',
        tiktok_link: socialLink?.tiktok_link || '',
        linkedin_link: socialLink?.linkedin_link || '',
        github_link: socialLink?.github_link || '',
        youtube_link: socialLink?.youtube_link || '',
        status: socialLink?.status || 'active',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('social-links.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Social links updated successfully!'),
            onError: () => toast.error('Failed to update social links.'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Social Links Settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Social Links" description="Update your social media links for the platform" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="facebook_link">Facebook Link</Label>
                                <Input
                                    id="facebook_link"
                                    type="url"
                                    className="mt-1 block w-full"
                                    value={data.facebook_link}
                                    onChange={(e) => setData('facebook_link', e.target.value)}
                                    placeholder="https://facebook.com/yourpage"
                                />
                                <InputError className="mt-2" message={errors.facebook_link} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="twitter_link">Twitter Link</Label>
                                <Input
                                    id="twitter_link"
                                    type="url"
                                    className="mt-1 block w-full"
                                    value={data.twitter_link}
                                    onChange={(e) => setData('twitter_link', e.target.value)}
                                    placeholder="https://x.com/yourprofile"
                                />
                                <InputError className="mt-2" message={errors.twitter_link} />
                            </div>

                        </div>

                        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="grid gap-2">
                                <Label htmlFor="instagram_link">Instagram Link</Label>
                                <Input
                                    id="instagram_link"
                                    type="url"
                                    className="mt-1 block w-full"
                                    value={data.instagram_link}
                                    onChange={(e) => setData('instagram_link', e.target.value)}
                                    placeholder="https://instagram.com/yourprofile"
                                />
                                <InputError className="mt-2" message={errors.instagram_link} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tiktok_link">TikTok Link</Label>
                                <Input
                                    id="tiktok_link"
                                    type="url"
                                    className="mt-1 block w-full"
                                    value={data.tiktok_link}
                                    onChange={(e) => setData('tiktok_link', e.target.value)}
                                    placeholder="https://tiktok.com/@yourprofile"
                                />
                                <InputError className="mt-2" message={errors.tiktok_link} />
                            </div>
                        </div> */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="linkedin_link">LinkedIn Link</Label>
                                <Input
                                    id="linkedin_link"
                                    type="url"
                                    className="mt-1 block w-full"
                                    value={data.linkedin_link}
                                    onChange={(e) => setData('linkedin_link', e.target.value)}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                />
                                <InputError className="mt-2" message={errors.linkedin_link} />
                            </div>

                            {/* <div className="grid gap-2">
                                <Label htmlFor="github_link">GitHub Link</Label>
                                <Input
                                    id="github_link"
                                    type="url"
                                    className="mt-1 block w-full"
                                    value={data.github_link}
                                    onChange={(e) => setData('github_link', e.target.value)}
                                    placeholder="https://github.com/yourprofile"
                                />
                                <InputError className="mt-2" message={errors.github_link} />
                            </div> */}
                        </div>

                        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="youtube_link">YouTube Link</Label>
                                <Input
                                    id="youtube_link"
                                    type="url"
                                    className="mt-1 block w-full"
                                    value={data.youtube_link}
                                    onChange={(e) => setData('youtube_link', e.target.value)}
                                    placeholder="https://youtube.com/c/yourchannel"
                                />
                                <InputError className="mt-2" message={errors.youtube_link} />
                            </div>
                        </div> */}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save Links</Button>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
