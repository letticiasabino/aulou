"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { appNavItems } from "@/config/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r bg-sidebar px-4 py-5 text-sidebar-foreground lg:flex lg:flex-col">
      <Logo href="/dashboard" />
      <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Navegação principal">
        {appNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                isActive &&
                  "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              )}
            >
              <Icon aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-lg border bg-card p-4">
        <p className="text-sm font-medium">Modo fundação</p>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Layout pronto para conectar dados reais nas próximas sprints.
        </p>
      </div>
    </aside>
  );
}
