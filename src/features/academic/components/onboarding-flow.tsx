"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { ArrowRight, Check, GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  academicProfileSchema,
  type AcademicProfileInput,
} from "@/features/academic/schemas/academic-profile-schema";
import { useAcademicContext } from "@/hooks/use-academic-context";
import { academicService } from "@/services/academic.service";
import { analyticsService } from "@/services/analytics.service";

const steps = ["Bem-vindo", "Nome", "Faculdade", "Curso", "Semestre", "Conclusão"];
const currentYear = new Date().getFullYear();

export function AcademicOnboardingFlow() {
  const router = useRouter();
  const { user, context, loading, refresh } = useAcademicContext();
  const [step, setStep] = React.useState(0);
  const currentStep = steps[step] ?? steps[0];
  const isLast = step === steps.length - 1;
  const form = useForm<AcademicProfileInput>({
    resolver: zodResolver(academicProfileSchema),
    defaultValues: {
      displayName: "",
      institutionName: "",
      courseName: "",
      currentSemester: 1,
      academicYear: currentYear,
      timezone: "America/Sao_Paulo",
    },
  });

  React.useEffect(() => {
    if (!context?.profile) {
      return;
    }

    form.reset({
      displayName: context.profile.displayName,
      institutionName: context.profile.institutionName,
      courseName: context.profile.courseName,
      currentSemester: context.profile.currentSemester,
      academicYear: context.profile.academicYear,
      timezone: context.profile.timezone,
    });
  }, [context?.profile, form]);

  async function save(values: AcademicProfileInput) {
    if (!user) {
      toast.error("Entre na sua conta para salvar o onboarding.");
      return;
    }

    try {
      await academicService.saveProfile(user.id, values);
      analyticsService.identify(user.id);
      analyticsService.track("onboarding_completed");
      await refresh();
      toast.success("Contexto acadêmico salvo.");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível salvar.");
    }
  }

  function nextStep() {
    if (isLast) {
      void form.handleSubmit(save)();
      return;
    }

    setStep((value) => Math.min(value + 1, steps.length - 1));
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando onboarding</CardTitle>
          <CardDescription>Estamos preparando seu contexto acadêmico.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <form
      className="mx-auto flex w-full max-w-3xl flex-col gap-6"
      onSubmit={form.handleSubmit(save)}
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Passo {step + 1} de {steps.length}
        </p>
        <div className="grid grid-cols-6 gap-2">
          {steps.map((item, index) => (
            <div
              key={item}
              className={
                index <= step ? "h-1 rounded-full bg-primary" : "h-1 rounded-full bg-muted"
              }
            />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <GraduationCap className="text-primary" aria-hidden="true" />
          <CardTitle>{currentStep}</CardTitle>
          <CardDescription>
            Esses dados serão usados para organizar disciplinas, cronogramas e planos de estudo.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <StepContent step={step} form={form} />
          <div className="flex justify-between">
            <Button
              type="button"
              variant="secondary"
              disabled={step === 0 || form.formState.isSubmitting}
              onClick={() => setStep((value) => value - 1)}
            >
              Voltar
            </Button>
            <Button type="button" disabled={form.formState.isSubmitting} onClick={nextStep}>
              {form.formState.isSubmitting ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : null}
              {isLast ? "Concluir" : "Continuar"}
              {isLast ? <Check data-icon="inline-end" /> : <ArrowRight data-icon="inline-end" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function StepContent({ step, form }: { step: number; form: UseFormReturn<AcademicProfileInput> }) {
  if (step === 0) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        Vamos montar o contexto mínimo para o StudyPilot AI entender sua rotina acadêmica.
      </p>
    );
  }

  if (step === 5) {
    return (
      <div className="rounded-md border bg-background p-4 text-sm leading-6 text-muted-foreground">
        Revise os dados e conclua. Depois você poderá cadastrar disciplinas e professores.
      </div>
    );
  }

  if (step === 1) {
    return (
      <FieldGroup>
        <TextField
          id="displayName"
          label="Como você quer ser chamado?"
          placeholder="Mariana"
          form={form}
        />
      </FieldGroup>
    );
  }

  if (step === 2) {
    return (
      <FieldGroup>
        <TextField
          id="institutionName"
          label="Faculdade"
          placeholder="Universidade Federal"
          form={form}
        />
      </FieldGroup>
    );
  }

  if (step === 3) {
    return (
      <FieldGroup>
        <TextField id="courseName" label="Curso" placeholder="Engenharia de Software" form={form} />
      </FieldGroup>
    );
  }

  return (
    <FieldGroup>
      <Field data-invalid={Boolean(form.formState.errors.currentSemester)}>
        <Label>Semestre atual</Label>
        <Select
          value={String(form.watch("currentSemester"))}
          onValueChange={(value) =>
            form.setValue("currentSemester", Number(value), { shouldValidate: true })
          }
        >
          <SelectTrigger aria-invalid={Boolean(form.formState.errors.currentSemester)}>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((semester) => (
                <SelectItem key={semester} value={String(semester)}>
                  {semester}º semestre
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {form.formState.errors.currentSemester ? (
          <FieldError>{form.formState.errors.currentSemester.message}</FieldError>
        ) : null}
      </Field>
      <TextField
        id="academicYear"
        label="Ano letivo"
        placeholder={String(currentYear)}
        form={form}
      />
    </FieldGroup>
  );
}

function TextField({
  id,
  label,
  placeholder,
  form,
}: {
  id: keyof AcademicProfileInput;
  label: string;
  placeholder: string;
  form: UseFormReturn<AcademicProfileInput>;
}) {
  const error = form.formState.errors[id];

  return (
    <Field data-invalid={Boolean(error)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        {...form.register(id)}
      />
      {error ? <FieldError>{error.message}</FieldError> : null}
    </Field>
  );
}
