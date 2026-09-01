import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, Faq } from '@/types';
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

type EditFaqForm = {
    type: string;
    question: string;
    answer: string;
};

interface Props {
    faq: Faq;
}

export default function Edit({ faq }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'FAQ Edit',
            href: `/faq/${faq.id}/edit`,
        },
    ];

    const faqTypeOptions = [
        { value: 'general', label: 'General' },
        { value: 'sports-agent', label: 'Sports Agent' },
        { value: 'draft-picks', label: 'Draft Picks' },
        { value: 'membership-accounts', label: 'Membership & Accounts' },
        { value: 'contact-support', label: 'Contact & Support' },
    ];

    const { data, setData, errors, put, reset, processing } = useForm<EditFaqForm>({
        type: faq.type || 'general',
        question: faq.question || '',
        answer: faq.answer || '',
    });

    const updateFaq: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('faq.update', faq.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('FAQ updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update FAQ.');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="FAQ Edit" />
            <div className="m-5 flex flex-col gap-5">
                <div className="flex">
                    <Link className={(buttonVariants({ variant: 'default', className: 'mb-2 ml-auto' }))} href={route('faq.index')}>
                        FAQs List
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Edit FAQ</CardTitle>
                    </CardHeader>
                    <form onSubmit={updateFaq}>
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
                                Reset
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Update
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
