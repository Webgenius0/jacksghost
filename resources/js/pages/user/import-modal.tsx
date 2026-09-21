import { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Upload,
    FileSpreadsheet,
    Download,
    X,
    AlertCircle,
    Info,
    CheckCircle2,
    Loader2,
    Users,
} from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ImportUserModal({ isOpen, onClose }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [defaultStatus, setDefaultStatus] = useState<string>('Active');
    const [defaultRole, setDefaultRole] = useState<string>('User');
    const [defaultPassword, setDefaultPassword] = useState<string>('Password123!');
    const [updateExisting, setUpdateExisting] = useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showColumnsGuide, setShowColumnsGuide] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (selectedFile: File | null) => {
        setErrorMessage(null);
        if (!selectedFile) {
            setFile(null);
            return;
        }

        const validExtensions = ['.xlsx', '.xls', '.csv'];
        const fileName = selectedFile.name.toLowerCase();
        const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

        if (!isValid) {
            setErrorMessage('Please upload a valid Excel (.xlsx, .xls) or CSV file.');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setErrorMessage('File size exceeds the 10MB limit.');
            return;
        }

        setFile(selectedFile);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleReset = () => {
        setFile(null);
        setErrorMessage(null);
        setIsSubmitting(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleCloseModal = () => {
        if (isSubmitting) return;
        handleReset();
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setErrorMessage('Please select an Excel or CSV file to import.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('default_status', defaultStatus);
        formData.append('default_role', defaultRole);
        formData.append('default_password', defaultPassword);
        formData.append('update_existing', updateExisting ? '1' : '0');

        router.post(route('user.import'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                setIsSubmitting(false);
                const flash = (page.props as any)?.flash;
                if (flash?.success) {
                    toast.success(flash.success);
                } else {
                    toast.success('Users imported successfully!');
                }

                if (flash?.import_errors && flash.import_errors.length > 0) {
                    toast.warning(`${flash.import_errors.length} rows had notices/warnings. Review notices banner.`);
                }

                handleReset();
                onClose();
            },
            onError: (errors) => {
                setIsSubmitting(false);
                const firstError = Object.values(errors)[0] as string;
                setErrorMessage(firstError || 'Failed to import file. Please check file format and try again.');
                toast.error('Import failed. Please review the errors.');
            },
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleCloseModal()}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold">
                                Import Users from Excel
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                Upload a spreadsheet (.xlsx, .xls, .csv) to batch create or update user accounts.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Error Banner */}
                    {errorMessage && (
                        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* Drag and Drop File Box */}
                    <div>
                        <Label className="text-sm font-medium mb-1.5 block">
                            Spreadsheet File <span className="text-red-500">*</span>
                        </Label>
                        {!file ? (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                                    isDragging
                                        ? 'border-primary bg-primary/5 scale-[0.99]'
                                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
                                }`}
                            >
                                <div className="p-3 rounded-full bg-primary/10 text-primary mb-3">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    Click to browse or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Supports .xlsx, .xls, .csv (Max 10MB)
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    className="hidden"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files.length > 0) {
                                            handleFileChange(e.target.files[0]);
                                        }
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card shadow-xs">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                                        <FileSpreadsheet className="w-5 h-5" />
                                    </div>
                                    <div className="truncate">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    disabled={isSubmitting}
                                    onClick={handleReset}
                                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        {/* Default Status */}
                        <div>
                            <Label htmlFor="default_status" className="text-xs font-medium mb-1.5 block">
                                Default Status
                            </Label>
                            <select
                                id="default_status"
                                value={defaultStatus}
                                onChange={(e) => setDefaultStatus(e.target.value)}
                                disabled={isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Default Role */}
                        <div>
                            <Label htmlFor="default_role" className="text-xs font-medium mb-1.5 block">
                                Default Role
                            </Label>
                            <select
                                id="default_role"
                                value={defaultRole}
                                onChange={(e) => setDefaultRole(e.target.value)}
                                disabled={isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="User">User</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        {/* Default Fallback Password */}
                        <div>
                            <Label htmlFor="default_password" className="text-xs font-medium mb-1.5 block">
                                Fallback Password
                            </Label>
                            <Input
                                id="default_password"
                                type="text"
                                value={defaultPassword}
                                onChange={(e) => setDefaultPassword(e.target.value)}
                                disabled={isSubmitting}
                                placeholder="Password123!"
                                className="h-9 text-xs"
                            />
                        </div>
                    </div>

                    {/* Duplicate Handling Checkbox */}
                    <div className="flex items-start space-x-2.5 p-3 rounded-lg border border-border bg-muted/20">
                        <Checkbox
                            id="update_existing"
                            checked={updateExisting}
                            onCheckedChange={(checked) => setUpdateExisting(Boolean(checked))}
                            disabled={isSubmitting}
                            className="mt-0.5"
                        />
                        <div className="grid gap-0.5 leading-none">
                            <label
                                htmlFor="update_existing"
                                className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Update existing users if email matches
                            </label>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Updates existing name, phone, role, status, and password (if a password is provided in row). Unchecked rows will be skipped.
                            </p>
                        </div>
                    </div>

                    {/* Download Sample Template & Columns Guide */}
                    <div className="rounded-lg border border-border/80 bg-muted/40 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                Need the formatted template?
                            </div>
                            <a
                                href={route('user.template')}
                                download
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download Sample Template (.xlsx)
                            </a>
                        </div>

                        <div className="border-t border-border/60 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowColumnsGuide(!showColumnsGuide)}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium flex items-center justify-between w-full"
                            >
                                <span>Supported spreadsheet columns</span>
                                <span>{showColumnsGuide ? '▲ Hide' : '▼ View'}</span>
                            </button>

                            {showColumnsGuide && (
                                <div className="mt-2 text-xs text-muted-foreground space-y-1.5 bg-background/80 p-2.5 rounded border border-border/50">
                                    <p>
                                        <span className="font-semibold text-foreground">Required Columns:</span>{' '}
                                        <code className="text-[11px] bg-muted px-1 py-0.5 rounded">Name</code>,{' '}
                                        <code className="text-[11px] bg-muted px-1 py-0.5 rounded">Email</code>
                                    </p>
                                    <p>
                                        <span className="font-semibold text-foreground">Optional Columns:</span>{' '}
                                        <code className="text-[11px] bg-muted px-1 py-0.5 rounded">Phone</code>,{' '}
                                        <code className="text-[11px] bg-muted px-1 py-0.5 rounded">Password</code>,{' '}
                                        <code className="text-[11px] bg-muted px-1 py-0.5 rounded">Status</code> (Active / Inactive),{' '}
                                        <code className="text-[11px] bg-muted px-1 py-0.5 rounded">Role</code> (User / Admin),{' '}
                                        <code className="text-[11px] bg-muted px-1 py-0.5 rounded">Timezone</code> (e.g. UTC, America/New_York)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseModal}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!file || isSubmitting}
                            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Import Users
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
