export const siteConfig = {
  name: "Aulou",
  description:
    "Envie cronogramas e materiais da faculdade. O Aulou transforma tudo em agenda, planos de estudo e revisoes.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/brand/aulou-icon.png",
  links: {
    app: "/dashboard",
    pricing: "/pricing",
    login: "/login",
    register: "/register",
  },
  keywords: [
    "Aulou",
    "assistente academico",
    "cronograma universitario",
    "agenda de estudos",
    "IA para estudantes",
    "plano de estudos",
  ],
};
