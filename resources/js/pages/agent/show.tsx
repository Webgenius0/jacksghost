import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { buttonVariants } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle, XCircle, Clock, ArrowLeft, Globe, Mail, Phone,
    MapPin, GraduationCap, Building2, User, FileText, Star,
    CreditCard, Shield, Edit, Trash2
} from 'lucide-react';
import { ConfirmDialog } from '@/components/alert-dialog';
import { AlertDialog } from '@heroui/react';

interface Certification {
    id: number;
    certificate_name: string;
    certificate_file: string | null;
}

interface Service {
    id: number;
    service_name: string;
}

interface Payment {
    id: number;
    amount: number;
    currency: string;
    payment_status: string;
    paid_at: string | null;
    stripe_session_id: string | null;
    payment_intent_id: string | null;
    transaction_id: string | null;
}

interface Agent {
    id: number;
    agent_name: string;
    slug: string | null;
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
    created_at: string;
    certifications: Certification[];
    services: Service[];
    payment: Payment | null;
}

interface Props {
    agent: Agent;
}

const statusConfig = {
    pending:  { label: 'Pending',  Icon: Clock,        classes: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400' },
    approved: { label: 'Approved', Icon: CheckCircle,  classes: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' },
    rejected: { label: 'Rejected', Icon: XCircle,      classes: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400' },
};

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | null | undefined }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 break-words">{value}</p>
            </div>
        </div>
    );
}

