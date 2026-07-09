"use client";

import * as React from "react";
import { ArrowRight, Check, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
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

const steps = ["Bem-vindo", "Nome", "Faculdade", "Curso", "Semestre", "Conclusão"];

export function OnboardingFlow() {
  const [step, setStep] = React.useState(0);
  const currentStep = steps[step] ?? steps[0];
  const isLast = step === steps.length - 1;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
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
            Este fluxo ainda não salva dados. A interface está pronta para conectar o banco na
            próxima sprint.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <StepContent step={step} />
          <div className="flex justify-between">
            <Button
              variant="secondary"
              disabled={step === 0}
              onClick={() => setStep((value) => value - 1)}
            >
              Voltar
            </Button>
            <Button onClick={() => setStep((value) => Math.min(value + 1, steps.length - 1))}>
              {isLast ? "Concluir" : "Continuar"}
              {isLast ? <Check data-icon="inline-end" /> : <ArrowRight data-icon="inline-end" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StepContent({ step }: { step: number }) {
  if (step === 0) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        Vamos montar o contexto mínimo para o StudyPilot AI entender sua rotina acadêmica.
      </p>
    );
  }

  if (step === 5) {
    return (
      <p className="text-sm leading-6 text-muted-foreground">
        Tudo pronto. Na próxima etapa do produto, esses dados serão salvos e usados para
        personalizar sua agenda.
      </p>
    );
  }

  if (step === 4) {
    return (
      <Field>
        <Label>Semestre atual</Label>
        <Select defaultValue="5">
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {["1", "2", "3", "4", "5", "6", "7", "8"].map((semester) => (
                <SelectItem key={semester} value={semester}>
                  {semester}º semestre
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
    );
  }

  const labels = ["", "Como você quer ser chamado?", "Faculdade", "Curso"];
  const placeholders = ["", "Mariana", "Universidade Federal", "Engenharia de Software"];

  return (
    <FieldGroup>
      <Field>
        <Label htmlFor={`onboarding-${step}`}>{labels[step]}</Label>
        <Input id={`onboarding-${step}`} placeholder={placeholders[step]} />
      </Field>
    </FieldGroup>
  );
}
