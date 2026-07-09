import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "StudyPilot AI",
    short_name: "StudyPilot",
    description: "Assistente acadêmico com IA para organizar cronogramas e estudos.",
    start_url: "/",
    display: "standalone",
    background_color: "#08070d",
    theme_color: "#8b5cf6",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
