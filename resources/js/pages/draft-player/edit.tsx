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
import { League, Year, DraftPlayer } from '@/types';
import { FormEventHandler } from 'react';


interface Props {
    draftPlayer: DraftPlayer;
    leagues: League[];
    years: Year[];
}

const SELECT_CLASS =
    'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

export default function Edit({ draftPlayer, leagues, years }: Props) {
    const { data, setData, errors, post, processing } = useForm({
        _method:     'put',
        league_id:   String(draftPlayer.league_id ?? ''),
        year:        String(draftPlayer.year ?? ''),
        round:       String(draftPlayer.round ?? ''),
        pick:        String(draftPlayer.pick ?? ''),
        first_name:   draftPlayer.first_name ?? '',
        last_name:    draftPlayer.last_name ?? '',
        position:     draftPlayer.position ?? '',
        current_team: draftPlayer.current_team ?? '',
        draft_team:   draftPlayer.draft_team ?? '',
        school:       draftPlayer.school ?? '',
        agent_name:  draftPlayer.agent_name ?? '',
        agency_name: draftPlayer.agency_name ?? '',
        height:      draftPlayer.height ?? '',
        weight:      draftPlayer.weight ?? '',
        birthdate:   draftPlayer.birthdate ?? '',
        nationality: draftPlayer.nationality ?? '',
        status:      draftPlayer.status ?? 'unsigned_draft',
    });

    const displayName = [draftPlayer.first_name, draftPlayer.last_name].filter(Boolean).join(' ') || draftPlayer.player_name || 'Player';

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('draft-player.update', draftPlayer.id), {
            onSuccess: () => {
                toast.success('Draft player updated successfully!');
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
                { title: `Edit: ${displayName}`, href: `/draft-player/${draftPlayer.id}/edit` },
            ]}
        >
            <Head title={`Edit ${displayName}`} />

            <div className="m-5">
                <Card>
                    <CardHeader>
                        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                            Edit Draft Player
                        </h1>
                    </CardHeader>

                    <form onSubmit={submit}>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                {/* League */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_league_id">
                                        League <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="edit_league_id"
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
                                    <Label htmlFor="edit_year">
                                        Draft Year <span className="text-red-500">*</span>
                                    </Label>
                                    <select
                                        id="edit_year"
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

                                {/* First Name */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_first_name">
                                        First Name <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="edit_first_name"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        placeholder="Enter first name"
                                        disabled={processing}
                                        required
                                    />
                                    <InputError message={errors.first_name} />
                                </div>

                                {/* Last Name */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_last_name">
                                        Last Name
                                    </Label>
                                    <Input
                                        id="edit_last_name"
                                        value={data.last_name}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        placeholder="Enter last name"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.last_name} />
                                </div>

                                {/* Position */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_position">Position</Label>
                                    <Input
                                        id="edit_position"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        placeholder="e.g. QB, WR, PG"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.position} />
                                </div>

                                {/* Current Team */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_current_team">Current Team</Label>
                                    <Input
                                        id="edit_current_team"
                                        value={data.current_team}
                                        onChange={(e) => setData('current_team', e.target.value)}
                                        placeholder="e.g. Mariners, Lakers"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.current_team} />
                                </div>

                                {/* Draft Team */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_draft_team">Draft Team</Label>
                                    <Input
                                        id="edit_draft_team"
                                        value={data.draft_team}
                                        onChange={(e) => setData('draft_team', e.target.value)}
                                        placeholder="e.g. Giants, Bulls"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.draft_team} />
                                </div>

                                {/* Round */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_round">Round</Label>
                                    <Input
                                        id="edit_round"
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
                                    <Label htmlFor="edit_pick">Pick</Label>
                                    <Input
                                        id="edit_pick"
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
                                    <Label htmlFor="edit_school">School / College</Label>
                                    <Input
                                        id="edit_school"
                                        value={data.school}
                                        onChange={(e) => setData('school', e.target.value)}
                                        placeholder="e.g. Alabama"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.school} />
                                </div>

                                {/* Nationality */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_nationality">Nationality</Label>
                                    <Input
                                        id="edit_nationality"
                                        value={data.nationality}
                                        onChange={(e) => setData('nationality', e.target.value)}
                                        placeholder="e.g. American"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.nationality} />
                                </div>

                                {/* Height */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_height">Height</Label>
                                    <Input
                                        id="edit_height"
                                        value={data.height}
                                        onChange={(e) => setData('height', e.target.value)}
                                        placeholder="e.g. 6ft 4in"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.height} />
                                </div>

                                {/* Weight */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_weight">Weight</Label>
                                    <Input
                                        id="edit_weight"
                                        value={data.weight}
                                        onChange={(e) => setData('weight', e.target.value)}
                                        placeholder="e.g. 225 lbs"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.weight} />
                                </div>

                                {/* Birthdate */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_birthdate">Birthdate</Label>
                                    <Input
                                        id="edit_birthdate"
                                        type="date"
                                        value={data.birthdate}
                                        onChange={(e) => setData('birthdate', e.target.value)}
                                        disabled={processing}
                                    />
                                    <InputError message={errors.birthdate} />
                                </div>

                                {/* Status */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_status">Status</Label>
                                    <select
                                        id="edit_status"
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

                                {/* Agent Name (free text) */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_agent_name">Agent Name (Free Text)</Label>
                                    <Input
                                        id="edit_agent_name"
                                        value={data.agent_name}
                                        onChange={(e) => setData('agent_name', e.target.value)}
                                        placeholder="e.g. John Doe"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.agent_name} />
                                </div>

                                {/* Agency Name */}
                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="edit_agency_name">Agency Name</Label>
                                    <Input
                                        id="edit_agency_name"
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
                                Save Changes
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
