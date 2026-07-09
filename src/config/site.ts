export const siteConfig = {
  name: "StudyPilot AI",
  description:
    "O estudante envia o cronograma e a IA organiza automaticamente toda sua vida acadêmica.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og",
  links: {
    app: "/dashboard",
    pricing: "/pricing",
    login: "/login",
    register: "/register",
  },
  keywords: [
    "assistente acadêmico",
    "cronograma universitário",
    "agenda de estudos",
    "IA para estudantes",
    "plano de estudos",
  ],
};
