"use client";

import * as React from "react";
import { CheckCircle2, MessageSquare, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { feedbackSchema, type FeedbackInput } from "@/schemas/feedback";
import { feedbackService } from "@/services/feedback.service";
import { useAuthContext } from "@/features/auth/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function FeedbackWorkspace() {
  const { user } = useAuthContext();
  const [sent, setSent] = React.useState(false);
  const [category, setCategory] = React.useState<FeedbackInput["category"]>("experience");
  const [rating, setRating] = React.useState(5);
  const form = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { category: "experience", rating: 5, message: "" },
  });
  if (!user)
    return (
      <EmptyState
        icon={MessageSquare}
        title="Sessão necessária"
        description="Entre na sua conta para enviar feedback sobre o beta."
        actionLabel="Entrar"
        actionHref="/login"
      />
    );
  const userId = user.id;
  async function submit(input: FeedbackInput) {
    await feedbackService.submit(userId, input);
    setSent(true);
    form.reset({ category: "experience", rating: 5, message: "" });
  }
  if (sent)
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center">
          <CheckCircle2 className="size-10 text-emerald-500" />
          <h1 className="text-xl font-semibold">Feedback recebido</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            Obrigado por ajudar a deixar o Aulou mais útil para estudantes.
          </p>
          <Button variant="outline" onClick={() => setSent(false)}>
            Enviar outro
          </Button>
        </CardContent>
      </Card>
    );
  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <Badge className="w-fit">Beta fechado</Badge>
        <CardTitle className="mt-2">Ajude a moldar o Aulou</CardTitle>
        <CardDescription>
          Conte o que funcionou, o que confundiu ou o que faria seu semestre ficar mais leve.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-6" onSubmit={form.handleSubmit(submit)}>
          <FieldGroup>
            <Field data-invalid={Boolean(form.formState.errors.category)}>
              <Label htmlFor="feedback-category">Tipo de feedback</Label>
              <Select
                value={category}
                onValueChange={(value) => {
                  const next = value as FeedbackInput["category"];
                  setCategory(next);
                  form.setValue("category", next, { shouldValidate: true });
                }}
              >
                <SelectTrigger id="feedback-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="experience">Experiência</SelectItem>
                  <SelectItem value="bug">Problema</SelectItem>
                  <SelectItem value="idea">Ideia</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.category ? (
                <FieldError>{form.formState.errors.category.message}</FieldError>
              ) : null}
            </Field>
            <Field>
              <Label>Como você avalia esta versão?</Label>
              <div className="flex gap-2" role="radiogroup" aria-label="Avaliação de 1 a 5">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={rating === value}
                    aria-label={`${value} de 5`}
                    className={`size-10 rounded-md border text-sm ${rating === value ? "border-primary bg-primary text-primary-foreground" : "bg-background"}`}
                    onClick={() => {
                      setRating(value);
                      form.setValue("rating", value, { shouldValidate: true });
                    }}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </Field>
            <Field data-invalid={Boolean(form.formState.errors.message)}>
              <Label htmlFor="feedback-message">Mensagem</Label>
              <Textarea
                id="feedback-message"
                className="min-h-36"
                placeholder="Ex.: importar meu cronograma me poupou..."
                {...form.register("message")}
              />
              {form.formState.errors.message ? (
                <FieldError>{form.formState.errors.message.message}</FieldError>
              ) : null}
            </Field>
          </FieldGroup>
          <Button type="submit" className="w-fit" disabled={form.formState.isSubmitting}>
            <Send />
            {form.formState.isSubmitting ? "Enviando..." : "Enviar feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
