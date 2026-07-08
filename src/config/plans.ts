import type { PlanCode, PlanLimit } from "@/types/academic";

export interface PlanDefinition {
  code: PlanCode;
  name: string;
  priceMonthlyCents: number;
  limits: PlanLimit;
  features: string[];
}

export const PLAN_DEFINITIONS: Record<PlanCode, PlanDefinition> = {
  free: {
    code: "free",
    name: "Free",
    priceMonthlyCents: 0,
    limits: {
      uploadsPerMonth: 3,
      aiCreditsPerMonth: 20,
      flashcardsPerMonth: 40,
      quizzesPerMonth: 3,
      priorityProcessing: false,
    },
    features: ["Agenda básica", "Importações simples", "IA limitada"],
  },
  plus: {
    code: "plus",
    name: "Plus",
    priceMonthlyCents: 1990,
    limits: {
      uploadsPerMonth: 30,
      aiCreditsPerMonth: 400,
      flashcardsPerMonth: 600,
      quizzesPerMonth: 40,
      priorityProcessing: false,
    },
    features: ["Flashcards", "Quizzes", "Plano semanal", "Lembretes avançados"],
  },
  pro: {
    code: "pro",
    name: "Pro",
    priceMonthlyCents: 3990,
    limits: {
      uploadsPerMonth: 120,
      aiCreditsPerMonth: 1800,
      flashcardsPerMonth: 2500,
      quizzesPerMonth: 160,
      priorityProcessing: true,
    },
    features: ["Tutor avançado", "Relatórios", "Importações avançadas", "Prioridade"],
  },
};
