import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import ImageUpload from '@/components/ImageUpload';
import InputError from '@/components/input-error';
import { toast } from 'sonner';
import { FormEventHandler, useState, useMemo } from 'react';
import {
    ArrowLeft,
    Eye,
    Save,
    User,
    Building2,
    Mail,
    Phone,
    MapPin,
    Globe,
    Lock,
    GraduationCap,
    CheckCircle,
    XCircle,
    Clock,
    Award,
    Briefcase,
    Sparkles,
    Plus,
    X,
    Tag,
    FileText,
    Trash2,
} from 'lucide-react';

interface Certification {
    id: number;
    certificate_name: string;
    certificate_file: string | null;
}

interface Service {
    id: number;
    service_name: string;
}

interface CertificationItem {
    id?: number;
    name: string;
    file: File | null;
    existing_file?: string | null;
}

interface Agent {
    id: number;
    agent_name: string;
    agency_name: string | null;
    agent_photo: string | null;
    email: string | null;
    phone_number: string | null;
    address: string | null;
    website_link: string | null;
    institution_name: string | null;
    degree: string | null;
    graduation_year: string | null;
    background_info: string | null;
    notable_client: string | string[] | null;
    status: 'pending' | 'approved' | 'rejected';
    is_public: boolean;
    created_at: string;
    certifications?: Certification[];
    services?: Service[];
}

interface Props {
    agent: Agent;
}

type EditAgentForm = {
    agent_name: string;
    agency_name: string;
    email: string;
    phone_number: string;
    address: string;
    website_link: string;
    institution_name: string;
    degree: string;
    graduation_year: string;
    background_info: string;
    notable_client: string[];
    services: string[];
    certifications: CertificationItem[];
    status: 'pending' | 'approved' | 'rejected';
    is_public: boolean;
    agent_photo: File | null;
    _method: string;
};

const SUGGESTED_SERVICES = [
    'Contract Negotiation',
    'Brand Endorsements',
    'Career Management',
    'Draft Preparation',
    'Legal Representation',
    'Financial Advisory',
    'Post-Career Planning',
    'Public Relations',
];