export default function Show({ agent }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Agent Management', href: '/agents' },
        { title: agent.agent_name || 'Agent Detail', href: `/agents/${agent.id}` },
    ];

    const cfg = statusConfig[agent.status] ?? statusConfig['pending'];

    const handleDelete = () => {
        router.delete(route('agents.destroy', agent.id), {
            onSuccess: () => toast.success('Agent deleted.'),
            onError: () => toast.error('Failed to delete agent.'),
        });
    };

    const photoSrc = agent.agent_photo
        ? (agent.agent_photo.startsWith('http') ? agent.agent_photo : `/${agent.agent_photo}`)
        : null;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${agent.agent_name} — Agent Detail`} />

            <div className="m-5 space-y-5">
                {/* ── Top Action Bar ─────────────────────────────────── */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href={route('agents.index')} className={buttonVariants({ variant: 'outline' })}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Agents
                    </Link>
                    <div className="flex gap-2">
                        <Link href={route('agents.edit', agent.id)} className={buttonVariants({ variant: 'secondary' })}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Link>
                        <ConfirmDialog
                            title="Delete Agent?"
                            description="This action permanently deletes the agent and cannot be undone."
                            onConfirm={handleDelete}
                            trigger={
                                <AlertDialog.Trigger className={buttonVariants({ variant: 'destructive' })}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </AlertDialog.Trigger>
                            }
                        />
                    </div>
                </div>

                {/* ── Profile Hero Card ─────────────────────────────────── */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-8 text-white shadow-xl relative overflow-hidden">
                    {/* decorative blobs */}
                    <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />

                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-4 border-white/20 bg-slate-700 shadow-lg">
                            {photoSrc ? (
                                <img src={photoSrc} alt={agent.agent_name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-3xl font-bold text-white/60">
                                        {agent.agent_name?.charAt(0).toUpperCase() || '?'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Identity */}
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold tracking-tight">{agent.agent_name}</h1>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.classes}`}>
                                    <cfg.Icon className="w-3.5 h-3.5" />
                                    {cfg.label}
                                </span>
                            </div>
                            {agent.agency_name && (
                                <p className="text-slate-300 text-sm flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                    {agent.agency_name}
                                </p>
                            )}
                            <p className="text-slate-400 text-xs mt-2">
                                Registered: {new Date(agent.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>

                        {/* Payment Chip */}
                        {agent.payment && (
                            <div className="flex-shrink-0 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 text-center min-w-[100px]">
                                <p className="text-xs text-slate-400 mb-1">Paid</p>
                                <p className="text-xl font-bold text-emerald-400">${agent.payment.amount}</p>
                                <p className="text-xs text-slateald-300 capitalize">{agent.payment.payment_status}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Detail Grid ─────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                    {/* Contact & Links */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 min-w-0">
                        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Contact Info</h2>
                        <InfoRow icon={Mail} label="Email" value={agent.email} />
                        <InfoRow icon={Phone} label="Phone" value={agent.phone_number} />
                        <InfoRow icon={MapPin} label="Address" value={agent.address} />
                        {agent.website_link && (
                            <div className="flex items-start gap-3 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                    <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">Website</p>
                                    <a
                                        href={agent.website_link}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline break-all"
                                    >
                                        {agent.website_link}
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Education */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 min-w-0">
                        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Education</h2>
                        <InfoRow icon={GraduationCap} label="Institution" value={agent.institution_name} />
                        <InfoRow icon={FileText} label="Degree" value={agent.degree} />
                        <InfoRow icon={Clock} label="Graduation Year" value={agent.graduation_year} />
                        {!agent.institution_name && !agent.degree && (
                            <p className="text-sm text-gray-400 italic">No education info provided.</p>
                        )}
                    </div>

                    {/* Payment */}
                    <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 min-w-0">
                        <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Payment</h2>
                        {agent.payment ? (
                            <>
                                <InfoRow icon={CreditCard} label="Amount" value={`$${agent.payment.amount} ${agent.payment.currency?.toUpperCase()}`} />
                                <InfoRow icon={Shield} label="Status" value={agent.payment.payment_status} />
                                <InfoRow icon={Clock} label="Paid At" value={agent.payment.paid_at ? new Date(agent.payment.paid_at).toLocaleString() : null} />
                                {agent.payment.transaction_id && (
                                    <div className="mt-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                                        <p className="text-[10px] text-gray-400 uppercase font-medium mb-1">Transaction ID</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 font-mono break-all">{agent.payment.transaction_id}</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No payment record.</p>
                        )}
                    </div>

                    {/* Background Info */}
                    {agent.background_info && (
                        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 min-w-0 overflow-hidden">
                            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Background Info
                            </h2>
                            <div
                                className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-w-full break-words [overflow-wrap:anywhere] overflow-hidden [&_*]:max-w-full [&_*]:break-words [&_*]:[overflow-wrap:anywhere] [&_p]:mb-3 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ __html: agent.background_info }}
                            />
                        </div>
                    )}

                    {/* Notable Clients */}
                    {agent.notable_client && (
                        <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 min-w-0 overflow-hidden">
                            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                Notable Clients
                            </h2>
                            {Array.isArray(agent.notable_client) ? (
                                <div className="flex flex-wrap gap-2">
                                    {agent.notable_client.map((client, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs px-2.5 py-1 bg-slate-50 dark:bg-slate-800 font-medium break-all">
                                            {client}
                                        </Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words [overflow-wrap:anywhere]">{agent.notable_client}</p>
                            )}
                        </div>
                    )}

                    {/* Services */}
                    {agent.services.length > 0 && (
                        <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 min-w-0">
                            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Services Provided</h2>
                            <div className="flex flex-wrap gap-2">
                                {agent.services.map((s) => (
                                    <Badge key={s.id} variant="secondary" className="rounded-full text-xs px-3 py-1">
                                        {s.service_name}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {agent.certifications.length > 0 && (
                        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 min-w-0">
                            <h2 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Certifications</h2>
                            <div className="space-y-2">
                                {agent.certifications.map((cert) => (
                                    <div key={cert.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                                                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{cert.certificate_name}</span>
                                        </div>
                                        {cert.certificate_file && (
                                            <a
                                                href={cert.certificate_file.startsWith('http') ? cert.certificate_file : `/${cert.certificate_file}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0"
                                            >
                                                View File →
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
