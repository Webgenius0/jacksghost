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
import { Checkbox } from '@/components/ui/checkbox';
import { League } from '@/types';
import {
    Upload,
    FileSpreadsheet,
    Download,
    X,
    AlertCircle,
    Info,
    CheckCircle2,
    Loader2,
} from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    leagues: League[];
}

export default function ImportDraftPlayerModal({ isOpen, onClose, leagues }: Props) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [defaultLeagueId, setDefaultLeagueId] = useState<string>('');
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

        // Limit to 10MB
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
            setErrorMessage('Please select a file to import.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        const formData = new FormData();
        formData.append('file', file);
        if (defaultLeagueId) {
            formData.append('default_league_id', defaultLeagueId);
        }
        formData.append('update_existing', updateExisting ? '1' : '0');

        router.post(route('draft-player.import'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                setIsSubmitting(false);
                const flash = (page.props as any)?.flash;
                if (flash?.success) {
                    toast.success(flash.success);
                } else {
                    toast.success('Draft players imported successfully!');
                }

                if (flash?.import_errors && flash.import_errors.length > 0) {
                    toast.warning(`${flash.import_errors.length} rows had warnings. Check notifications.`);
                }

                handleReset();
                onClose();
            },
            onError: (errors) => {
                setIsSubmitting(false);
                const firstError = Object.values(errors)[0] as string;
                setErrorMessage(firstError || 'Failed to import file. Please check file format and try again.');
                toast.error('Import failed. Please review errors.');
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
                            <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-semibold">
                                Import Draft Players
                            </DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
                                Upload an Excel (.xlsx, .xls) or CSV spreadsheet to batch import draft players.
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Default League */}
                        <div>
                            <Label htmlFor="default_league" className="text-sm font-medium mb-1.5 block">
                                Default League (Optional)
                            </Label>
                            <select
                                id="default_league"
                                value={defaultLeagueId}
                                onChange={(e) => setDefaultLeagueId(e.target.value)}
                                disabled={isSubmitting}
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Auto-detect from file</option>
                                {leagues.map((l) => (
                                    <option key={l.id} value={l.id}>
                                        {l.league_name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-[11px] text-muted-foreground mt-1">
                                Used if a row does not specify a league.
                            </p>
                        </div>

                        {/* Update Existing Checkbox */}
                        <div className="flex flex-col justify-start">
                            <Label className="text-sm font-medium mb-1.5 block">
                                Duplicate Handling
                            </Label>
                            <div className="flex items-start space-x-2 pt-1.5">
                                <Checkbox
                                    id="update_existing"
                                    checked={updateExisting}
                                    onCheckedChange={(checked) => setUpdateExisting(Boolean(checked))}
                                    disabled={isSubmitting}
                                />
                                <div className="grid gap-0.5 leading-none">
                                    <label
                                        htmlFor="update_existing"
                                        className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Update existing players
                                    </label>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">
                                        Matches on First Name, Last Name, League, and Year.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Download Sample Template & Columns Guide */}
                    <div className="rounded-lg border border-border/80 bg-muted/40 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                <Info className="w-3.5 h-3.5 text-primary" />
                                Need the right format?
                            </div>
                            <a
                                href={route('draft-player.template')}
                                download
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline hover:text-primary/80 transition-colors"
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
                                <div className="mt-2 text-xs text-muted-foreground space-y-1 bg-background/80 p-2.5 rounded border border-border/50">
                                    <p>
                                        <span className="font-semibold text-foreground">Required:</span>{' '}
                                        <code className="text-[11px] bg-muted px-1 py-0.5 rounded">First Name</code> (or <code className="text-[11px] bg-muted px-1 py-0.5 rounded">Player Name</code>)
                                    </p>
                                    <p>
                                        <span className="font-semibold text-foreground">Optional:</span>{' '}
                                        Last Name, Current Team, Draft Team, League, Year, Round, Pick, Position, School, Agent Name, Agency Name, Height, Weight, Birthdate (YYYY-MM-DD), Nationality, Status (signed / unsigned_draft / undrafted)
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
                            className="gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Import Players
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
