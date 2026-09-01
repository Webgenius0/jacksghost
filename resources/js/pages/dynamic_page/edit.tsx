import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, DynamicPage } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
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
import { FormEventHandler } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { toast } from 'sonner';

interface Props {
    dynamicPage: DynamicPage;
}

type EditDynamicPageForm = {
    page_title: string;
    page_slug: string;
    page_content: string;
};

export default function Edit({ dynamicPage }: Props) {
    const { data, setData, errors, put, reset, processing } = useForm<EditDynamicPageForm>({
        page_title: dynamicPage.page_title,
        page_slug: dynamicPage.page_slug || '',
        page_content: dynamicPage.page_content || '',
    });

    const updatePage: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('dynamic_page.update', dynamicPage.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Dynamic Page updated successfully!');
            },
            onError: () => {
                toast.error('Failed to update Dynamic Page.');
            },
        });
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dynamic Page Edit',
            href: `/dynamic_page/${dynamicPage.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dynamic Page Edit" />
            <div className="m-5 flex flex-col gap-5">
                <div className="flex">
                    <Link className={(buttonVariants({ variant: 'default', className: 'mb-2 ml-auto' }))} href={route('dynamic_page.index')}>
                        Dynamic Pages List
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Edit Dynamic Page</CardTitle>
                    </CardHeader>
                    <form onSubmit={updatePage}>
                        <CardContent>
                            <div className="grid w-full items-center gap-4">

                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="page_title">Page Title</Label>
                                    <Input
                                        id="page_title"
                                        value={data.page_title}
                                        onChange={(e) => setData('page_title', e.target.value)}
                                        placeholder="Enter the page title"
                                        disabled={processing}
                                        readOnly
                                    />
                                    <InputError message={errors.page_title} />
                                </div>

                                {/* <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="page_slug">Page Slug</Label>
                                    <Input
                                        id="page_slug"
                                        value={data.page_slug}
                                        onChange={(e) => setData('page_slug', e.target.value)}
                                        placeholder="Ex: about-us (leave empty to auto-generate from title)"
                                        disabled={processing}
                                    />
                                    <InputError message={errors.page_slug} />
                                </div> */}

                                <div className="flex flex-col space-y-1.5">
                                    <Label htmlFor="page_content">Page Content</Label>
                                    <div className="bg-white rounded-md mt-2 pb-10">
                                        <ReactQuill
                                            theme="snow"
                                            value={data.page_content}
                                            onChange={(content) => setData('page_content', content)}
                                            className="h-[300px]"
                                            readOnly={processing}
                                        />
                                    </div>
                                    <InputError message={errors.page_content} />
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
