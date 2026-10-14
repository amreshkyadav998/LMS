"use client";

import { ArrowLeft, ArrowRight, CheckCircle2, FileText, ImageIcon, UploadCloud } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { api, errorMessage } from "@/lib/api";
import { SALARY_SLIP } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { formatDateTime, formatFileSize } from "@/lib/format";
import type { BorrowerProfile } from "@/types";

function validateFile(file: File): string | null {
  if (!SALARY_SLIP.MIME_TYPES.includes(file.type)) return "Only PDF, JPG or PNG files are allowed.";
  if (file.size > SALARY_SLIP.MAX_SIZE_BYTES) return "File is too large. Maximum allowed size is 5 MB.";
  return null;
}

interface SalarySlipStepProps {
  profile: BorrowerProfile;
  onComplete: (profile: BorrowerProfile) => void;
  onBack: () => void;
}

export function SalarySlipStep({ profile, onComplete, onBack }: SalarySlipStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState(profile);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slip = current.salarySlip;

  async function upload(file: File) {
    const validationError = validateFile(file);
    setError(validationError);
    if (validationError) return;

    const formData = new FormData();
    formData.append("salarySlip", file);

    setUploading(true);
    try {
      const { profile: updated } = await api<{ profile: BorrowerProfile }>("/borrower/salary-slip", {
        method: "POST",
        formData,
      });
      setCurrent(updated);
      toast.success("Salary slip uploaded");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void upload(file);
  }

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}

      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition",
          dragging ? "border-brand-500 bg-brand-50/60" : "border-slate-300 bg-cream hover:border-brand-400 hover:bg-brand-50/30",
          uploading && "pointer-events-none opacity-70",
        )}
      >
        <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-sm ring-1 ring-slate-200">
          {uploading ? <Spinner className="size-6" /> : <UploadCloud className="size-7" />}
        </span>
        <p className="mt-4 text-sm font-semibold text-black">
          {uploading ? "Uploading…" : slip ? "Drop a new file to replace" : "Drop your salary slip here"}
        </p>
        <p className="mt-1 text-sm text-slate-500">
          or <span className="font-semibold text-brand-600">browse files</span> · PDF, JPG or PNG up to 5 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={SALARY_SLIP.ACCEPT}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </div>

      {slip && (
        <div className="flex items-center gap-4 rounded-xl bg-white p-4 ring-1 ring-emerald-200">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            {slip.mimeType === "application/pdf" ? <FileText className="size-5" /> : <ImageIcon className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-black">{slip.originalName}</p>
            <p className="text-xs text-slate-500">
              {formatFileSize(slip.size)} · Uploaded {formatDateTime(slip.uploadedAt)}
            </p>
          </div>
          <CheckCircle2 className="size-5 shrink-0 text-emerald-500" />
        </div>
      )}

      <div className="flex items-center justify-between border-t border-slate-100 pt-6">
        <Button variant="ghost" onClick={onBack} icon={<ArrowLeft className="size-4" />}>
          Back
        </Button>
        <Button size="lg" disabled={!slip || uploading} onClick={() => onComplete(current)}>
          Continue <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
