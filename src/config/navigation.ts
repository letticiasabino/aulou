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
  Bell,
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
  { label: "Notificações", href: "/notifications", icon: Bell },
  { label: "Risco acadêmico", href: "/progress", icon: Gauge },
  { label: "Assinatura", href: "/subscription", icon: CreditCard },
  { label: "Analytics", href: "/analytics", icon: Gauge },
  { label: "Feedback", href: "/feedback", icon: Sparkles },
  { label: "Configurações", href: "/settings", icon: Settings },
  { label: "Perfil", href: "/profile", icon: UserRound },
];
