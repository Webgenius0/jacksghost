import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { League, Year } from '@/types';
import { FormEventHandler } from 'react';

interface Agent {
    id: number;
    agent_name: string;
}

interface Props {
    leagues: League[];
    years: Year[];
    agents: Agent[];
}

const SELECT_CLASS =
    'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export default function Create({ leagues, years, agents }: Props) {
    const { data, setData, errors, post, processing, reset } = useForm({
        league_id:   '',
        year:        '',
        round:       '',
        pick:        '',
        player_name: '',
        position:    '',
        school:      '',
        agent_id:    '',
        agent_name:  '',
        agency_name: '',
        height:      '',
        weight:      '',
        birthdate:   '',
        nationality: '',
        status:      'unsigned_draft',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('draft-player.store'), {
            onSuccess: () => {
                toast.success('Draft player created successfully!');
            },
            onError: () => {
                toast.error('Please fix the errors below.');
            },
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Drafted Players', href: '/draft-player' },
                { title: 'Create', href: '/draft-player/create' },
            ]}
        >
            <Head title="Create Draft Player" />

            <div className="m-5">
                <Card>
                    <CardHeader>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                            Create Draft Player
                        </h1>
                    </CardHeader>

                    <form onSubmit={submit}>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* League */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="league_id">
                                        League <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="league_id"
                                        className={SELECT_CLASS}
                                        value={data.league_id}
                                        onChange={(e) => setData('league_id', e.target.value)}
                                        disabled={processing}
                                        required
                                    >
                                        <option value="">Select a league</option>
                                        {leagues.map((l) => (
                                            <option key={l.id} value={l.id}>{l.league_name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.league_id} />
                                </div>

                                {/* Year */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="year">
                                        Draft Year <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="year"
                                        className={SELECT_CLASS}
                                        value={data.year}
                                        onChange={(e) => setData('year', e.target.value)}
                                        disabled={processing}
                                        required
                                    >
                                        <option value="">Select a year</option>
                                        {years.map((y) => (
                                            <option key={y.id} value={y.year}>{y.year}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.year} />
                                </div>

                                {/* Player Name */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="player_name">
                                        Player Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="player_name"
                                        value={data.player_name}
                                        onChange={(e) => setData('player_name', e.target.value)}
                                        placeholder="Enter player name"
                                        disabled={processing}
                                        required
                                    />
                                    <InputError message={errors.player_name} />
                                </div>

                                {/* Position */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="position">Position</Label>
                                    <Input
                                        id="position"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        placeholder="e.g. QB, WR, PG"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.position} />
                                </div>

                                {/* Round */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="round">Round</Label>
                                    <Input
                                        id="round"
                                        type="number"
                                        min="1"
                                        value={data.round}
                                        onChange={(e) => setData('round', e.target.value)}
                                        placeholder="e.g. 1"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.round} />
                                </div>

                                {/* Pick */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="pick">Pick</Label>
                                    <Input
                                        id="pick"
                                        type="number"
                                        min="1"
                                        value={data.pick}
                                        onChange={(e) => setData('pick', e.target.value)}
                                        placeholder="e.g. 15"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.pick} />
                                </div>

                                {/* School */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="school">School / College</Label>
                                    <Input
                                        id="school"
                                        value={data.school}
                                        onChange={(e) => setData('school', e.target.value)}
                                        placeholder="e.g. Alabama"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.school} />
                                </div>

                                {/* Nationality */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="nationality">Nationality</Label>
                                    <Input
                                        id="nationality"
                                        value={data.nationality}
                                        onChange={(e) => setData('nationality', e.target.value)}
                                        placeholder="e.g. American"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.nationality} />
                                </div>

                                {/* Height */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="height">Height</Label>
                                    <Input
                                        id="height"
                                        value={data.height}
                                        onChange={(e) => setData('height', e.target.value)}
                                        placeholder="e.g. 6ft 4in"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.height} />
                                </div>

                                {/* Weight */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="weight">Weight</Label>
                                    <Input
                                        id="weight"
                                        value={data.weight}
                                        onChange={(e) => setData('weight', e.target.value)}
                                        placeholder="e.g. 225 lbs"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.weight} />
                                </div>

                                {/* Birthdate */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="birthdate">Birthdate</Label>
                                    <Input
                                        id="birthdate"
                                        type="date"
                                        value={data.birthdate}
                                        onChange={(e) => setData('birthdate', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.birthdate} />
                                </div>

                                {/* Status */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="status">Status</Label>
                                    <select
                                        id="status"
                                        className={SELECT_CLASS}
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        disabled={processing}
                                    >
                                        <option value="unsigned_draft">Unsigned Draft</option>
                                        <option value="signed">Signed</option>
                                        <option value="undrafted">Undrafted</option>
                                    </select>
                                    <InputError message={errors.status} />
                                </div>

                                {/* Agent (linked) */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="agent_id">Linked Agent (Optional)</Label>
                                    <select
                                        id="agent_id"
                                        className={SELECT_CLASS}
                                        value={data.agent_id}
                                        onChange={(e) => setData('agent_id', e.target.value)}
                                        disabled={processing}
                                    >
                                        <option value="">No linked agent</option>
                                        {agents.map((a) => (
                                            <option key={a.id} value={a.id}>{a.agent_name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.agent_id} />
                                </div>

                                {/* Agent Name (free text) */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="agent_name">Agent Name (Free Text)</Label>
                                    <Input
                                        id="agent_name"
                                        value={data.agent_name}
                                        onChange={(e) => setData('agent_name', e.target.value)}
                                        placeholder="e.g. John Doe"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.agent_name} />
                                </div>

                                {/* Agency Name */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="agency_name">Agency Name</Label>
                                    <Input
                                        id="agency_name"
                                        value={data.agency_name}
                                        onChange={(e) => setData('agency_name', e.target.value)}
                                        placeholder="e.g. CAA Sports"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.agency_name} />
                                </div>

                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-between mt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.get(route('draft-player.index'))}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Create Player
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