const statusConfig: Record<string, { label: string; icon: React.ElementType; classes: string }> = {
    pending:  { label: 'Pending',  icon: Clock,        classes: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200' },
    approved: { label: 'Approved', icon: CheckCircle,  classes: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200' },
    rejected: { label: 'Rejected', icon: XCircle,      classes: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200' },
};

export default function Edit({ agent }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Agent Management', href: '/agents' },
        { title: agent.agent_name || 'Agent', href: `/agents/${agent.id}` },
        { title: 'Edit Agent', href: `/agents/${agent.id}/edit` },
    ];

    const initialNotableClients: string[] = useMemo(() => {
        if (!agent.notable_client) return [];
        if (Array.isArray(agent.notable_client)) return agent.notable_client;
        if (typeof agent.notable_client === 'string') {
            try {
                const parsed = JSON.parse(agent.notable_client);
                if (Array.isArray(parsed)) return parsed;
            } catch {
                // not JSON, fallback to comma-separated
            }
            return agent.notable_client
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
        }
        return [];
    }, [agent.notable_client]);

    const { data, setData, errors, post, processing } = useForm<EditAgentForm>({
        agent_name: agent.agent_name || '',
        agency_name: agent.agency_name || '',
        email: agent.email || '',
        phone_number: agent.phone_number || '',
        address: agent.address || '',
        website_link: agent.website_link || '',
        institution_name: agent.institution_name || '',
        degree: agent.degree || '',
        graduation_year: agent.graduation_year || '',
        background_info: agent.background_info || '',
        notable_client: initialNotableClients,
        services: agent.services ? agent.services.map((s) => s.service_name) : [],
        certifications: agent.certifications
            ? agent.certifications.map((c) => ({
                id: c.id,
                name: c.certificate_name,
                file: null,
                existing_file: c.certificate_file,
            }))
            : [],
        status: agent.status || 'pending',
        is_public: Boolean(agent.is_public),
        agent_photo: null,
        _method: 'PUT',
    });

    const [selectedPhoto, setSelectedPhoto] = useState<File | string | null>(agent.agent_photo || null);
    const [clientTagInput, setClientTagInput] = useState('');
    const [serviceInput, setServiceInput] = useState('');

    const handleAddClientTag = (tagToAdd?: string) => {
        const value = (tagToAdd ?? clientTagInput).trim();
        if (!value) return;

        const newTags = value
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t && !data.notable_client.includes(t));

        if (newTags.length > 0) {
            setData('notable_client', [...data.notable_client, ...newTags]);
        }
        setClientTagInput('');
    };

    const handleRemoveClientTag = (indexToRemove: number) => {
        setData(
            'notable_client',
            data.notable_client.filter((_, idx) => idx !== indexToRemove)
        );
    };

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddClientTag();
        } else if (e.key === ',') {
            e.preventDefault();
            handleAddClientTag();
        } else if (e.key === 'Backspace' && !clientTagInput && data.notable_client.length > 0) {
            e.preventDefault();
            handleRemoveClientTag(data.notable_client.length - 1);
        }
    };

    /* ── Services Handlers ────────────────────────────────────────── */
    const handleAddService = (serviceName?: string) => {
        const value = (serviceName ?? serviceInput).trim();
        if (!value) return;

        if (!data.services.includes(value)) {
            setData('services', [...data.services, value]);
        }
        setServiceInput('');
    };

    const handleRemoveService = (indexToRemove: number) => {
        setData(
            'services',
            data.services.filter((_, idx) => idx !== indexToRemove)
        );
    };

    const handleServiceKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddService();
        }
    };

    /* ── Certifications Handlers ──────────────────────────────────── */
    const handleAddCertificationRow = () => {
        setData('certifications', [
            ...data.certifications,
            { name: '', file: null, existing_file: null },
        ]);
    };

    const handleUpdateCertificationName = (index: number, name: string) => {
        const updated = [...data.certifications];
        updated[index].name = name;
        setData('certifications', updated);
    };

    const handleUpdateCertificationFile = (index: number, file: File | null) => {
        const updated = [...data.certifications];
        updated[index].file = file;
        setData('certifications', updated);
    };

    const handleRemoveCertification = (indexToRemove: number) => {
        setData(
            'certifications',
            data.certifications.filter((_, idx) => idx !== indexToRemove)
        );
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('agents.update', agent.id), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Agent updated successfully!');
            },
            onError: (err) => {
                const firstError = Object.values(err)[0];
                toast.error(firstError || 'Failed to update agent.');
            },
        });
    };

    const handlePhotoChange = (file: File | File[] | string | string[] | (File | string)[] | null) => {
        if (file instanceof File) {
            setData('agent_photo', file);
            setSelectedPhoto(file);
        } else if (Array.isArray(file) && file[0] instanceof File) {
            setData('agent_photo', file[0]);
            setSelectedPhoto(file[0]);
        } else {
            setData('agent_photo', null);
            setSelectedPhoto(null);
        }
    };

    const currentStatusCfg = statusConfig[data.status] || statusConfig.pending;
    const StatusIcon = currentStatusCfg.icon;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Agent - ${agent.agent_name}`} />

            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                {/* Top Action Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route('agents.index')}
                            className={buttonVariants({ variant: 'outline', size: 'sm', className: 'gap-2' })}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to List
                        </Link>
                        <Link
                            href={route('agents.show', agent.id)}
                            className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'gap-2 text-muted-foreground' })}
                        >
                            <Eye className="w-4 h-4" />
                            View Profile
                        </Link>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Current Status:</span>
                        <Badge variant="outline" className={`gap-1.5 px-2.5 py-1 text-xs font-semibold ${currentStatusCfg.classes}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {currentStatusCfg.label}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={`gap-1.5 px-2.5 py-1 text-xs font-semibold ${
                                data.is_public
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                        >
                            {data.is_public ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                            {data.is_public ? 'Public' : 'Private'}
                        </Badge>
                    </div>
                </div>

                {/* Main Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Header Summary Banner */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 shadow-xl">
                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-400/40 bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-inner">
                                    {selectedPhoto ? (
                                        <img
                                            src={typeof selectedPhoto === 'string' ? (selectedPhoto.startsWith('http') || selectedPhoto.startsWith('/') ? selectedPhoto : `/${selectedPhoto}`) : URL.createObjectURL(selectedPhoto)}
                                            alt={agent.agent_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <User className="w-8 h-8 text-slate-400" />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                                        Edit {agent.agent_name || 'Agent'}
                                        <Sparkles className="w-4 h-4 text-indigo-400" />
                                    </h1>
                                    <p className="text-xs sm:text-sm text-slate-300">
                                        {agent.agency_name ? `${agent.agency_name} • ` : ''}Member since {new Date(agent.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 self-end md:self-center">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 px-5"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left 2 Columns: Information Forms */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Section 1: Agency & Contact */}
                            <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        Personal & Agency Details
                                    </CardTitle>
                                    <CardDescription>Basic contact and agency identity for this agent</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="agent_name" className="text-xs font-semibold">
                                                Agent Full Name <span className="text-rose-500">*</span>
                                            </Label>
                                            <Input
                                                id="agent_name"
                                                value={data.agent_name}
                                                onChange={(e) => setData('agent_name', e.target.value)}
                                                placeholder="e.g. John Doe"
                                                className="bg-background"
                                            />
                                            <InputError message={errors.agent_name} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="agency_name" className="text-xs font-semibold">
                                                Agency Name
                                            </Label>
                                            <Input
                                                id="agency_name"
                                                value={data.agency_name}
                                                onChange={(e) => setData('agency_name', e.target.value)}
                                                placeholder="e.g. Elite Sports Agency"
                                                className="bg-background"
                                            />
                                            <InputError message={errors.agency_name} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="email" className="text-xs font-semibold">
                                                Email Address
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    placeholder="agent@example.com"
                                                    className="pl-9 bg-background"
                                                />
                                                <Mail className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                            <InputError message={errors.email} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="phone_number" className="text-xs font-semibold">
                                                Phone Number
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="phone_number"
                                                    value={data.phone_number}
                                                    onChange={(e) => setData('phone_number', e.target.value)}
                                                    placeholder="+1 (555) 000-0000"
                                                    className="pl-9 bg-background"
                                                />
                                                <Phone className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                            <InputError message={errors.phone_number} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="website_link" className="text-xs font-semibold">
                                                Website Link
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="website_link"
                                                    value={data.website_link}
                                                    onChange={(e) => setData('website_link', e.target.value)}
                                                    placeholder="https://elitesports.com"
                                                    className="pl-9 bg-background"
                                                />
                                                <Globe className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                            <InputError message={errors.website_link} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="address" className="text-xs font-semibold">
                                                Address / Location
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="address"
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                    placeholder="City, State, Country"
                                                    className="pl-9 bg-background"
                                                />
                                                <MapPin className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                            </div>
                                            <InputError message={errors.address} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section 2: Education & Background */}
                            <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        Education & Professional Background
                                    </CardTitle>
                                    <CardDescription>Academic history, experience, and notable clients</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="space-y-1.5 sm:col-span-2">
                                            <Label htmlFor="institution_name" className="text-xs font-semibold">
                                                University / Institution
                                            </Label>
                                            <Input
                                                id="institution_name"
                                                value={data.institution_name}
                                                onChange={(e) => setData('institution_name', e.target.value)}
                                                placeholder="e.g. Harvard University"
                                                className="bg-background"
                                            />
                                            <InputError message={errors.institution_name} />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label htmlFor="graduation_year" className="text-xs font-semibold">
                                                Graduation Year
                                            </Label>
                                            <Input
                                                id="graduation_year"
                                                value={data.graduation_year}
                                                onChange={(e) => setData('graduation_year', e.target.value)}
                                                placeholder="e.g. 2018"
                                                className="bg-background"
                                            />
                                            <InputError message={errors.graduation_year} />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="degree" className="text-xs font-semibold">
                                            Degree / Qualification
                                        </Label>
                                        <Input
                                            id="degree"
                                            value={data.degree}
                                            onChange={(e) => setData('degree', e.target.value)}
                                            placeholder="e.g. B.S. in Sports Management & Law"
                                            className="bg-background"
                                        />
                                        <InputError message={errors.degree} />
                                    </div>

                                    {/* Notable Clients Tag Input System */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="client_tag_input" className="text-xs font-semibold flex items-center gap-1.5">
                                                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                                                Notable Clients
                                                {data.notable_client.length > 0 && (
                                                    <span className="text-[11px] font-normal text-muted-foreground">
                                                        ({data.notable_client.length})
                                                    </span>
                                                )}
                                            </Label>
                                            {data.notable_client.length > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => setData('notable_client', [])}
                                                    className="text-[11px] text-muted-foreground hover:text-rose-500 transition-colors"
                                                >
                                                    Clear all
                                                </button>
                                            )}
                                        </div>

                                        <div className="rounded-lg border border-input bg-background p-2.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all space-y-2">
                                            {/* Active Tag Badges */}
                                            {data.notable_client.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {data.notable_client.map((client, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 transition-all shadow-xs"
                                                        >
                                                            <span>{client}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveClientTag(index)}
                                                                className="hover:bg-indigo-200/60 dark:hover:bg-indigo-800/80 rounded p-0.5 transition-colors"
                                                                title={`Remove ${client}`}
                                                            >
                                                                <X className="w-3 h-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Input & Add Button */}
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id="client_tag_input"
                                                    value={clientTagInput}
                                                    onChange={(e) => setClientTagInput(e.target.value)}
                                                    onKeyDown={handleTagKeyDown}
                                                    placeholder={data.notable_client.length === 0 ? "Type client name (e.g. Leo Messi, Kylian Mbappe) and press Enter..." : "Add another client and press Enter..."}
                                                    className="h-9 text-xs border-0 shadow-none focus-visible:ring-0 px-1 bg-transparent"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleAddClientTag()}
                                                    disabled={!clientTagInput.trim()}
                                                    className="h-8 px-3 text-xs gap-1 flex-shrink-0"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                    Add Tag
                                                </Button>
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-muted-foreground">
                                            Press <kbd className="px-1 py-0.5 text-[10px] font-mono bg-muted rounded border">Enter</kbd> or <kbd className="px-1 py-0.5 text-[10px] font-mono bg-muted rounded border">,</kbd> to add tags. You can also paste comma-separated names.
                                        </p>
                                        <InputError message={errors.notable_client} />
                                    </div>

                                    {/* Background & Bio with ReactQuill Rich Text Editor */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="background_info" className="text-xs font-semibold">
                                            Background & Bio
                                        </Label>
                                        <div className="bg-white dark:bg-gray-900 rounded-lg border border-input pb-12 overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-all">
                                            <ReactQuill
                                                theme="snow"
                                                value={data.background_info}
                                                onChange={(content) => setData('background_info', content)}
                                                className="h-[220px]"
                                                readOnly={processing}
                                                placeholder="Provide detail on background, experience, specializations, career history..."
                                            />
                                        </div>
                                        <InputError message={errors.background_info} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section 3: Services Provided */}
                            <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        Services Provided
                                    </CardTitle>
                                    <CardDescription>Add services and areas of representation offered by this agent</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Active Services */}
                                    <div className="space-y-2">
                                        {data.services.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {data.services.map((service, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 transition-all shadow-xs"
                                                    >
                                                        <span>{service}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveService(index)}
                                                            className="hover:bg-emerald-200/60 dark:hover:bg-emerald-800/80 rounded p-0.5 transition-colors"
                                                            title={`Remove ${service}`}
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-muted-foreground italic">No services added yet. Add custom services or pick from suggestions below.</p>
                                        )}
                                    </div>

                                    {/* Input & Add Custom Service */}
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={serviceInput}
                                            onChange={(e) => setServiceInput(e.target.value)}
                                            onKeyDown={handleServiceKeyDown}
                                            placeholder="Type a service (e.g. Contract Negotiation) and press Enter..."
                                            className="bg-background text-xs"
                                        />
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={() => handleAddService()}
                                            disabled={!serviceInput.trim()}
                                            className="gap-1.5 text-xs flex-shrink-0"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            Add Service
                                        </Button>
                                    </div>

                                    {/* Quick Suggestions */}
                                    <div className="pt-2">
                                        <span className="text-[11px] font-semibold text-muted-foreground block mb-2">Quick suggestions:</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {SUGGESTED_SERVICES.map((suggested) => {
                                                const isSelected = data.services.includes(suggested);
                                                return (
                                                    <button
                                                        key={suggested}
                                                        type="button"
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setData('services', data.services.filter((s) => s !== suggested));
                                                            } else {
                                                                handleAddService(suggested);
                                                            }
                                                        }}
                                                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                                                            isSelected
                                                                ? 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700 font-medium'
                                                                : 'bg-muted/40 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground'
                                                        }`}
                                                    >
                                                        {isSelected ? '✓ ' : '+ '}
                                                        {suggested}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <InputError message={errors.services} />
                                </CardContent>
                            </Card>

                            {/* Section 4: Certifications */}
                            <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                                <CardHeader className="pb-4 flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            Certifications & Licenses
                                        </CardTitle>
                                        <CardDescription>Upload professional licenses and official certificates</CardDescription>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddCertificationRow}
                                        className="gap-1.5 text-xs"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Add Certificate
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {data.certifications.length === 0 ? (
                                        <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
                                            <Award className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                                            <p className="text-xs text-muted-foreground">No certifications added.</p>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleAddCertificationRow}
                                                className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 gap-1"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Add First Certificate
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {data.certifications.map((cert, index) => (
                                                <div
                                                    key={index}
                                                    className="p-3.5 rounded-lg border border-border bg-card/60 space-y-3 relative group"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                                            <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                                            Certificate #{index + 1}
                                                        </span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => handleRemoveCertification(index)}
                                                            className="h-7 w-7 text-muted-foreground hover:text-rose-500"
                                                            title="Remove certificate"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                                                        <div className="space-y-1">
                                                            <Label className="text-[11px] font-medium">Certificate Name</Label>
                                                            <Input
                                                                value={cert.name}
                                                                onChange={(e) => handleUpdateCertificationName(index, e.target.value)}
                                                                placeholder="e.g. FIFA Licensed Agent, NBPA Certified"
                                                                className="text-xs bg-background"
                                                            />
                                                        </div>

                                                        <div className="space-y-1">
                                                            <Label className="text-[11px] font-medium">Document / File (Optional)</Label>
                                                            <Input
                                                                type="file"
                                                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                                                onChange={(e) => {
                                                                    const f = e.target.files?.[0] || null;
                                                                    handleUpdateCertificationFile(index, f);
                                                                }}
                                                                className="text-xs bg-background file:text-xs file:font-medium"
                                                            />
                                                            {cert.existing_file && !cert.file && (
                                                                <p className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
                                                                    <FileText className="w-3 h-3 flex-shrink-0" />
                                                                    <a
                                                                        href={cert.existing_file.startsWith('http') ? cert.existing_file : `/${cert.existing_file}`}
                                                                        target="_blank"
                                                                        rel="noreferrer"
                                                                        className="hover:underline truncate max-w-[220px]"
                                                                    >
                                                                        Current: {cert.existing_file.split('/').pop()}
                                                                    </a>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <InputError message={errors.certifications} />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right 1 Column: Status, Photo, Overview */}
                        <div className="space-y-6">
                            {/* Approval Status Card */}
                            <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold">Approval Status</CardTitle>
                                    <CardDescription>Control visibility & listing status</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="status" className="text-xs font-semibold">Status</Label>
                                        <Select
                                            value={data.status}
                                            onValueChange={(val) => setData('status', val as 'pending' | 'approved' | 'rejected')}
                                        >
                                            <SelectTrigger id="status" className="w-full bg-background">
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="pending">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-4 h-4 text-amber-500" />
                                                        <span>Pending</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="approved">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                        <span>Approved</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="rejected">
                                                    <div className="flex items-center gap-2">
                                                        <XCircle className="w-4 h-4 text-rose-500" />
                                                        <span>Rejected</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.status} />
                                    </div>

                                    {/* Public Visibility Toggle */}
                                    <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="space-y-0.5">
                                                <Label htmlFor="is_public" className="text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                                                    {data.is_public ? (
                                                        <Globe className="w-3.5 h-3.5 text-emerald-500" />
                                                    ) : (
                                                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                                                    )}
                                                    Public Visibility
                                                </Label>
                                                <p className="text-[11px] text-muted-foreground">
                                                    {data.is_public
                                                        ? 'Visible in public website directory'
                                                        : 'Hidden from public directory'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="outline"
                                                    className={`text-[10px] px-2 py-0.5 font-semibold ${
                                                        data.is_public
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                                                            : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                                                    }`}
                                                >
                                                    {data.is_public ? 'Public' : 'Private'}
                                                </Badge>
                                                <Switch
                                                    id="is_public"
                                                    checked={data.is_public}
                                                    onCheckedChange={(checked) => setData('is_public', checked)}
                                                />
                                            </div>
                                        </div>
                                        <InputError message={errors.is_public} />
                                    </div>

                                    <div className="rounded-lg p-3 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-muted-foreground space-y-1">
                                        <p className="font-semibold text-foreground">Status & Visibility Guidelines:</p>
                                        <p>• <strong>Approved:</strong> Publicly listed in agent directory when visibility is Public.</p>
                                        <p>• <strong>Pending:</strong> Under review, awaiting approval.</p>
                                        <p>• <strong>Rejected:</strong> Hidden from public listings.</p>
                                        <p>• <strong>Public Visibility:</strong> Controls whether this profile is visible to website visitors.</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Photo Upload Card */}
                            <Card className="shadow-sm border-gray-200 dark:border-gray-800">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold">Agent Photo</CardTitle>
                                    <CardDescription>Profile headshot image</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <ImageUpload
                                        onChange={handlePhotoChange}
                                        value={selectedPhoto}
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                    />
                                    <InputError message={errors.agent_photo} />
                                    <p className="text-xs text-muted-foreground">
                                        Recommended: square aspect ratio, max 3MB (JPEG, PNG, WebP).
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Sticky Save Buttons */}
                            <div className="flex items-center gap-3 pt-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Link
                                    href={route('agents.show', agent.id)}
                                    className={buttonVariants({ variant: 'outline', className: 'w-1/3' })}
                                >
                                    Cancel
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
