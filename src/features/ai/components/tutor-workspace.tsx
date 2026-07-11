"use client";

import * as React from "react";
import { AlertTriangle, BookOpen, Bot, FileText, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { aiClientService } from "@/services/ai-client.service";
import type { AISummary, TutorResponse } from "@/services/ai/ai-contracts";
import { analyticsService } from "@/services/analytics.service";
import { filesService } from "@/services/files.service";
import type { AcademicFile } from "@/types/academic-file";

type ChatMessage = { role: "user" | "assistant"; text: string; response?: TutorResponse };

export function TutorWorkspace() {
  const { user } = useAuthContext();
  const [files, setFiles] = React.useState<AcademicFile[]>([]);
  const [materialText, setMaterialText] = React.useState("");
  const [selectedFileId, setSelectedFileId] = React.useState<string>("none");
  const [summary, setSummary] = React.useState<AISummary | null>(null);
  const [question, setQuestion] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [loadingSummary, setLoadingSummary] = React.useState(false);
  const [loadingTutor, setLoadingTutor] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;
    const timer = window.setTimeout(() => {
      void filesService
        .list(user.id)
        .then(setFiles)
        .catch(() => undefined);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user]);

  if (!user)
    return (
      <EmptyState
        icon={Bot}
        title="Sessão necessária"
        description="Entre na sua conta para conversar com o tutor acadêmico."
        actionLabel="Entrar"
        actionHref="/login"
      />
    );
  const userId = user.id;

  async function generateSummary() {
    setLoadingSummary(true);
    setError(null);
    try {
      const result = await aiClientService.summarize({
        userId,
        materialText,
        sourceFileId: selectedFileId === "none" ? null : selectedFileId,
      });
      setSummary(result);
      analyticsService.track("summary_generated", {
        sourceFileId: selectedFileId === "none" ? null : selectedFileId,
      });
      toast.success("Resumo gerado.");
    } catch (unknownError) {
      setError(
        unknownError instanceof Error ? unknownError.message : "Não foi possível gerar o resumo.",
      );
    } finally {
      setLoadingSummary(false);
    }
  }

  async function askTutor() {
    const askedQuestion = question.trim();
    if (!askedQuestion) return;
    setLoadingTutor(true);
    setError(null);
    setMessages((current) => [...current, { role: "user", text: askedQuestion }]);
    setQuestion("");
    try {
      const response = await aiClientService.tutor({
        userId,
        question: askedQuestion,
        materialText,
        sourceFileId: selectedFileId === "none" ? null : selectedFileId,
      });
      setMessages((current) => [
        ...current,
        { role: "assistant", text: response.answer, response },
      ]);
      analyticsService.track("tutor_message_sent", {
        sourceFileId: selectedFileId === "none" ? null : selectedFileId,
      });
    } catch (unknownError) {
      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Não foi possível consultar o tutor.",
      );
    } finally {
      setLoadingTutor(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="flex flex-col gap-6">
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Sparkles className="text-primary" />
              <div>
                <CardTitle>Resumos de estudo</CardTitle>
                <CardDescription>
                  Forneça um material ou selecione um arquivo com texto processado.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Arquivo de referência</Label>
              <Select value={selectedFileId} onValueChange={setSelectedFileId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum arquivo selecionado</SelectItem>
                  {files.map((file) => (
                    <SelectItem key={file.id} value={file.id}>
                      {file.originalName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="material-text">Material ou trecho para estudo</Label>
              <Textarea
                id="material-text"
                value={materialText}
                onChange={(input) => setMaterialText(input.target.value)}
                placeholder="Cole aqui um trecho da aula, apostila ou anotações..."
                className="min-h-40"
              />
              <p className="text-xs text-muted-foreground">
                A IA deve distinguir fatos do material, incertezas e recomendações.
              </p>
            </div>
            <Button
              className="w-fit"
              onClick={() => void generateSummary()}
              disabled={loadingSummary || (!materialText.trim() && selectedFileId === "none")}
            >
              {loadingSummary ? <Loader2 className="animate-spin" /> : <BookOpen />}
              {loadingSummary ? "Gerando..." : "Gerar resumo"}
            </Button>
          </CardContent>
        </Card>
        {loadingSummary ? (
          <SummaryLoading />
        ) : summary ? (
          <SummaryCard summary={summary} />
        ) : (
          <EmptyState
            icon={FileText}
            title="Seu resumo aparecerá aqui"
            description="O resultado será separado em informações extraídas, incertezas e recomendações de estudo."
          />
        )}
      </section>

      <section className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bot className="text-primary" />
              <div>
                <CardTitle>Tutor acadêmico</CardTitle>
                <CardDescription>
                  Faça perguntas usando o contexto da sua agenda e dos seus materiais.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="min-h-72 space-y-3 rounded-md border bg-muted/20 p-4">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  O tutor vai separar fatos, inferências e recomendações na resposta.
                </p>
              ) : (
                messages.map((message, index) => (
                  <ChatBubble key={`${message.role}-${index}`} message={message} />
                ))
              )}
              {loadingTutor ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Consultando contexto...
                </div>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tutor-question">Sua pergunta</Label>
              <Textarea
                id="tutor-question"
                value={question}
                onChange={(input) => setQuestion(input.target.value)}
                onKeyDown={(input) => {
                  if (input.key === "Enter" && (input.ctrlKey || input.metaKey)) void askTutor();
                }}
                placeholder="Ex.: quais provas confirmadas estão mais próximas?"
              />
            </div>
            <Button onClick={() => void askTutor()} disabled={loadingTutor || !question.trim()}>
              <Send /> Perguntar ao tutor
            </Button>
          </CardContent>
        </Card>
        {error ? (
          <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <span>{error}</span>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function SummaryCard({ summary }: { summary: AISummary }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do material</CardTitle>
        <CardDescription>{summary.overview}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <PointList
          title="Informações extraídas"
          items={summary.extractedInformation.map((item) => item.text)}
        />
        <PointList title="Pontos principais" items={summary.keyPoints.map((item) => item.text)} />
        <PointList
          title="Incertezas"
          items={summary.uncertainties}
          empty="Nenhuma incerteza declarada."
        />
        <PointList title="Recomendações de estudo" items={summary.studyRecommendations} />
        <div className="flex flex-wrap gap-2">
          {summary.sourceFileIds.map((id) => (
            <Badge key={id} variant="outline">
              Fonte: {id}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PointList({
  title,
  items,
  empty = "Nenhuma informação disponível.",
}: {
  title: string;
  items: string[];
  empty?: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length ? (
        <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="rounded-md border bg-background p-3">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{empty}</p>
      )}
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  return (
    <div
      className={
        message.role === "user"
          ? "ml-8 rounded-md bg-primary p-3 text-sm text-primary-foreground"
          : "mr-8 rounded-md border bg-background p-3 text-sm"
      }
    >
      <p>{message.text}</p>
      {message.response?.sourceFileIds.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {message.response.sourceFileIds.map((id) => (
            <Badge key={id} variant="outline">
              Fonte: {id}
            </Badge>
          ))}
        </div>
      ) : null}
      {message.response?.missingInformation.length ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Falta contexto: {message.response.missingInformation.join(" ")}
        </p>
      ) : null}
    </div>
  );
}

function SummaryLoading() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="grid gap-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  );
}
