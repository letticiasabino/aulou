import {
  Bot,
  CalendarDays,
  CreditCard,
  FileUp,
  Gauge,
  GraduationCap,
  Library,
  Settings,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";

export const marketingNavItems = [
  { label: "Como funciona", href: "/#como-funciona" },
  { label: "Benefícios", href: "/#beneficios" },
  { label: "Funcionalidades", href: "/#funcionalidades" },
  { label: "Planos", href: "/pricing" },
];

export const appNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: Gauge },
  { label: "Agenda", href: "/calendar", icon: CalendarDays },
  { label: "Arquivos", href: "/files", icon: FileUp },
  { label: "Disciplinas", href: "/subjects", icon: GraduationCap },
  { label: "Professores", href: "/teachers", icon: UsersRound },
  { label: "Plano", href: "/planner", icon: Sparkles },
  { label: "Flashcards", href: "/flashcards", icon: Library },
  { label: "Quizzes", href: "/quizzes", icon: CreditCard },
  { label: "Tutor IA", href: "/ai", icon: Bot },
  { label: "Configurações", href: "/settings", icon: Settings },
  { label: "Perfil", href: "/profile", icon: UserRound },
];
