import React, { useCallback, useState, useEffect } from 'react';
import { UploadCloud, X, FileText, File as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    onChange: (file: File | null) => void;
    value?: File | string | null;
    accept?: string;
    className?: string;
    id?: string;
}

export default function FileUpload({
    onChange,
    value,
    accept = '.pdf',
    className,
    id
}: FileUploadProps) {
    const [fileName, setFileName] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!value) {
            setFileName(null);
            return;
        }

        if (typeof value === 'string') {
            // Extract filename from URL
            const parts = value.split('/');
            setFileName(parts[parts.length - 1]);
        } else if (value instanceof File) {
            setFileName(value.name);
        }
    }, [value]);

    const handleFiles = (selectedFiles: FileList | File[]) => {
        setError(null);
        const filesArray = Array.from(selectedFiles);
        const file = filesArray[0];

        if (!file) return;

        // Simple validation based on 'accept' if provided
        if (accept && accept !== '*') {
            const acceptedTypes = accept.split(',').map(t => t.trim());
            const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
            const fileType = file.type;

            const isValid = acceptedTypes.some(type => {
                if (type.startsWith('.')) return type === fileExtension;
                if (type.endsWith('/*')) return fileType.startsWith(type.replace('/*', ''));
                return type === fileType;
            });

            if (!isValid) {
                setError(`Please upload a file of type: ${accept}`);
                return;
            }
        }

        setFileName(file.name);
        onChange(file);
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
    }, []);

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setFileName(null);
        onChange(null);
    };

    return (
        <div className={cn("w-full transition-all h-[150px]", className)}>
            <div
                className={`relative border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden w-full h-full
                    ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
                    ${fileName ? 'bg-muted/30' : ''}
                `}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <input
                    id={id}
                    type="file"
                    accept={accept}
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {!fileName ? (
                    <div className="flex flex-col items-center justify-center space-y-2 py-4">
                        <UploadCloud className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {accept === '.pdf' ? 'PDF files only' : accept.replace(/\./g, '').toUpperCase()}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-2 px-4 w-full">
                        <div className="flex items-center gap-3 p-3 bg-background border rounded-md w-full max-w-[300px] shadow-sm relative group">
                            <div className="p-2 bg-primary/10 rounded">
                                {fileName.toLowerCase().endsWith('.pdf') ? (
                                    <FileText className="w-6 h-6 text-primary" />
                                ) : (
                                    <FileIcon className="w-6 h-6 text-primary" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{fileName}</p>
                                <p className="text-xs text-muted-foreground uppercase">{fileName.split('.').pop()}</p>
                            </div>
                            <button
                                type="button"
                                onClick={removeFile}
                                className="p-1 hover:bg-muted rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                            </button>
                        </div>
                        <p className="text-xs text-primary font-medium">File selected - Click or drag to change</p>
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm font-medium text-destructive mt-2">{error}</p>
            )}
        </div>
    );
}
