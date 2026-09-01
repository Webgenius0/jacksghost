import React, { useCallback, useState, useEffect } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
    onChange: (files: File | File[] | string | string[] | (File | string)[] | null) => void;
    value?: File | File[] | null | string | string[] | (File | string)[]; // string/string[] for existing image URLs
    multiple?: boolean;
    accept?: string;
    className?: string; // Add className prop
}

export default function ImageUpload({
    onChange,
    value,
    multiple = false,
    accept = 'image/*',
    className,
}: ImageUploadProps) {
    const [previews, setPreviews] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Generate previews when value changes
    useEffect(() => {
        if (!value) {
            setPreviews([]);
            return;
        }

        if (typeof value === 'string') {
            if (value.startsWith('http') || value.startsWith('/')) {
                setPreviews([value]);
            } else {
                setPreviews([`/${value}`]);
            }
            return;
        }

        const files = Array.isArray(value) ? value : [value];
        const newPreviews = files.map((file) => {
            if (typeof file === 'string') {
                if (file.startsWith('http') || file.startsWith('/')) {
                    return file;
                }
                return `/${file}`;
            }
            return URL.createObjectURL(file as File);
        });
        setPreviews(newPreviews);

        // Cleanup URLs (only for File objects, not strings)
        return () => {
            newPreviews.forEach((url, idx) => {
                if (typeof files[idx] !== 'string') {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [value]);

    const handleFiles = (selectedFiles: FileList | File[]) => {
        setError(null);
        const filesArray = Array.from(selectedFiles);

        // Validate types
        const invalidType = filesArray.find(f => !f.type.startsWith('image/'));
        if (invalidType) {
            setError('Please upload only image files.');
            return;
        }

        if (multiple) {
            const currentFiles = Array.isArray(value) ? value : [];
            const newFiles = [...currentFiles, ...filesArray];
            onChange(newFiles);
        } else {
            onChange(filesArray[0]);
        }
    };

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    }, [multiple, value]);

    const removeFile = (indexToRemove: number) => {
        if (!multiple) {
            onChange(null);
            return;
        }

        const currentFiles = Array.isArray(value) ? value : [];
        const newFiles = currentFiles.filter((_, index) => index !== indexToRemove);
        onChange(newFiles.length > 0 ? newFiles : null);
    };

    return (
        <div className={cn("w-full transition-all", !multiple ? "h-[200px]" : "min-h-[200px]", className)}>

            <div
                className={`relative border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden w-full h-full
                    ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
                    ${previews.length > 0 && !multiple ? 'p-2' : 'p-2'}
                `}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <input
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {previews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-2 py-4 w-full h-full">
                        <UploadCloud className="w-10 h-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            SVG, PNG, JPG or GIF
                        </p>
                    </div>
                ) : (
                    <div className={`grid gap-4 w-full h-full ${multiple ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
                        {previews.map((preview, index) => (
                            <div key={index} className={`relative group rounded-md overflow-hidden bg-muted flex items-center justify-center ${multiple ? ' max-h-[180px]' : 'w-full h-full'}`}>
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="object-contain w-full h-full"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            removeFile(index);
                                        }}
                                        className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors shadow-sm"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {multiple && (
                            <div className="flex flex-col items-center justify-center space-y-2 py-2 border-2 border-dashed border-border rounded-md hover:border-primary/50 hover:bg-muted/50 max-h-[180px]">
                                <UploadCloud className="w-6 h-6 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">Add more</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm font-medium text-destructive mt-2">{error}</p>
            )}
        </div>
    );
}
