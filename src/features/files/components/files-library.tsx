"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, FileArchive, FileUp, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  importAcademicFile,
  validateImportPreviewEvents,
  type ImportFileResult,
} from "@/engines/import-engine";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { ImportPreviewDialog } from "@/features/files/components/import-preview-dialog";
import { formatFileSize } from "@/schemas/academic-file";
import { calendarService } from "@/services/calendar.service";
import { filesService } from "@/services/files.service";
import type { AcademicFile } from "@/types/academic-file";
import type { ExtractedAcademicEvent } from "@/types/academic";

const statusLabels: Record<AcademicFile["status"], string> = {
  uploaded: "Upload concluído",
  processing: "Processando",
  processed: "Pronto",
  failed: "Falhou",
  deleted: "Excluído",
};

export function FilesLibrary() {
  const { user } = useAuthContext();
  const [files, setFiles] = React.useState<AcademicFile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [preview, setPreview] = React.useState<{
    fileName: string;
    result: ImportFileResult;
  } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const loadFiles = React.useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setFiles(await filesService.list(user.id));
    } catch (unknownError) {
      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Não foi possível carregar a biblioteca.",
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void loadFiles(), 0);
    return () => window.clearTimeout(timer);
  }, [loadFiles]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;
    setUploading(true);
    try {
      const uploaded = await filesService.upload(user.id, file);
      setPreview({ fileName: file.name, result: await importAcademicFile(file, uploaded.id) });
      toast.success("Arquivo enviado. A extração ficará disponível na próxima etapa.");
      await loadFiles();
    } catch (unknownError) {
      toast.error(
        unknownError instanceof Error ? unknownError.message : "Não foi possível enviar o arquivo.",
      );
    } finally {
      setUploading(false);
    }
  }

  if (!user)
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Sessão necessária"
        description="Entre na sua conta para acessar seus arquivos acadêmicos."
        actionLabel="Entrar"
        actionHref="/login"
      />
    );

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Central de materiais</CardTitle>
            <CardDescription>
              Envie cronogramas e materiais para manter seu semestre em um só lugar.
            </CardDescription>
          </div>
          <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" /> : <FileUp />}
            {uploading ? "Enviando..." : "Enviar arquivo"}
          </Button>
          <input
            ref={inputRef}
            className="sr-only"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx,.csv,.txt"
            onChange={handleFileChange}
          />
        </CardHeader>
        <CardContent>
          <Label className="text-xs text-muted-foreground">
            PDF, imagem, DOCX, XLSX, CSV ou TXT · máximo de 10 MB
          </Label>
        </CardContent>
      </Card>

      {loading ? (
        <FilesLoading />
      ) : error ? (
        <EmptyState
          icon={AlertTriangle}
          title="Não foi possível carregar seus arquivos"
          description={error}
          actionLabel="Tentar novamente"
        />
      ) : files.length === 0 ? (
        <EmptyState
          icon={FileArchive}
          title="Sua biblioteca está vazia"
          description="Envie o primeiro cronograma para começar a organizar seu semestre."
          actionLabel="Enviar primeiro arquivo"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}
      <Button variant="ghost" className="w-fit" onClick={() => void loadFiles()} disabled={loading}>
        <RefreshCw /> Atualizar biblioteca
      </Button>
      <ImportPreviewDialog
        result={preview?.result ?? null}
        fileName={preview?.fileName ?? "Arquivo"}
        onClose={() => setPreview(null)}
        onConfirm={(events) => handlePreviewConfirm(events)}
      />
    </div>
  );

  async function handlePreviewConfirm(events: ExtractedAcademicEvent[]) {
    if (!user) return;
    try {
      const validated = validateImportPreviewEvents(events);
      await calendarService.confirmImportedEvents(user.id, validated);
      setPreview(null);
      toast.success(`${validated.length} evento(s) confirmado(s) e salvo(s) na agenda.`);
    } catch (unknownError) {
      toast.error(
        unknownError instanceof Error ? unknownError.message : "Revise os campos do preview.",
      );
    }
  }
}

function FileCard({ file }: { file: AcademicFile }) {
  const failed = file.status === "failed" || file.extractionStatus === "failed";
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <FileArchive className="mt-1 shrink-0 text-primary" />
          <div className="min-w-0">
            <CardTitle className="truncate text-base">{file.originalName}</CardTitle>
            <CardDescription>
              {formatFileSize(file.sizeBytes)} · {file.contentType}
            </CardDescription>
          </div>
        </div>
        <Badge
          variant={failed ? "destructive" : file.status === "processed" ? "default" : "secondary"}
        >
          {statusLabels[file.status]}
        </Badge>
      </CardHeader>
      <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
        {failed ? (
          <AlertTriangle className="size-4 text-destructive" />
        ) : file.status === "processed" ? (
          <CheckCircle2 className="size-4 text-emerald-500" />
        ) : (
          <Loader2 className="size-4 animate-spin text-primary" />
        )}
        {failed
          ? (file.safeError ?? "O processamento falhou.")
          : file.extractionStatus === "pending"
            ? "Aguardando extração estruturada."
            : "Arquivo disponível para as próximas etapas."}
      </CardContent>
    </Card>
  );
}

function FilesLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2].map((item) => (
        <Card key={item}>
          <CardHeader>
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
