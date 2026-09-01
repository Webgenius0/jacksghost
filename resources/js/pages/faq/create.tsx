import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import InputError from '@/components/input-error';
import { Button, buttonVariants } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FormEventHandler } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

type CreateFaqForm = {
    type: string;
    question: string;
    answer: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'FAQ Create',
        href: '/faq/create',
    },
];

export default function Create() {
    const faqTypeOptions = [
        { value: 'general', label: 'General' },
        { value: 'sports-agent', label: 'Sports Agent' },
        { value: 'draft-picks', label: 'Draft Picks' },
        { value: 'membership-accounts', label: 'Membership & Accounts' },
        { value: 'contact-support', label: 'Contact & Support' },
    ];

    const { data, setData, errors, post, reset, processing } = useForm<CreateFaqForm>({
        type: 'general',
        question: '',
        answer: '',
    });

    const createFaq: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('faq.store'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                toast.success('FAQ created successfully!');
            },
            onError: () => {
                toast.error('Failed to create FAQ.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="FAQ Create" />
            <div className="m-5 flex flex-col gap-5">
                <div className="flex">
                    <Link className={(buttonVariants({ variant: 'default', className: 'mb-2 ml-auto' }))} href={route('faq.index')}>
                        FAQs List
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Create FAQ</CardTitle>
                    </CardHeader>
                    <form onSubmit={createFaq}>
                        <CardContent>
                            <div className="grid w-full items-center gap-4">

                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(value) => setData('type', value)}
                                        disabled={processing}
                                    >
                                        <SelectTrigger id="type" className="w-full">
                                            <SelectValue placeholder="Select FAQ type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {faqTypeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.type} />
                                </div>

                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="question">Question <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="question"
                                        value={data.question}
                                        onChange={(e) => setData('question', e.target.value)}
                                        placeholder="Enter the FAQ question"
                                        disabled={processing}
                                        required
                                    />
                                    <InputError message={errors.question} />
                                </div>

                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="answer">Answer <span className="text-red-500">*</span></Label>
                                    <div className="bg-white rounded-md mt-2 pb-10">
                                        <ReactQuill
                                            theme="snow"
                                            value={data.answer}
                                            onChange={(content) => setData('answer', content)}
                                            className="h-[300px]"
                                            readOnly={processing}
                                        />
                                    </div>
                                    <InputError message={errors.answer} />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between mt-5">
                            <Button type="button" variant="outline" onClick={() => reset()} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Create
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
