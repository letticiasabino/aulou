import { Footer } from "@/components/ui/footer";
import { Navbar } from "@/components/ui/navbar";

export function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
