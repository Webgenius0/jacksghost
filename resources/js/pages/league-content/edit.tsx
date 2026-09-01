import AppLayout from '@/layouts/app-layout';
import { Head, useForm, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import ImageUpload from '@/components/ImageUpload';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { FormEventHandler } from 'react';
import { League, LeagueContent } from '@/types';
import { ArrowLeft } from 'lucide-react';

interface Props {
    leagues: League[];
    leagueContent: LeagueContent;
}

export default function Edit({ leagues, leagueContent }: Props) {
    const { data, setData, errors, post, processing, reset } = useForm({
        _method: 'put',
        league_id: leagueContent.league_id.toString(),
        image: leagueContent.image || null as File | string | null,
        agent_content: leagueContent.agent_content || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('league-content.update', leagueContent.id), {
            onSuccess: () => {
                // Success redirect handled by controller
            },
            onError: () => {
                toast.error('Failed to update League Content.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'League Contents', href: '/league-content' },
            { title: 'Edit League Content', href: `/league-content/${leagueContent.id}/edit` }
        ]}>
            <Head title="Edit League Content" />

            <div className="m-5">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                                Edit League Content
                            </h1>
                            <Button variant="outline" onClick={() => router.get(route('league-content.index'))}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </div>
                    </CardHeader>
                    <form onSubmit={submit}>
                        <CardContent>
                            <div className="grid gap-4">
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_league_id">League <span className="text-red-500">*</span></Label>
                                    <select
                                        id="edit_league_id"
                                        className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.league_id}
                                        onChange={(e) => setData('league_id', e.target.value)}
                                        disabled={processing}
                                        required
                                    >
                                        <option value="" disabled>Select a league</option>
                                        {leagues.map((league) => (
                                            <option key={league.id} value={league.id}>{league.league_name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.league_id} />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_image">Image</Label>
                                    <ImageUpload
                                        value={data.image}
                                        onChange={(file) => setData('image', file as File | null)}
                                        className="h-[150px]"
                                    />
                                    <InputError message={errors.image} />
                                </div>
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_agent_content">Agent Content</Label>
                                    <div className="bg-white rounded-md mt-2 pb-10">
                                        <ReactQuill
                                            theme="snow"
                                            value={data.agent_content}
                                            onChange={(content) => setData('agent_content', content)}
                                            className="h-[300px]"
                                            readOnly={processing}
                                        />
                                    </div>
                                    <InputError message={errors.agent_content} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between mt-5">
                            <Button type="button" variant="outline" onClick={() => reset()} disabled={processing}>
                                Reset
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Update League Content
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
