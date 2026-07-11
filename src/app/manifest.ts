import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aulou",
    short_name: "Aulou",
    description: "Envie seu cronograma. O Aulou organiza seu semestre.",
    start_url: "/",
    display: "standalone",
    background_color: "#F3F4F6",
    theme_color: "#FF7A00",
    icons: [{ src: "/brand/aulou-icon.png", sizes: "1248x1248", type: "image/png" }],
  };
}
